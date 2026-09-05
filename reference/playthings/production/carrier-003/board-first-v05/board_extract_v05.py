from __future__ import annotations
from pathlib import Path
from dataclasses import dataclass, asdict
from PIL import Image
import numpy as np, cv2, json, statistics
from scipy.signal import find_peaks

@dataclass(frozen=True)
class BoardContract:
    top_count:int=3
    walk_count:int=8
    band_threshold_frac:float=.15
    review_cell:int=256
    review_target_h:int=208
    review_baseline:int=240
    world_cell:int=64
    world_target_h:int=50
    world_baseline:int=59
C=BoardContract()

def estimate_bg(arr):
    h,w,_=arr.shape; b=max(4,min(h,w)//45)
    vals=np.concatenate([arr[:b].reshape(-1,3),arr[-b:].reshape(-1,3),arr[:,:b].reshape(-1,3),arr[:,-b:].reshape(-1,3)],0)
    lum=vals.mean(1); vals=vals[lum>=np.quantile(lum,.65)]
    return np.median(vals,0)

def mask_from_bg(arr,thr=18):
    arr=arr.astype(np.float32); bg=estimate_bg(arr); dist=np.sqrt(((arr-bg)**2).sum(2)); m=(dist>thr).astype(np.uint8)*255
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((2,2),np.uint8),iterations=1)
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8),iterations=1)
    return m,bg

def raw_mask(crop,thr=18): return mask_from_bg(np.asarray(crop.convert('RGB')),thr)

def significant_runs(signal,frac,min_len):
    active=signal>signal.max()*frac; runs=[]; s=None
    for i,v in enumerate(active):
        if v and s is None:s=i
        if s is not None and ((not v) or i==len(active)-1):
            e=i if not v else i+1
            if e-s>=min_len:runs.append((s,e))
            s=None
    return runs

def detect_layout_bands(im):
    m,_=mask_from_bg(np.asarray(im.convert('RGB')))
    prof=m.astype(bool).sum(1).astype(np.float32); prof=cv2.GaussianBlur(prof.reshape(-1,1),(0,0),8).ravel()
    runs=significant_runs(prof,C.band_threshold_frac,max(20,round(im.height*.08)))
    # top and walk are the first two large foreground bands by vertical order.
    if len(runs)<2: raise ValueError(f'board layout: expected >=2 foreground bands, got {runs}')
    return runs[0],runs[1],runs,prof

def detect_walk_centers(im,y0,y1):
    row=im.crop((0,y0,im.width,y1)); m,_=raw_mask(row); prof=m.astype(bool).sum(0).astype(np.float64)
    sigma=max(5,im.width/180); prof=cv2.GaussianBlur(prof.reshape(1,-1),(0,0),sigma).ravel()
    # Weighted 1D k-means over foreground occupancy. This tolerates overlapping silhouettes
    # and imperfect source spacing while preserving the expected eight-frame order.
    W=im.width; k=C.walk_count; x=np.arange(W,dtype=np.float64)
    centers=np.linspace(W/(2*k),W-W/(2*k),k)
    for _ in range(40):
        labels=np.abs(x[:,None]-centers[None,:]).argmin(axis=1); nxt=centers.copy()
        for j in range(k):
            sel=(labels==j); weights=prof[sel]
            if weights.sum()>0: nxt[j]=(x[sel]*weights).sum()/weights.sum()
        if np.max(np.abs(nxt-centers))<.1: centers=nxt; break
        centers=nxt
    return sorted(map(lambda z:int(round(z)),centers))

def regions_from_centers(cs,width,y0,y1):
    b=[0]+[(cs[i]+cs[i+1])//2 for i in range(len(cs)-1)]+[width]; return [(b[i],y0,b[i+1],y1) for i in range(len(cs))]

def subject_mask(crop):
    m,bg=raw_mask(crop); n,lab,stats,cent=cv2.connectedComponentsWithStats(m,8); H,W=m.shape; cand=[]
    for i in range(1,n):
        x,y,w,h,area=stats[i]; cx,cy=cent[i]
        if area<max(70,H*W*.001):continue
        touch=(x<=1)+(y<=1)+(x+w>=W-1)+(y+h>=H-1)
        center=max(.12,1-abs(cx-W/2)/(W*.62)); tall=.3+.7*min(1,h/(H*.65)); border=.12 if touch else 1
        shape=.15 if (w>W*.7 and h<H*.25) else 1
        cand.append((area*center*tall*border*shape,area,i,x,y,w,h))
    if not cand:return m,bg
    cand.sort(reverse=True); _,pa,pi,px,py,pw,ph=cand[0]; keep=np.where(lab==pi,255,0).astype(np.uint8)
    # only add non-shadow nearby components
    for score,area,i,x,y,w,h in cand[1:]:
        if area<pa*.03 or (w>h*3 and h<H*.15):continue
        dx=max(0,max(px-(x+w),x-(px+pw)));dy=max(0,max(py-(y+h),y-(py+ph)))
        if dx<W*.16 and dy<H*.12:keep[lab==i]=255
    return keep,bg

def extract_walk(crop,pad=7):
    mask,bg=subject_mask(crop); ys,xs=np.where(mask>0)
    bbox=(0,0,crop.width,crop.height) if not len(xs) else (max(0,int(xs.min())-pad),max(0,int(ys.min())-pad),min(crop.width,int(xs.max()+1)+pad),min(crop.height,int(ys.max()+1)+pad))
    rgba=np.asarray(crop.convert('RGBA')).copy(); rgba[:,:,3]=cv2.GaussianBlur(mask,(0,0),.7); out=Image.fromarray(rgba).crop(bbox)
    a=np.asarray(out.getchannel('A')); yy,xx=np.where(a>16)
    if len(xx):out=out.crop((int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)))
    return out,{'bbox':list(map(int,bbox)),'trimmed_size':list(out.size),'method':'foreground-center-component'}

