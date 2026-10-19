"""Download planned Commons photographs, preserve credits, and write local WebP assets."""
import concurrent.futures,hashlib,importlib.util,json,re,threading,time,urllib.request
from io import BytesIO
from pathlib import Path
from PIL import Image,ImageOps
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];(ROOT/'brand-assets').mkdir(exist_ok=True)
s=importlib.util.spec_from_file_location('media',ROOT/'research/fetch-media.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
plan=json.loads((HERE/'photo-plan.json').read_text());files=list(dict.fromkeys(f for p in plan for f in p['files']))
path=HERE/'image-credits.json';manifest=json.loads(path.read_text()) if path.exists() else {};old=json.loads((ROOT/'research/image-credits.json').read_text())
for f in files:
 if f in old and (ROOT/old[f]['src']).exists():manifest[f]=old[f]
missing=[f for f in files if f not in manifest or not (ROOT/manifest[f]['src']).exists()]
info={}
for offset in range(0,len(missing),10):
 group=missing[offset:offset+10]
 try:
  time.sleep(4)
  j=m.api('commons.wikimedia.org',action='query',titles='|'.join('File:'+f for f in group),prop='imageinfo',iiprop='url|extmetadata',iiurlwidth=960,redirects=1)
  if j.get('error'):raise RuntimeError(str(j['error']))
  for p in j.get('query',{}).get('pages',{}).values():
   if p.get('imageinfo'):info[p['title'][5:].replace('_',' ')]=p['imageinfo'][0]
  print('Metadata',min(offset+10,len(missing)),'/',len(missing),flush=True)
 except Exception as e:print('METADATA ERROR',e,flush=True)
lock=threading.Lock();last=0
UA='AutomotiveHistory/1.0 (educational archive; photographer and Commons source credited)'
def download(f):
 global last
 inf=info.get(f.replace('_',' '))
 if not inf:return f,None,'No metadata'
 ext=inf.get('extmetadata',{});lic=m.clean(ext.get('LicenseShortName',{}).get('value',''));url=ext.get('LicenseUrl',{}).get('value','')
 if not lic or not ('cc' in lic.lower() or 'public domain' in lic.lower() or lic.startswith('PD') or lic in ['FAL','Attribution','Copyrighted free use']):return f,None,'Unrecognised license '+lic
 target=ROOT/'brand-assets'/(hashlib.sha256(f.encode()).hexdigest()[:14]+'.webp')
 error=''
 for attempt in range(4):
  try:
   if not target.exists():
    with lock:
     time.sleep(max(0,.65-(time.monotonic()-last)));last=time.monotonic()
    with urllib.request.urlopen(urllib.request.Request(inf.get('thumburl',inf['url']),headers={'User-Agent':UA}),timeout=40) as response:raw=response.read()
    with Image.open(BytesIO(raw)) as image:
     image=ImageOps.exif_transpose(image).convert('RGB');image.thumbnail((1100,850));image.save(target,'WEBP',quality=82,method=5)
   return f,dict(src='brand-assets/'+target.name,file=f,credit=m.clean(ext.get('Artist',{}).get('value','Wikimedia Commons')),license=lic,licenseUrl=url or 'https://commons.wikimedia.org/wiki/Commons:Licensing',page=inf['descriptionurl'],description=m.clean(ext.get('ImageDescription',{}).get('value',f))[:600],origin='Wikimedia Commons · archive / contemporary photograph',transformation='Resized and converted to WebP; original linked in credit.'),None
  except Exception as e:error=str(e);time.sleep(2*(attempt+1))
 return f,None,error
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
 for i,(f,p,error) in enumerate(ex.map(download,missing)):
  if error:print('IMAGE ERROR',f,error,flush=True)
  else:manifest[f]=p
  if (i+1)%20==0 or i==len(missing)-1:
   path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print('Downloaded',i+1,'/',len(missing),flush=True)
path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Available',sum(f in manifest for f in files),'/',len(files),flush=True)
