#!/usr/bin/env python3
"""Deterministically render color-coded humanoid motion authorities from a GLB animation library.

The output is a transparent pose authority, not final Playthings art. It samples one named
animation at fixed timestamps and renders major humanoid bones with stable left/right colors.

Example:
  python ual_motion_template_factory.py \
    reference/playthings/external/ual-standard/UAL1_Standard.glb \
    --animation Walk_Loop --outdir /tmp/ual-walk --frames 8 --directions 8
"""
from __future__ import annotations
from PIL import Image, ImageDraw
from pathlib import Path
import argparse, json, math, struct
import numpy as np

COMP_DTYPES={5120:np.int8,5121:np.uint8,5122:np.int16,5123:np.uint16,5125:np.uint32,5126:np.float32}
TYPE_N={"SCALAR":1,"VEC2":2,"VEC3":3,"VEC4":4,"MAT2":4,"MAT3":9,"MAT4":16}
EDGES=[
("pelvis","spine_01"),("spine_01","spine_02"),("spine_02","spine_03"),("spine_03","neck_01"),("neck_01","Head"),
("spine_03","clavicle_l"),("clavicle_l","upperarm_l"),("upperarm_l","lowerarm_l"),("lowerarm_l","hand_l"),
("spine_03","clavicle_r"),("clavicle_r","upperarm_r"),("upperarm_r","lowerarm_r"),("lowerarm_r","hand_r"),
("pelvis","thigh_l"),("thigh_l","calf_l"),("calf_l","foot_l"),("foot_l","ball_l"),
("pelvis","thigh_r"),("thigh_r","calf_r"),("calf_r","foot_r"),("foot_r","ball_r")]
COLORS={"torso":(65,70,80,255),"left_arm":(255,125,40,255),"right_arm":(50,155,255,255),
        "left_leg":(235,65,95,255),"right_leg":(80,205,110,255),"head":(245,205,70,255),"joint":(35,35,35,255)}

class GLB:
    def __init__(self,path:Path):
        data=path.read_bytes(); magic,version,length=struct.unpack_from('<4sII',data,0)
        if magic!=b'glTF' or version!=2: raise ValueError('Expected GLB v2')
        off=12; self.gltf=None; self.blob=None
        while off<length:
            clen,ctype=struct.unpack_from('<II',data,off); off+=8; c=data[off:off+clen]; off+=clen
            if ctype==0x4E4F534A: self.gltf=json.loads(c.decode('utf-8').rstrip('\x00 '))
            elif ctype==0x004E4942: self.blob=c
        if self.gltf is None or self.blob is None: raise ValueError('Missing GLB chunks')
        self.parents={}
        for pi,n in enumerate(self.gltf['nodes']):
            for ch in n.get('children',[]): self.parents[ch]=pi
        self.name_to_node={n.get('name'):i for i,n in enumerate(self.gltf['nodes']) if n.get('name')}
        self.anims={a.get('name',f'anim{i}'):a for i,a in enumerate(self.gltf.get('animations',[]))}
    def accessor(self,idx):
        a=self.gltf['accessors'][idx]; bv=self.gltf['bufferViews'][a['bufferView']]
        dtype=COMP_DTYPES[a['componentType']]; ncomp=TYPE_N[a['type']]; count=a['count']
        offset=bv.get('byteOffset',0)+a.get('byteOffset',0); item=np.dtype(dtype).itemsize*ncomp; stride=bv.get('byteStride',item)
        if stride==item:
            arr=np.frombuffer(self.blob,dtype=dtype,count=count*ncomp,offset=offset).reshape(count,ncomp)
        else:
            arr=np.empty((count,ncomp),dtype=dtype)
            for i in range(count): arr[i]=np.frombuffer(self.blob,dtype=dtype,count=ncomp,offset=offset+i*stride)
        if a.get('normalized'):
            arr=arr/np.iinfo(dtype).max if np.issubdtype(dtype,np.unsignedinteger) else np.maximum(arr/np.iinfo(dtype).max,-1)
        return arr.astype(np.float64)
    def tracks(self,name):
        anim=self.anims[name]; tracks={}; duration=0.0
        for ch in anim['channels']:
            s=anim['samplers'][ch['sampler']]; times=self.accessor(s['input'])[:,0]; vals=self.accessor(s['output'])
            tracks.setdefault(ch['target']['node'],{})[ch['target']['path']]=(times,vals,s.get('interpolation','LINEAR'))
            duration=max(duration,float(times[-1]))
        return tracks,duration

