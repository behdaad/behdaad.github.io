"""Verify selected YouTube identities through the public oEmbed metadata endpoint.

Downloads metadata only. Public catalog generation is separate. Re-run after a
selection changes; successful unchanged IDs are cached in video-verification.json.
"""
import concurrent.futures,json,re,subprocess,threading,time,urllib.parse
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
selected=json.loads((HERE/'videos.json').read_text());path=HERE/'video-verification.json';audit=json.loads(path.read_text()) if path.exists() else {};targets={}
for slug in ['ferrari','lamborghini','porsche','tesla','mercedes']:
 data=json.loads((ROOT/slug/'data.json').read_text())
 for car in data['cars']:
  key=slug+'/'+car['id'];v=selected.get(key,car.get('video'))
  if v and v.get('id'):targets[key]=v
lock=threading.Lock();last=0

def verify(key,v):
 global last
 if not re.fullmatch(r'[A-Za-z0-9_-]{11}',v['id']):raise ValueError('Invalid video ID')
 with lock:
  time.sleep(max(0,1-(time.monotonic()-last)));last=time.monotonic()
 url='https://www.youtube.com/oembed?'+urllib.parse.urlencode(dict(url='https://www.youtube.com/watch?v='+v['id'],format='json'))
 result=json.loads(subprocess.check_output(['curl','-fLsS','--max-time','35',url],stderr=subprocess.PIPE))
 return dict(id=v['id'],checked='2026-10-20',status='verified',title=result['title'],channel=result['author_name'],channelUrl=result['author_url'],url='https://www.youtube.com/watch?v='+v['id'],metadataUrl=url,method='YouTube public oEmbed response; video title and uploader identity checked. Regional playback availability can vary.')
work=[(key,v) for key,v in targets.items() if audit.get(key,{}).get('id')!=v['id'] or audit.get(key,{}).get('status')!='verified']
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
 futures={executor.submit(verify,key,v):key for key,v in work}
 for i,f in enumerate(concurrent.futures.as_completed(futures),1):
  key=futures[f]
  try:audit[key]=f.result()
  except Exception as e:audit[key]=dict(id=targets[key]['id'],checked='2026-10-20',status='failed',error=str(e));print('ERROR',key,str(e),flush=True)
  path.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
  if i%20==0 or i==len(work):print('Verified',i,'/',len(work),flush=True)
print('Verified total',sum(audit.get(key,{}).get('status')=='verified' for key in targets),'/',len(targets),flush=True)
