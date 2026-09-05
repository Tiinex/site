from pathlib import Path
from PIL import Image
import json, hashlib, statistics
import numpy as np

def sha256(p):
    h=hashlib.sha256();
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1<<20),b''): h.update(b)
    return h.hexdigest()

def alpha_bbox(p):
    im=Image.open(p).convert('RGBA'); a=np.asarray(im.getchannel('A')); ys,xs=np.where(a>16)
    if not len(xs): return None
    return [int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]

def validate(dirp):
    d=Path(dirp); meta=json.loads((d/'extraction.json').read_text())
    walk=[]; src_heights=[]; world_boxes=[]
    for i in range(1,9):
        k=f'walk-left-{i:02d}'; b=meta['assets'][k]['bbox']; src_heights.append(b[3]-b[1])
        p=d/f'{k}.png'; walk.append({'file':p.name,'sha256':sha256(p),'bbox256':alpha_bbox(p)})
    med=statistics.median(src_heights); drift=[abs(x-med)/med for x in src_heights]
    world=Image.open(d/'walk-left-world64.png').convert('RGBA')
    for i in range(8):
        a=np.asarray(world.crop((i*64,0,(i+1)*64,64)).getchannel('A')); ys,xs=np.where(a>10)
        world_boxes.append(None if not len(xs) else [int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)])
    # Contract: exactly 8, source scale drift <= 8%, all world cells non-empty and >=4px top/bottom safety.
    safety=[]
    for b in world_boxes:
        if b is None: safety.append(False)
        else: safety.append(b[1]>=4 and (64-b[3])>=4 and b[0]>=1 and (64-b[2])>=1)
    checks={
      'walk_frame_count_8': len(walk)==8,
      'source_height_drift_lte_8pct': max(drift)<=.08,
      'all_world64_cells_nonempty': all(b is not None for b in world_boxes),
      'world64_safety_margin': all(safety),
      'top_view_count_3': all((d/f'{n}.png').exists() for n in ['front','left','back']),
    }
    return {
      'source_board':{'file':'source-board.png','sha256':sha256(d/'source-board.png')},
      'walk_source_heights':src_heights,'walk_source_height_median':med,'max_source_height_drift':max(drift),
      'world64_bboxes':world_boxes,'checks':checks,'pass':all(checks.values()),'walk':walk
    }

if __name__=='__main__':
    import argparse
    ap=argparse.ArgumentParser(); ap.add_argument('base'); a=ap.parse_args(); base=Path(a.base)
    results={name:validate(base/name) for name in ['explorer','robot']}
    results['proof_of_two_pass']=all(v['pass'] for v in results.values())
    (base/'validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    lines=['# Board-first proof-of-two validation','']
    for name,v in [('Explorer',results['explorer']),('Robot',results['robot'])]:
        lines += [f'## {name}',f'- Source SHA-256: `{v["source_board"]["sha256"]}`',f'- Source height drift max: `{v["max_source_height_drift"]*100:.2f}%`',f'- Mechanical PASS: **{v["pass"]}**']
        for k,x in v['checks'].items(): lines.append(f'- {k}: `{x}`')
        lines.append('')
    lines += [f'Proof-of-two mechanical PASS: **{results["proof_of_two_pass"]}**','',
      'Scope boundary: this validates board segmentation, common source-scale gating, normalization and world64 projection. It does not claim artistic acceptance or that the generated walk loop is perceptually good.']
    (base/'VALIDATION.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
