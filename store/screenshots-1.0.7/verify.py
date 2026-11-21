#!/usr/bin/env python3
"""Validate the 30 deliverables; build the review contact sheets (RGB)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
root=Path(__file__).resolve().parent
locales=list(json.loads((root/'copy.json').read_text()))
names=['01-walk-away','02-approve','03-characters','04-quiet','05-privacy']
results=[]
for locale in locales:
 for name in names:
  p=root/locale/(name+'.png')
  with Image.open(p) as im:
   assert im.size==(2880,1800),(p,im.size)
   # Chromium writes opaque screenshots as RGB; do not silently repair invalid output.
   assert im.mode=='RGB',(p,im.mode)
   results.append({'file':str(p.relative_to(root)),'size':list(im.size),'mode':im.mode})
def sheet(filename,columns,width):
 gap,label=12,32
 thumb_h=round(width*1800/2880)
 canvas=Image.new('RGB',(columns*width+(columns+1)*gap,len(locales)*(thumb_h+label)+(len(locales)+1)*gap),'#e3f1ea')
 draw=ImageDraw.Draw(canvas)
 for row,locale in enumerate(locales):
  y=gap+row*(thumb_h+label+gap)
  draw.text((gap,y+5),locale,fill='#17382f')
  for col,name in enumerate(names[:columns]):
   with Image.open(root/locale/(name+'.png')) as im: canvas.paste(im.resize((width,thumb_h),Image.Resampling.LANCZOS),(gap+col*(width+gap),y+label))
 canvas.save(root/filename)
sheet('overview.png',5,480)
sheet('search-preview.png',3,480)
(root/'validation.json').write_text(json.dumps({'count':len(results),'passed':True,'images':results},ensure_ascii=False,indent=2)+'\n')
print('PASS: 30 PNGs, 2880×1800, RGB; overview and search-preview generated.')
