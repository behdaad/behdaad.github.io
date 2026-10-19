"""Cache model facts, review references and image candidates; no public copy is scraped."""
import importlib.util,json,re,sys,time,urllib.parse
from pathlib import Path
from lxml import html
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('media',ROOT/'research/fetch-media.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def clean(s):return re.sub(r'\[\d+\]','',re.sub(r'\s+',' ',s)).strip()
def read(page):
 raw=m.get('https://en.wikipedia.org/wiki/'+urllib.parse.quote(page.replace(' ','_'))).decode();tree=html.fromstring(raw)
 for element in tree.xpath('//style|//script'):element.drop_tree()
 boxes=[]
 for table in tree.xpath('//table[contains(@class,"infobox")]'):
  fields={}
  for row in table.xpath('./tbody/tr|./tr'):
   th=row.xpath('./th');td=row.xpath('./td')
   if th and td:fields[clean(th[0].text_content())]=clean(' '.join(td[0].itertext()))
  if fields:boxes.append(fields)
 photos=[];section='Introduction'
 for e in tree.iter():
  if e.tag in ('h2','h3','h4'):section=clean(e.text_content()).replace('[edit]','')
  if e.tag!='img':continue
  src=e.get('src','');w=e.get('width','0');h=e.get('height','0')
  if not w.isdigit() or not h.isdigit() or int(w)<120 or '/commons/' not in src or '/thumb/' not in src:continue
  file=urllib.parse.unquote(src.split('/')[-2])
  if not re.search(r'\.(jpg|jpeg|png)$',file,re.I):continue
  if re.search(r'logo|engine|badge|flag|diagram|chart|disambig|signature|cutaway',file,re.I):continue
  if int(w)/max(1,int(h))<1.15:continue
  if file not in [p['file'] for p in photos]:photos.append(dict(file=file,section=section,alt=e.get('alt',''),width=int(w),height=int(h)))
 reviews=[]
 domains=('topgear.com/','evo.co.uk/','autocar.co.uk/','caranddriver.com/','hagerty.com/','hagerty.co.uk/','autoexpress.co.uk/','motortrend.com/','roadandtrack.com/')
 for a in tree.xpath('//a[@href]'):
  url=a.get('href');title=clean(a.text_content()).strip('“”"')
  if any(host in url for host in domains) and len(title)>12 and url not in [r['url'] for r in reviews]:reviews.append(dict(url=url,title=title))
 return dict(wiki=page,url='https://en.wikipedia.org/wiki/'+urllib.parse.quote(page.replace(' ','_')),facts=boxes,photos=photos,reviews=reviews)
spec=importlib.util.spec_from_file_location('catalog',HERE/'catalog.py');c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
path=HERE/'pages.json';pages=json.loads(path.read_text()) if path.exists() else {}
for page in dict.fromkeys(v['wiki'] for cars in c.CATALOG.values() for car in cars for v in car['variants']):
 if page in pages and pages[page].get('photos') and '--refresh-cached' not in sys.argv:continue
 try:pages[page]=read(page);print(page,len(pages[page]['photos']),len(pages[page]['reviews']),flush=True)
 except Exception as e:pages[page]=dict(wiki=page,error=str(e));print('ERROR',page,e,flush=True)
 path.write_text(json.dumps(pages,ensure_ascii=False,indent=2)+'\n')
