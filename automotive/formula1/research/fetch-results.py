import concurrent.futures,json,time,urllib.request
from pathlib import Path
from lxml import html
ROOT=Path(__file__).resolve().parent
CACHE=Path('/tmp/f1-result-pages');CACHE.mkdir(exist_ok=True)
def get(y):
 p=CACHE/f'{y}.html';url=f'https://www.formula1.com/en/results/{y}/races'
 if not p.exists():
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=45) as r:p.write_bytes(r.read())
 tree=html.fromstring(p.read_bytes());out=[]
 for row in tree.xpath('//table//tr')[1:]:
  cols=row.xpath('./td');a=cols[0].xpath('.//a')[0]
  name=' '.join(a.xpath('.//text()[not(ancestor::*[local-name()="svg"])]')).strip()
  # Accessibility flag labels are image alt, not text.
  out.append(dict(name=name,date=cols[1].text_content(),winner=cols[2].text_content(),source='https://www.formula1.com'+a.get('href')))
 return str(y),out
out={}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
 for y,rows in ex.map(get,range(1950,2027)):
  out[y]=rows
  if int(y)%10==0:print(y,len(rows),flush=True)
(ROOT/'results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Saved',len(out),'seasons')
