"""Visual audit sheets, outside the published tree."""
import json,math,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
plan=json.loads((HERE/'photo-plan.json').read_text());manifest=json.loads((HERE/'image-credits.json').read_text());font=ImageFont.load_default(size=12)
for brand in ['ferrari','lamborghini','porsche','tesla','mercedes']:
 entries=[p for p in plan if p['brand']==brand]
 for start in range(0,len(entries),24):
  group=entries[start:start+24];w=300;h=210;sheet=Image.new('RGB',(w*4,math.ceil(len(group)/4)*h),'#f4f2ed');draw=ImageDraw.Draw(sheet)
  for i,p in enumerate(group):
   x=i%4*w;y=i//4*h;photo=manifest.get(p['files'][0]) if p['files'] else None
   if photo and (ROOT/photo['src']).exists():
    with Image.open(ROOT/photo['src']) as im:im.thumbnail((286,151));sheet.paste(im,(x+(w-im.width)//2,y+(155-im.height)//2))
   else:draw.text((x+10,y+60),'MISSING',fill='red',font=font)
   draw.text((x+6,y+158),p['key'],fill='#ae3826',font=font);draw.text((x+6,y+174),p['variant'][:43],fill='#242925',font=font);draw.text((x+6,y+190),p['files'][0][:42] if p['files'] else '',fill='#61675f',font=font)
  sheet.save('/tmp/brand-'+brand+'-'+str(start//24+1)+'.jpg')
