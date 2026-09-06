#!/usr/bin/env python3
from pathlib import Path
import importlib.util, tempfile, json
from PIL import Image, ImageDraw

HERE=Path(__file__).resolve().parent
TOOL=HERE.parent/"motion_sheet_tool.py"
spec=importlib.util.spec_from_file_location("mst",TOOL); mst=importlib.util.module_from_spec(spec); spec.loader.exec_module(mst)

# Synthetic 2x4 RGBA sheet with deliberately shifted but isolated subjects.
cw,ch=96,96
sheet=Image.new("RGBA",(cw*4,ch*2),(0,0,0,0))
for i in range(8):
    cell=Image.new("RGBA",(cw,ch),(0,0,0,0)); d=ImageDraw.Draw(cell)
    x=8+i%4*3; y=10+(i//4)*5
    d.rectangle((x,y,x+26+(i%3)*4,y+60),fill=(40,100,160,180+i*8))
    sheet.alpha_composite(cell,((i%4)*cw,(i//4)*ch))
frames,_,_=mst.split_grid(sheet)
repacked,cells,meta=mst.repack(frames,cell_size=(cw,ch),safe_margin=6)
assert meta["safe_margin_px"]==6
for p in meta["placements"]:
    assert p["margins"]["left"]>=6 and p["margins"]["right"]>=6 and p["margins"]["bottom"]==6
with tempfile.TemporaryDirectory() as td:
    webp=Path(td)/"preview.webp"; check=mst.save_webp(cells,webp); assert check["alpha_exact"] is True
    surg={"operations":[{"op":"duration","frame":8,"milliseconds":60},{"op":"replace","from":1,"to":2}]}
    seq,durs,log=mst.apply_surgery(cells,surg); assert durs[7]==60 and len(seq)==8 and len(log)==2
print(json.dumps({"status":"pass","safe_margin":6,"alpha_roundtrip":True,"surgery_ops":2}))
