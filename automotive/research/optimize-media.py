"""Convert selected photos to local WebP and generate contact sheets in /tmp.

Requires Pillow. Attribution and original source links are preserved.
"""
import json, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT=Path(__file__).resolve().parents[1]
d=json.loads(ROOT.joinpath('data.json').read_text())
manifest=json.loads(ROOT.joinpath('research/image-credits.json').read_text())
before=0;after=0
for photo in manifest.values():
    original=ROOT/photo['src'];target=original.with_suffix('.webp')
    before+=original.stat().st_size
    if original!=target:
        with Image.open(original) as im:
            im=ImageOps.exif_transpose(im).convert('RGB')
            im.thumbnail((1200,1000))
            im.save(target,'WEBP',quality=83,method=6)
        photo['src']='assets/'+target.name
        photo['transformation']='Resized and converted to WebP; original image linked in credit.'
        original.unlink()
    after+=target.stat().st_size
for item in [v for c in d['cars'] for v in c['variants']]+d['honors']:
    item['photos']=[manifest[p['file']] for p in item['photos']]
ROOT.joinpath('data.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
ROOT.joinpath('research/image-credits.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
referenced={Path(photo['src']).name for photo in manifest.values()}
for asset in ROOT.joinpath('assets').iterdir():
    if asset.is_file() and asset.name not in referenced:
        asset.unlink()
font=ImageFont.load_default(size=14)
def contact(name,entries,columns=4):
    w=310;h=245
    sheet=Image.new('RGB',(columns*w,math.ceil(len(entries)/columns)*h),'#f4f2ed')
    draw=ImageDraw.Draw(sheet)
    for i,(label,p) in enumerate(entries):
        x=(i%columns)*w;y=(i//columns)*h
        if p:
            with Image.open(ROOT/p['src']) as im:
                im.thumbnail((w-18,h-56));sheet.paste(im,(x+(w-im.width)//2,y+(h-56-im.height)//2))
        draw.text((x+9,y+h-47),label[:40],fill='#242925',font=font)
        if p:draw.text((x+9,y+h-25),p['file'][:39],fill='#66685f',font=font)
    sheet.save('/tmp/automotive-'+name+'.jpg',quality=85)
contact('main',[(f'{c["year"]} {c["name"]}',c['variants'][0]['photos'][0] if c['variants'][0]['photos'] else None) for c in d['cars']])
entries=[(f'{c["name"]} · {v["year"]} {v["name"]}',v['photos'][0] if v['photos'] else None) for c in d['cars'] for v in c['variants']]
for start in range(0,len(entries),28):contact('evolution-'+str(start//28+1),entries[start:start+28])
print(f'{len(manifest)} images: {before/1e6:.1f} MB → {after/1e6:.1f} MB. Contact sheets in /tmp/automotive-*.jpg')
