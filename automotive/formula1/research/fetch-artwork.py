import concurrent.futures,hashlib,json,urllib.request,urllib.parse,time
from pathlib import Path
from PIL import Image
from io import BytesIO
R=Path(__file__).resolve().parent.parent;data=json.loads((R/'data.json').read_text())
def art(i):
 if not i.get('artwork'):return i
 original=i['artwork'];url=original.split('?')[0]+'?w=768&h=432&q=HI&o=L';path='assets/catalog-'+hashlib.sha256(url.encode()).hexdigest()[:12]+'.webp';target=R/path
 if not target.exists():
  for n in range(3):
   try:
    with urllib.request.urlopen(url,timeout=30) as res:b=res.read()
    im=Image.open(BytesIO(b)).convert('RGB');im.thumbnail((768,432));im.save(target,'WEBP',quality=84);break
   except Exception:
    if n==2:raise
    time.sleep(n+1)
 i['photo']=dict(src=path,alt=i['watch']['title'].split('\n')[0],credit='Formula 1 / F1 TV',license='Catalog artwork · all rights retained',page=i['watch']['url'],kind='Season review artwork' if i['type']=='race' and i['year']<1981 else 'F1 TV catalog artwork',original=original)
 return i
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:data['items']=list(ex.map(art,data['items']))
(R/'data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print('Saved artwork for',sum(bool(i.get('artwork')) for i in data['items']),'entries')