def extract_top(crop):
    arr=np.asarray(crop.convert('RGB'));H,W,_=arr.shape; mask=np.zeros((H,W),np.uint8);bgd=np.zeros((1,65),np.float64);fgd=np.zeros((1,65),np.float64)
    mx=max(18,round(W*.12));my=max(3,round(H*.01));rect=(mx,my,max(2,W-2*mx),max(2,H-2*my));cv2.grabCut(arr,mask,rect,bgd,fgd,5,cv2.GC_INIT_WITH_RECT)
    fg=np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype(np.uint8);n,lab,stats,cent=cv2.connectedComponentsWithStats(fg,8);cand=[]
    for i in range(1,n):
        x,y,w,h,area=stats[i];cx,cy=cent[i]
        if area<150:continue
        cand.append((area*max(.1,1-abs(cx-W/2)/(W*.55))*(.3+.7*min(1,h/(H*.7))),i))
    if cand:_,pi=max(cand);fg=np.where(lab==pi,255,0).astype(np.uint8)
    ys,xs=np.where(fg>0);bbox=(0,0,W,H) if not len(xs) else (max(0,int(xs.min())-4),max(0,int(ys.min())-4),min(W,int(xs.max()+1)+4),min(H,int(ys.max()+1)+4))
    return Image.fromarray(np.dstack([arr,fg])).crop(bbox),{'bbox':list(map(int,bbox)),'trimmed_size':[bbox[2]-bbox[0],bbox[3]-bbox[1]],'method':'grabcut-central-subject'}

def render_common(subjects,size,target_h,baseline):
    hs=[s.height for s in subjects];med=statistics.median(hs);scale=target_h/med;out=[]
    for s in subjects:
        nw=max(1,round(s.width*scale));nh=max(1,round(s.height*scale));r=s.resize((nw,nh),Image.Resampling.LANCZOS);c=Image.new('RGBA',(size,size),(0,0,0,0));c.alpha_composite(r,((size-nw)//2,baseline-nh));out.append(c)
    return out,scale,hs,med

def process(src,out):
    src=Path(src);out=Path(out);out.mkdir(parents=True,exist_ok=True);im=Image.open(src).convert('RGB');W,H=im.size
    top_band,walk_band,all_runs,_=detect_layout_bands(im);ty0,ty1=top_band;wy0,wy1=walk_band
    cw=W//C.top_count;top_regs=[(i*cw,ty0,(i+1)*cw,ty1) for i in range(C.top_count)]
    wc=detect_walk_centers(im,wy0,wy1);walk_regs=regions_from_centers(wc,W,wy0,wy1)
    meta={'source':str(src),'source_size':[W,H],'contract':asdict(C),'bands':{'top':top_band,'walk':walk_band,'all':all_runs},'walk_centers':wc,'assets':{}}
    top_raw=[];walk_raw=[]
    for name,reg in zip(['front','left','back'],top_regs):s,m=extract_top(im.crop(reg));top_raw.append(s);meta['assets'][name]={'region':reg,**m}
    for i,reg in enumerate(walk_regs,1):s,m=extract_walk(im.crop(reg));walk_raw.append(s);meta['assets'][f'walk-left-{i:02d}']={'region':reg,**m}
    top,ts,th,tm=render_common(top_raw,C.review_cell,C.review_target_h,C.review_baseline);walk,ws,wh,wm=render_common(walk_raw,C.review_cell,C.review_target_h,C.review_baseline);world,wws,_,_=render_common(walk_raw,C.world_cell,C.world_target_h,C.world_baseline)
    meta['scales']={'top_review_shared':ts,'walk_review_shared':ws,'walk_world_shared':wws,'top_source_heights':th,'walk_source_heights':wh,'top_median_h':tm,'walk_median_h':wm}
    for n,f in zip(['front','left','back'],top):f.save(out/f'{n}.png')
    for i,f in enumerate(walk,1):f.save(out/f'walk-left-{i:02d}.png')
    master=Image.new('RGBA',(C.review_cell*8,C.review_cell),(0,0,0,0));wsheet=Image.new('RGBA',(C.world_cell*8,C.world_cell),(0,0,0,0))
    for i,(a,b) in enumerate(zip(walk,world)):master.alpha_composite(a,(i*C.review_cell,0));wsheet.alpha_composite(b,(i*C.world_cell,0))
    master.save(out/'walk-left-master.png');wsheet.save(out/'walk-left-world64.png')
    g=[]
    for f in walk:
        bg=Image.new('RGB',f.size,(240,240,240));bg.paste(f,mask=f.getchannel('A'));g.append(bg)
    g[0].save(out/'walk-left-preview.gif',save_all=True,append_images=g[1:],duration=110,loop=0,disposal=2)
    contact=Image.new('RGB',(1024,768),(245,245,245));allf=top+walk
    for i,f in enumerate(allf):
        bg=Image.new('RGB',f.size,(245,245,245));bg.paste(f,mask=f.getchannel('A'));contact.paste(bg,((i%4)*256,(i//4)*256))
    contact.save(out/'extraction-contact.jpg',quality=92);(out/'extraction.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')

if __name__=='__main__':
 import argparse;p=argparse.ArgumentParser();p.add_argument('src');p.add_argument('out');a=p.parse_args();process(a.src,a.out)