def qmat(q):
    x,y,z,w=map(float,q); n=math.sqrt(x*x+y*y+z*z+w*w)
    if not n:return np.eye(4)
    x,y,z,w=x/n,y/n,z/n,w/n; xx,yy,zz=x*x,y*y,z*z; xy,xz,yz=x*y,x*z,y*z; wx,wy,wz=w*x,w*y,w*z
    m=np.eye(4); m[:3,:3]=[[1-2*(yy+zz),2*(xy-wz),2*(xz+wy)],[2*(xy+wz),1-2*(xx+zz),2*(yz-wx)],[2*(xz-wy),2*(yz+wx),1-2*(xx+yy)]]
    return m

def trs(t,q,s):
    m=qmat(q); m[:3,:3]=m[:3,:3]@np.diag(s); m[:3,3]=t; return m

def sample(times,vals,t,quat=False):
    if len(times)==1:return vals[0].copy()
    j=max(0,min(np.searchsorted(times,t,side='right')-1,len(times)-2)); t0,t1=times[j],times[j+1]; u=0 if t1==t0 else (t-t0)/(t1-t0)
    a,b=vals[j].copy(),vals[j+1].copy()
    if quat:
        if np.dot(a,b)<0:b=-b
        q=(1-u)*a+u*b; return q/np.linalg.norm(q)
    return (1-u)*a+u*b

def pose_globals(glb:GLB,anim_name,t):
    tracks,duration=glb.tracks(anim_name); local={}
    for i,n in enumerate(glb.gltf['nodes']):
        if 'matrix' in n: local[i]=np.array(n['matrix'],float).reshape(4,4).T; continue
        bt=np.array(n.get('translation',[0,0,0]),float); bq=np.array(n.get('rotation',[0,0,0,1]),float); bs=np.array(n.get('scale',[1,1,1]),float)
        tr=tracks.get(i,{})
        if 'translation' in tr: bt=sample(tr['translation'][0],tr['translation'][1],t)
        if 'rotation' in tr: bq=sample(tr['rotation'][0],tr['rotation'][1],t,True)
        if 'scale' in tr: bs=sample(tr['scale'][0],tr['scale'][1],t)
        local[i]=trs(bt,bq,bs)
    glob={}
    def calc(i):
        if i in glob:return glob[i]
        glob[i]=calc(glb.parents[i])@local[i] if i in glb.parents else local[i]; return glob[i]
    for i in range(len(glb.gltf['nodes'])):calc(i)
    return glob,duration

def world_points(glb,glob):
    out={}
    for name,node in glb.name_to_node.items():
        p=glob[node]@np.array([0,0,0,1.]); out[name]=p[:3]
    return out

def project(points,yaw):
    a=math.radians(yaw); c,s=math.cos(a),math.sin(a); out={}
    for n,(x,y,z) in points.items(): out[n]=np.array([c*x+s*z,y,-s*x+c*z])
    return out

def edge_color(a,b):
    s=a+' '+b
    if '_l' in s:return COLORS['left_arm'] if any(x in s for x in ('upperarm','lowerarm','hand','clavicle')) else COLORS['left_leg']
    if '_r' in s:return COLORS['right_arm'] if any(x in s for x in ('upperarm','lowerarm','hand','clavicle')) else COLORS['right_leg']
    return COLORS['torso']

