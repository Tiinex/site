#!/usr/bin/env python3
"""Deterministic Playthings motion-sheet postprocess tooling.

The tool never invents image content. It operates on whole alpha-isolated frames:
inspect, stabilize, repack, diagnose, preview, and recorded whole-frame surgery.
Canonical generated source bytes must be preserved separately from derived outputs.
"""
from __future__ import annotations
from PIL import Image, ImageSequence
from pathlib import Path
import argparse, hashlib, json
import numpy as np

DEFAULT_PHASES = ["CONTACT A","DOWN A","PASSING A","UP A","CONTACT B","DOWN B","PASSING B","UP B"]

def alpha_hash(im: Image.Image) -> str:
    return hashlib.sha256(im.convert("RGBA").getchannel("A").tobytes()).hexdigest()

def split_grid(im: Image.Image, rows: int = 2, cols: int = 4) -> tuple[list[Image.Image], int, int]:
    im = im.convert("RGBA")
    w,h = im.size
    if w % cols or h % rows:
        raise ValueError(f"image {w}x{h} is not evenly divisible by grid {rows}x{cols}")
    cw,ch = w//cols,h//rows
    frames=[]
    for i in range(rows*cols):
        r,c=divmod(i,cols)
        frames.append(im.crop((c*cw,r*ch,(c+1)*cw,(r+1)*ch)))
    return frames,cw,ch

def bbox_alpha(fr: Image.Image, threshold: int = 1):
    a=np.array(fr.convert("RGBA").getchannel("A"))
    ys,xs=np.where(a>threshold)
    if len(xs)==0: return None
    return (int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1))

def floor_y(fr: Image.Image, threshold: int = 16) -> int:
    a=np.array(fr.convert("RGBA").getchannel("A"))
    ys,_=np.where(a>threshold)
    return int(ys.max()+1) if len(ys) else fr.height

def upper_anchor(fr: Image.Image, threshold: int = 16) -> tuple[float,float]:
    rgba=fr.convert("RGBA")
    a=np.array(rgba.getchannel("A"),dtype=np.float64)
    b=bbox_alpha(rgba,threshold)
    if b is None: return (rgba.width/2,rgba.height/2)
    x0,y0,x1,y1=b; h=y1-y0
    ya=y0+int(.10*h); yb=max(ya+1,y0+int(.58*h))
    band=a[ya:yb,x0:x1]
    yy,xx=np.mgrid[ya:yb,x0:x1]
    s=band.sum()
    if s<=0: return ((x0+x1)/2,(y0+y1)/2)
    return (float((xx*band).sum()/s),float((yy*band).sum()/s))

def inspect(path: Path, rows=2, cols=4) -> dict:
    im=Image.open(path).convert("RGBA")
    frames,cw,ch=split_grid(im,rows,cols)
    return {
        "source":str(path),"size":list(im.size),"mode":im.mode,
        "sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
        "alpha_extrema":list(im.getchannel("A").getextrema()),"grid":[rows,cols],"cell_size":[cw,ch],
        "frames":[{
            "index":i+1,"bbox":bbox_alpha(fr),"floor_y":floor_y(fr),
            "upper_anchor":[round(v,3) for v in upper_anchor(fr)],
            "alpha_extrema":list(fr.getchannel("A").getextrema())
        } for i,fr in enumerate(frames)]
    }

def stabilize(frames: list[Image.Image], canvas=(440,560), target_anchor=(220,180), target_floor=520):
    out=[]; meta=[]
    for i,fr in enumerate(frames):
        ax,ay=upper_anchor(fr); fy=floor_y(fr)
        dx=int(round(target_anchor[0]-ax)); dy=int(round(target_floor-fy))
        can=Image.new("RGBA",canvas,(0,0,0,0)); can.alpha_composite(fr.convert("RGBA"),(dx,dy))
        out.append(can); meta.append({"index":i+1,"anchor":[ax,ay],"floor_y":fy,"dx":dx,"dy":dy})
    return out,meta

def repack(frames: list[Image.Image], rows=2, cols=4, cell_size=None, safe_margin=22):
    if len(frames)!=rows*cols: raise ValueError("frame count does not match grid")
    bboxes=[bbox_alpha(fr,1) for fr in frames]
    if any(b is None for b in bboxes): raise ValueError("empty frame cannot be repacked")
    sizes=[(b[2]-b[0],b[3]-b[1]) for b in bboxes]
    if cell_size is None: cell_size=frames[0].size
    cw,ch=cell_size
    max_w=max(w for w,h in sizes); max_h=max(h for w,h in sizes)
    scale=min((cw-2*safe_margin)/max_w,(ch-2*safe_margin)/max_h,1.0)
    cells=[]; placements=[]
    for i,(fr,b) in enumerate(zip(frames,bboxes),1):
        subject=fr.convert("RGBA").crop(b)
        if scale < .999999:
            nw=max(1,round(subject.width*scale)); nh=max(1,round(subject.height*scale))
            subject=subject.resize((nw,nh),Image.Resampling.LANCZOS)
        x=(cw-subject.width)//2; y=ch-safe_margin-subject.height
        cell=Image.new("RGBA",(cw,ch),(0,0,0,0)); cell.alpha_composite(subject,(x,y)); cells.append(cell)
        placements.append({"index":i,"source_bbox":list(b),"scale":scale,"dest_xy":[x,y],"dest_size":list(subject.size),
                           "margins":{"left":x,"top":y,"right":cw-x-subject.width,"bottom":safe_margin}})
    sheet=Image.new("RGBA",(cw*cols,ch*rows),(0,0,0,0))
    for i,cell in enumerate(cells):
        r,c=divmod(i,cols); sheet.alpha_composite(cell,(c*cw,r*ch))
    return sheet,cells,{"grid":[rows,cols],"cell_size":[cw,ch],"safe_margin_px":safe_margin,"shared_scale":scale,"placements":placements}

