import concurrent.futures,hashlib,html as H,json,re,time,urllib.parse,urllib.request
from pathlib import Path
from lxml import html
from PIL import Image
from io import BytesIO
R=Path(__file__).resolve().parent; A=R.parent/'assets'; C=Path('/tmp/f1-portrait-cache');C.mkdir(exist_ok=True)
def get(url):
 p=C/hashlib.sha256(url.encode()).hexdigest()
 if p.exists():return p.read_bytes()
 for n in range(4):
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AutomotiveHistory/1.0 (personal educational website; Wikimedia attribution retained)'}),timeout=40) as res:b=res.read()
   p.write_bytes(b);return b
  except Exception:
   if n==3:raise
   time.sleep(2+n*3)
def clean(x):return H.unescape(re.sub('<[^>]+>','',x or '')).strip()
def candidate(line):
 y,name,wiki,title,story=line.split('|');url='https://en.wikipedia.org/wiki/'+urllib.parse.quote(wiki.replace(' ','_'));tree=html.fromstring(get(url));images=tree.xpath('//table[contains(@class,"infobox")]//img[contains(@src,"/commons/")]');im=next(i for i in images if int(i.get('width','0'))>100);src=im.get('src');file=urllib.parse.unquote(src.split('/')[-2]);return dict(year=int(y),name=name,wiki=wiki,title=title,story=story,file=file,source=url)
people=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
 for p in ex.map(candidate,(R/'people.txt').read_text().splitlines()):people.append(p);print('Portrait',p['name'],p['file'],flush=True)
meta={}
for start in range(0,len(people),15):
 params=urllib.parse.urlencode(dict(action='query',format='json',titles='|'.join('File:'+p['file'] for p in people[start:start+15]),prop='imageinfo',iiprop='url|extmetadata',iiurlwidth=960))
 j=json.loads(get('https://commons.wikimedia.org/w/api.php?'+params))
 for p in j['query']['pages'].values():
  if 'imageinfo' in p:meta[p['title'][5:].replace('_',' ')]=p['imageinfo'][0]
def photo(p):
 inf=meta[p['file'].replace('_',' ')];ext=inf.get('extmetadata',{});lic=clean(ext.get('LicenseShortName',{}).get('value',''))
 if not lic:raise ValueError('Missing license '+p['name'])
 path='assets/person-'+hashlib.sha256(p['file'].encode()).hexdigest()[:12]+'.webp';target=R.parent/path
 if not target.exists():
  im=Image.open(BytesIO(get(inf.get('thumburl',inf['url'])))).convert('RGB');im.thumbnail((650,750));im.save(target,'WEBP',quality=83)
 p['photo']=dict(src=path,alt=p['name'] if ' & ' not in p['name'] else p['wiki'],credit=clean(ext.get('Artist',{}).get('value','Wikimedia Commons')),license=lic,licenseUrl=ext.get('LicenseUrl',{}).get('value','https://commons.wikimedia.org/wiki/Commons:Licensing'),page=inf['descriptionurl'],caption=clean(ext.get('ImageDescription',{}).get('value',''))[:500],kind='Reference portrait; not necessarily photographed in the timeline year')
 return p
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:people=list(ex.map(photo,people))
(R/'portraits.json').write_text(json.dumps(people,ensure_ascii=False,indent=2)+'\n');print('Saved',len(people),'attributed portraits')