def render(points,size,pad):
    W,H=size; names=set(sum(([a,b] for a,b in EDGES),[])); arr=np.array([points[n][:2] for n in names if n in points])
    minx,miny=arr.min(0); maxx,maxy=arr.max(0); scale=min((W-2*pad)/max(maxx-minx,1e-6),(H-2*pad)/max(maxy-miny,1e-6)); cx=(minx+maxx)/2
    def xy(p):return (W/2+(p[0]-cx)*scale,H-pad-(p[1]-miny)*scale)
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im); lw=max(6,round(min(W,H)*.024))
    for a,b in sorted(EDGES,key=lambda e:(points[e[0]][2]+points[e[1]][2])/2):
        if a in points and b in points:d.line((xy(points[a]),xy(points[b])),fill=edge_color(a,b),width=lw)
    hp=xy(points['Head']); r=lw*1.15; d.ellipse((hp[0]-r,hp[1]-r,hp[0]+r,hp[1]+r),fill=COLORS['head'],outline=COLORS['joint'],width=2)
    for n in ('pelvis','spine_03','upperarm_l','lowerarm_l','hand_l','upperarm_r','lowerarm_r','hand_r','thigh_l','calf_l','foot_l','thigh_r','calf_r','foot_r'):
        if n in points:
            q=xy(points[n]); jr=max(3,lw//3); d.ellipse((q[0]-jr,q[1]-jr,q[0]+jr,q[1]+jr),fill=COLORS['joint'])
    return im

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('glb'); ap.add_argument('--animation',default='Walk_Loop'); ap.add_argument('--outdir',required=True); ap.add_argument('--frames',type=int,default=8); ap.add_argument('--directions',type=int,default=8); ap.add_argument('--side-yaw',type=float,default=0)
    a=ap.parse_args(); out=Path(a.outdir); out.mkdir(parents=True,exist_ok=True); glb=GLB(Path(a.glb))
    if a.animation not in glb.anims: raise SystemExit(f'Unknown animation {a.animation}; available: {sorted(glb.anims)}')
    _,duration=glb.tracks(a.animation); times=[duration*i/a.frames for i in range(a.frames)]
    # 2x4-ish compact authority if eight frames, otherwise a single row.
    cols=4 if a.frames==8 else a.frames; rows=math.ceil(a.frames/cols); cw,ch=384,512
    sheet=Image.new('RGBA',(cols*cw,rows*ch),(0,0,0,0)); frames=[]
    for i,t in enumerate(times):
        g,_=pose_globals(glb,a.animation,t); fr=render(project(world_points(glb,g),a.side_yaw),(cw,ch),36); frames.append(fr); sheet.alpha_composite(fr,((i%cols)*cw,(i//cols)*ch))
    p2=out/f'{a.animation}-colored-authority-{rows}x{cols}.png'; sheet.save(p2)
    pweb=out/f'{a.animation}-colored-authority-preview.webp'; frames[0].save(pweb,format='WEBP',save_all=True,append_images=frames[1:],duration=[120]*len(frames),loop=0,lossless=True,quality=100,method=6)
    # Directional grid.
    cell=256; grid=Image.new('RGBA',(a.frames*cell,a.directions*cell),(0,0,0,0)); yaws=[a.side_yaw+i*(360/a.directions) for i in range(a.directions)]
    for r,yaw in enumerate(yaws):
        for c,t in enumerate(times):
            g,_=pose_globals(glb,a.animation,t); grid.alpha_composite(render(project(world_points(glb,g),yaw),(cell,cell),24),(c*cell,r*cell))
    pgrid=out/f'{a.animation}-colored-authority-{a.directions}x{a.frames}.png'; grid.save(pgrid)
    report={'schema':'tiinex.playthings.ual-template-factory.v0.1','source':str(a.glb),'animation':a.animation,'duration_seconds':duration,'sample_times_seconds':times,'directions':a.directions,'yaws':yaws,'colors':COLORS,'outputs':[p2.name,pgrid.name,pweb.name]}
    (out/'template-factory-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report,indent=2))

if __name__=='__main__':main()
