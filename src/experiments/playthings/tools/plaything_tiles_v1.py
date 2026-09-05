from pathlib import Path
from PIL import Image, ImageDraw, PngImagePlugin
import json, hashlib, random, sys

CELL=32
TOKENS=[
  'terrain.grass','terrain.dirt','terrain.stone','terrain.water','terrain.sand','terrain.mud','terrain.gravel','terrain.earth',
  'road.path','road.cobble','road.bridge','road.planks','wear.track','wear.scuff','wear.crack','wear.patch',
  'interior.floor.wood','interior.floor.stone','interior.floor.tile','interior.wall.brick','interior.wall.plaster','interior.wall.wood','interior.roof.slate','interior.window',
  'interior.door.closed','interior.door.open','interior.stairs.up','interior.stairs.down','interior.fence','interior.gate','interior.railing','interior.sign',
  'interior.table','interior.chair','interior.bed','interior.desk','interior.shelf','interior.cabinet','interior.crate','interior.barrel',
  'workshop.workbench','workshop.machine','workshop.anvil','workshop.furnace','workshop.gears','workshop.pipe','archive.shelf','archive.stack',
  'nature.tree','nature.shrub','nature.rock','nature.flower','nature.grass.tuft','nature.stump','nature.log','nature.mushroom',
  'utility.lamp','utility.post','utility.well','utility.pump','artifact.relic','artifact.blueprint','artifact.package','utility.spare'
]
assert len(TOKENS)==64

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def rgb(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def fill_rect(d,box,color): d.rectangle(box,fill=color)

def checker(d,a,b,step=4):
  for y in range(0,CELL,step):
    for x in range(0,CELL,step): d.rectangle((x,y,x+step-1,y+step-1),fill=a if ((x//step+y//step)%2==0) else b)

def draw_tile(token,seed):
  im=Image.new('RGBA',(CELL,CELL),(0,0,0,0)); d=ImageDraw.Draw(im); rng=random.Random(seed)
  if token=='terrain.grass':
    checker(d,'#607947','#6f8951',4)
    for _ in range(15):
      x=rng.randrange(2,30); y=rng.randrange(5,30); d.line((x,y,x+rng.choice([-1,0,1]),y-3),fill='#8fa965',width=1)
  elif token=='terrain.dirt': checker(d,'#74543b','#805f43',4)
  elif token=='terrain.stone':
    checker(d,'#6a6b67','#777771',8)
    for x,y in [(3,8),(15,4),(21,18),(5,25)]: d.rectangle((x,y,x+7,y+4),outline='#4f514e')
  elif token=='terrain.water':
    checker(d,'#456f78','#4e7e88',8)
    for y in (7,16,25): d.line((3,y,11,y-1,19,y,28,y-1),fill='#82a8aa',width=1)
  elif token=='terrain.sand': checker(d,'#b69a67','#c4aa75',4)
  elif token=='terrain.mud': checker(d,'#5a4936','#66523a',4)
  elif token=='terrain.gravel':
    checker(d,'#69665f','#77736b',4)
    for _ in range(16):
      x=rng.randrange(2,29);y=rng.randrange(2,29);d.point((x,y),fill='#9a9489')
  elif token=='terrain.earth': checker(d,'#6b4c34','#77553a',8)
  elif token.startswith('road.'):
    checker(d,'#526846','#5d744c',8); d.rectangle((7,0,24,31),fill='#85745e')
    if token=='road.cobble':
      for y in range(1,32,6):
        off=0 if (y//6)%2==0 else 4
        for x in range(8-off,25,8): d.rectangle((x,y,x+6,y+4),outline='#5a554f')
    elif token=='road.bridge':
      d.rectangle((5,0,26,31),fill='#765336');
      for y in range(1,32,5): d.line((6,y,25,y),fill='#9b7148')
    elif token=='road.planks':
      d.rectangle((4,0,27,31),fill='#76583d');
      for x in range(6,28,5): d.line((x,0,x,31),fill='#9b7552')
  elif token.startswith('wear.'):
    checker(d,'#776b58','#817460',8)
    if token=='wear.track': d.line((10,0,8,31),fill='#544b3e',width=3); d.line((23,0,21,31),fill='#544b3e',width=3)
    elif token=='wear.scuff': d.arc((6,8,24,26),20,160,fill='#4f483e',width=2)
    elif token=='wear.crack': d.line((3,7,12,13,8,20,20,26,28,22),fill='#4b443b',width=1)
    else: d.ellipse((9,8,24,23),fill='#675b4c')
  elif token.startswith('interior.floor.'):
    base='#825b3e' if token.endswith('wood') else '#77736a' if token.endswith('stone') else '#8d806c'
    checker(d,base,'#6b5645' if token.endswith('wood') else '#68645d',8)
    if token.endswith('wood'):
      for y in range(0,32,6): d.line((0,y,31,y),fill='#a77a55')
    elif token.endswith('tile'):
      for x in range(0,32,8): d.line((x,0,x,31),fill='#5e5b55');
      for y in range(0,32,8): d.line((0,y,31,y),fill='#5e5b55')
  elif token.startswith('interior.wall.'):
    base='#805747' if token.endswith('brick') else '#a5947d' if token.endswith('plaster') else '#76543c'; checker(d,base,base,8)
    for y in range(0,32,8): d.line((0,y,31,y),fill='#5d5148')
    if token.endswith('brick'):
      for y in range(4,32,8):
        off=0 if (y//8)%2==0 else 8
        for x in range(off,32,16): d.line((x,y-4,x,y+4),fill='#5d5148')
  elif token=='interior.roof.slate':
    checker(d,'#4d5660','#59636e',8)
    for y in range(4,32,6):
      for x in range(-3,32,8): d.arc((x,y-4,x+8,y+4),0,180,fill='#77828d')
  elif token=='interior.window':
    d.rectangle((3,3,28,28),fill='#6d4b34',outline='#33251d'); d.rectangle((7,7,24,24),fill='#6d8e98'); d.line((15,7,15,24),fill='#d8c8a3'); d.line((7,15,24,15),fill='#d8c8a3')
  elif token.startswith('interior.door.'):
    open_=token.endswith('open'); d.rectangle((7,2,25,31),fill='#6c4932',outline='#2e2119'); d.rectangle((10,5,22,29),fill='#855c3f')
    if open_: d.polygon([(10,5),(25,2),(25,29),(10,29)],fill='#493425')
    d.ellipse((19,16,21,18),fill='#c69a45')
  elif token.startswith('interior.stairs.'):
    d.rectangle((3,3,28,28),fill='#665b4d'); up=token.endswith('up')
    for i in range(6):
      y=25-i*4 if up else 5+i*4; d.line((5+i*2,y,27-i*2,y),fill='#a08e72',width=2)
  elif token in ('interior.fence','interior.gate','interior.railing'):
    for x in (5,14,23): d.rectangle((x,4,x+3,29),fill='#725139')
    d.rectangle((2,10,29,13),fill='#8b6848'); d.rectangle((2,21,29,24),fill='#8b6848')
  elif token=='interior.sign':
    d.rectangle((14,15,17,31),fill='#65472f'); d.rectangle((4,5,28,18),fill='#8b663f',outline='#3f2b20'); d.line((8,10,24,10),fill='#c5a56d')
  elif token.startswith('interior.'):
    # furniture silhouettes
    d.rectangle((5,15,27,22),fill='#755037',outline='#34241c')
    if token=='interior.table': d.rectangle((7,22,10,30),fill='#60412e'); d.rectangle((22,22,25,30),fill='#60412e')
    elif token=='interior.chair': d.rectangle((10,8,22,20),fill='#76533a'); d.rectangle((10,20,13,30),fill='#5e402d'); d.rectangle((19,20,22,30),fill='#5e402d')
    elif token=='interior.bed': d.rectangle((4,10,28,25),fill='#8f7b62'); d.rectangle((6,12,15,18),fill='#d0c0a0'); d.rectangle((4,24,28,28),fill='#5d4534')
    elif token=='interior.desk': d.rectangle((4,12,28,20),fill='#6d4b35'); d.rectangle((6,20,10,30),fill='#593b2b'); d.rectangle((22,20,26,30),fill='#593b2b')
    elif token in ('interior.shelf','interior.cabinet'): d.rectangle((5,3,27,29),fill='#604431',outline='#31221a'); [d.line((7,y,25,y),fill='#99724e',width=2) for y in (9,16,23)]
    elif token=='interior.crate': d.rectangle((5,5,27,27),fill='#795538',outline='#34251d'); d.line((5,5,27,27),fill='#a1764d'); d.line((27,5,5,27),fill='#a1764d')
    elif token=='interior.barrel': d.ellipse((8,3,24,28),fill='#79563b',outline='#34251d'); d.line((8,10,24,10),fill='#3f3e3b',width=2); d.line((8,21,24,21),fill='#3f3e3b',width=2)
  elif token.startswith('workshop.'):
    d.rectangle((4,18,28,25),fill='#6c4a33',outline='#2d211b'); d.rectangle((6,25,9,30),fill='#513727'); d.rectangle((23,25,26,30),fill='#513727')
    if token=='workshop.machine': d.rectangle((8,6,24,20),fill='#59615e',outline='#303634'); d.ellipse((11,9,21,19),fill='#88703d',outline='#44351c')
    elif token=='workshop.anvil': d.polygon([(6,10),(25,10),(28,15),(20,17),(20,25),(10,25),(10,16),(4,14)],fill='#59605f',outline='#2c3130')
    elif token=='workshop.furnace': d.rectangle((6,5,26,27),fill='#604a3e',outline='#30251f'); d.ellipse((10,12,22,24),fill='#b85d31'); d.ellipse((13,15,19,22),fill='#e4a349')
    elif token=='workshop.gears':
      for cx,cy,r in [(11,14,7),(22,20,6)]: d.ellipse((cx-r,cy-r,cx+r,cy+r),fill='#99763b',outline='#3e311c'); d.ellipse((cx-2,cy-2,cx+2,cy+2),fill='#4b4132')
    elif token=='workshop.pipe': d.line((6,5,6,22,22,22,22,29),fill='#67706e',width=5)
  elif token.startswith('archive.'):
    d.rectangle((4,3,28,29),fill='#5e4433',outline='#30231c')
    for y in (9,16,23): d.line((6,y,26,y),fill='#96724f',width=2)
    if token=='archive.stack':
      for i,(x,y) in enumerate([(6,20),(10,14),(14,8),(17,22)]): d.rectangle((x,y,x+10,y+4),fill=['#7c5b42','#6a7458','#7a4e45','#88734d'][i])
  elif token.startswith('nature.'):
    if token=='nature.tree': d.rectangle((14,16,18,31),fill='#65472f'); d.ellipse((5,2,27,22),fill='#586f45',outline='#35452e')
    elif token=='nature.shrub': d.ellipse((4,10,28,28),fill='#617c4b',outline='#35452e')
    elif token=='nature.rock': d.polygon([(5,24),(9,10),(20,5),(28,18),(24,27)],fill='#777771',outline='#4c4f4c')
    elif token=='nature.flower': checker(d,'#5f7946','#67804b',8); [d.ellipse((x-2,y-2,x+2,y+2),fill='#c98d8d') for x,y in [(8,12),(20,8),(25,22),(12,25)]]
    elif token=='nature.grass.tuft':
      for x in range(5,28,4): d.line((x,28,x+rng.choice([-3,-1,1,3]),rng.randrange(8,19)),fill='#7e9b59',width=2)
    elif token=='nature.stump': d.ellipse((8,9,24,27),fill='#715038',outline='#3b2a20'); d.ellipse((8,7,24,14),fill='#a27850',outline='#3b2a20')
    elif token=='nature.log': d.rounded_rectangle((4,12,28,23),radius=5,fill='#75523a',outline='#3b2a20'); d.ellipse((22,12,29,23),fill='#a17851')
    else: checker(d,'#5d7548','#657d4e',8); [d.ellipse((x-3,y-2,x+3,y+2),fill='#c0a276') for x,y in [(9,14),(20,21),(23,10)]]
  elif token.startswith('utility.'):
    if token=='utility.lamp': d.rectangle((15,10,17,31),fill='#4d4740'); d.rectangle((10,5,22,14),fill='#9c783c',outline='#3c3020'); d.rectangle((12,7,20,12),fill='#d6b96e')
    elif token=='utility.post': d.rectangle((14,3,18,31),fill='#62452f'); d.rectangle((7,7,25,10),fill='#816044')
    elif token=='utility.well': d.ellipse((5,16,27,29),fill='#66635d',outline='#393936'); d.rectangle((8,10,24,23),outline='#87827a',width=2); d.line((8,10,16,4,24,10),fill='#705039',width=2)
    elif token=='utility.pump': d.rectangle((13,9,20,28),fill='#5f6664',outline='#303432'); d.line((17,9,25,5,27,9),fill='#737d79',width=3); d.rectangle((7,25,25,29),fill='#4c504e')
    else: d.rectangle((5,5,27,27),outline='#82745d')
  elif token.startswith('artifact.'):
    if token=='artifact.relic': d.polygon([(16,4),(25,12),(22,26),(10,26),(7,12)],fill='#7a694b',outline='#352d22'); d.ellipse((13,11,19,17),fill='#b99445')
    elif token=='artifact.blueprint': d.rectangle((4,6,28,26),fill='#506f80',outline='#2d3d45'); d.line((8,11,23,11,23,20,14,20,14,16,8,16),fill='#c7dde0',width=1)
    elif token=='artifact.package': d.rectangle((5,8,27,26),fill='#76523a',outline='#34241b'); d.line((5,8,16,17,27,8),fill='#b18a61'); d.rectangle((14,8,18,26),fill='#9c714c')
  # thin edge transparency makes every cell independently safe.
  a=im.getchannel('A'); px=a.load()
  for x in range(CELL): px[x,0]=px[x,CELL-1]=0
  for y in range(CELL): px[0,y]=px[CELL-1,y]=0
  im.putalpha(a)
  return im

def render(out):
  out=Path(out); out.parent.mkdir(parents=True,exist_ok=True)
  sheet=Image.new('RGBA',(256,256),(0,0,0,0))
  mapping={}
  for i,token in enumerate(TOKENS):
    row,col=divmod(i,8); mapping[token]={'row':row,'col':col}; sheet.alpha_composite(draw_tile(token,1000+i),(col*CELL,row*CELL))
  metadata={
    'format':'tiinex.playthings.tiles','version':1,'family':'place-tiles-runtime','semanticAuthority':'none-presentation-only',
    'size':[256,256],'mode':'RGBA','grid':{'cols':8,'rows':8},'cell':{'width':32,'height':32},
    'tokens':mapping,'replaceableColorSlots':['terrain','structure','wood','metal','accent']
  }
  pi=PngImagePlugin.PngInfo(); pi.add_itxt('tiinex.playthings.tiles',json.dumps(metadata,separators=(',',':')))
  sheet.save(out,pnginfo=pi,optimize=True)
  # Validate dimensions, slots, transparent edges and nonempty cells.
  findings=[]
  for i,token in enumerate(TOKENS):
    row,col=divmod(i,8); cell=sheet.crop((col*32,row*32,(col+1)*32,(row+1)*32)); a=cell.getchannel('A'); p=a.load()
    edge=[p[x,0] for x in range(32)]+[p[x,31] for x in range(32)]+[p[0,y] for y in range(32)]+[p[31,y] for y in range(32)]
    if max(edge): findings.append({'token':token,'issue':'edge-alpha'})
    if not a.getbbox(): findings.append({'token':token,'issue':'empty'})
  report={'status':'PASS' if not findings else 'REVIEW','file':out.name,'sha256':sha(out),'size':[256,256],'mode':'RGBA','slotCount':64,'findings':findings,'metadata':metadata}
  print(json.dumps(report,indent=2))

if __name__=='__main__':
  if len(sys.argv)!=2: raise SystemExit('usage: plaything_tiles_v1.py <output.png>')
  render(sys.argv[1])
