"""Restore the explicitly selected manufacturer publicity photos and preserve their credits.

Uses macOS/system curl's normal certificate validation. No authentication or
access controls are bypassed. Run separately from the Commons manifest writer.
"""
import hashlib,json,subprocess,urllib.parse
from io import BytesIO
from pathlib import Path
from PIL import Image,ImageOps
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
records=json.loads((HERE/'official-photos.json').read_text())
path=HERE/'image-credits.json';manifest=json.loads(path.read_text())
for key,record in records.items():
 for photo in record['images']:
  name=photo['file'];target=ROOT/'brand-assets'/(hashlib.sha256(name.encode()).hexdigest()[:14]+'.webp')
  prior=manifest.get(name,{})
  if prior and (ROOT/prior['src']).exists():continue
  url=urllib.parse.quote(photo['url'],safe=':/?=&%')
  raw=subprocess.check_output(['curl','-fLsS','--max-time','45',url])
  with Image.open(BytesIO(raw)) as im:
   im=ImageOps.exif_transpose(im).convert('RGB')
   if im.width/im.height<1.15:raise ValueError('Expected a landscape photograph: '+name)
   im.thumbnail((1100,850));im.save(target,'WEBP',quality=85)
  credit='Ferrari' if key.startswith('ferrari/') else 'Mercedes-Benz'
  manifest[name]=dict(src='brand-assets/'+target.name,file=name,credit=credit,license='Official publicity photograph · rights retained',licenseUrl=record['page'],page=record['page'],description=name,origin='Official manufacturer publicity / press photograph',transformation='Resized and converted to WebP.')
  print(key,target.name)
path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