def norm_alpha(fr,size=(220,270)):
    return np.array(fr.convert("RGBA").getchannel("A").resize(size,Image.Resampling.LANCZOS),dtype=np.float32)/255.0

def iou(a,b,thr=.1):
    A=a>thr;B=b>thr;u=np.logical_or(A,B).sum();return float(np.logical_and(A,B).sum()/u) if u else 1.0

def diagnose(frames):
    masks=[norm_alpha(x) for x in frames]; adj=[]; pairs=[]
    for i in range(len(frames)):
        j=(i+1)%len(frames); adj.append({"from":i+1,"to":j+1,"iou":iou(masks[i],masks[j]),"alpha_mae":float(np.abs(masks[i]-masks[j]).mean())})
    for i in range(len(frames)):
        for j in range(i+1,len(frames)):
            pairs.append({"a":i+1,"b":j+1,"iou":iou(masks[i],masks[j]),"alpha_mae":float(np.abs(masks[i]-masks[j]).mean())})
    return {"adjacent":adj,"most_similar":sorted(pairs,key=lambda x:(-x["iou"],x["alpha_mae"]))}

def save_webp(frames,path,durations=None):
    path=Path(path); durations=durations or [120]*len(frames)
    frames[0].save(path,format="WEBP",save_all=True,append_images=frames[1:],duration=durations,loop=0,lossless=True,quality=100,method=6)
    dec=[x.convert("RGBA") for x in ImageSequence.Iterator(Image.open(path))]
    return {"path":str(path),"frames":len(dec),"alpha_exact": [alpha_hash(x) for x in frames]==[alpha_hash(x) for x in dec],
            "alpha_extrema":[list(x.getchannel("A").getextrema()) for x in dec]}

def apply_surgery(frames,manifest):
    seq=[x.copy() for x in frames]; durations=[120]*len(seq); log=[]
    for op in manifest.get("operations",[]):
        kind=op["op"]
        if kind in ("copy","replace"):
            seq[int(op["to"])-1]=seq[int(op["from"])-1].copy()
        elif kind=="drop":
            idx=int(op["frame"])-1; seq.pop(idx); durations.pop(idx)
        elif kind=="duplicate":
            idx=int(op["frame"])-1; at=int(op.get("at",idx+2))-1; seq.insert(at,seq[idx].copy()); durations.insert(at,durations[idx])
        elif kind=="reorder":
            order=[int(x)-1 for x in op["order"]]; seq=[seq[x] for x in order]; durations=[durations[x] for x in order]
        elif kind=="duration": durations[int(op["frame"])-1]=int(op["milliseconds"])
        else: raise ValueError(f"unknown operation {kind}")
        log.append(op)
    return seq,durations,log

def main():
    ap=argparse.ArgumentParser(); sp=ap.add_subparsers(dest="cmd",required=True)
    p=sp.add_parser("inspect"); p.add_argument("sheet"); p.add_argument("--out")
    p=sp.add_parser("repack"); p.add_argument("sheet"); p.add_argument("output"); p.add_argument("--safe-margin",type=int,default=22); p.add_argument("--report")
    p=sp.add_parser("diagnose"); p.add_argument("sheet"); p.add_argument("--out")
    p=sp.add_parser("preview"); p.add_argument("sheet"); p.add_argument("webp")
    p=sp.add_parser("surgery"); p.add_argument("sheet"); p.add_argument("manifest"); p.add_argument("webp")
    a=ap.parse_args(); src=Path(a.sheet)
    if a.cmd=="inspect": r=inspect(src)
    else:
        im=Image.open(src).convert("RGBA"); frames,cw,ch=split_grid(im)
        if a.cmd=="repack":
            sheet,cells,meta=repack(frames,cell_size=(cw,ch),safe_margin=a.safe_margin); sheet.save(a.output); r={"source_sha256":hashlib.sha256(src.read_bytes()).hexdigest(),"output":str(a.output),**meta}
            if a.report: Path(a.report).write_text(json.dumps(r,indent=2),encoding="utf-8")
        elif a.cmd=="diagnose":
            stab,meta=stabilize(frames); r={"stabilization":meta,**diagnose(stab)}
        elif a.cmd=="preview":
            stab,_=stabilize(frames); r=save_webp(stab,a.webp)
        elif a.cmd=="surgery":
            stab,_=stabilize(frames); manifest=json.loads(Path(a.manifest).read_text(encoding="utf-8")); seq,durations,log=apply_surgery(stab,manifest); r={"operations":log,"preview":save_webp(seq,a.webp,durations)}
    text=json.dumps(r,indent=2)
    if getattr(a,"out",None): Path(a.out).write_text(text,encoding="utf-8")
    print(text)

if __name__=="__main__": main()
