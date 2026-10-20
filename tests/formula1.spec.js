const {test,expect} = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'../automotive/formula1');
const data = JSON.parse(fs.readFileSync(path.join(root,'data.json'),'utf8'));
const races = data.items.filter(i=>i.type==='race');

test('covers all years, weights the modern era, and only includes completed races',async()=>{
  expect([...new Set(races.map(i=>i.year))]).toEqual(Array.from({length:77},(_,i)=>1950+i));
  expect(races.filter(i=>i.year>=1991).length/36).toBeGreaterThan(2*races.filter(i=>i.year<1991).length/41);
  expect(new Set(data.items.map(i=>i.id)).size).toBe(data.items.length);
  for(const i of races){
    const date = new Date(`${i.date} ${i.year} 12:00:00 GMT`);
    expect(date.getTime()).toBeLessThan(new Date('2026-10-20T23:59:59Z').getTime());
    expect(i.sources.some(s=>s.title==='Official race result')).toBeTruthy();
  }
  expect(races.find(i=>i.id==='2023-qatar').titleSession.title).toContain('SPRINT HIGHLIGHTS');
});

test('watch destinations are observed catalog links and early footage is labelled honestly',async()=>{
  const inventory = fs.readdirSync(path.join(root,'research')).filter(n=>/^(season-|race-|f1tv-).*\.json$/.test(n));
  const catalog = new Set(inventory.flatMap(n=>JSON.parse(fs.readFileSync(path.join(root,'research',n),'utf8')).map(i=>i.url)));
  for(const i of data.items){
    for(const item of [i.watch,i.extended,i.titleSession,...(i.episodes||[])].filter(Boolean))expect(catalog.has(item.url),item.url).toBeTruthy();
    if(i.type==='race'&&i.year<1970)expect(i.watch).toBeUndefined();
    if(i.type==='race'&&i.year>=1970&&i.year<=1980)expect(i.watchLabel).toBe('Watch season review');
    if(i.watchLabel==='Watch race highlights')expect(i.watch.title).not.toMatch(/qualifying|practice|sprint|supercup|f2:|f3:/i);
    if(i.type==='documentary'||i.type==='screen')expect(i.span.length).toBeGreaterThan(12);
    if(i.type==='person'){expect(i.photo.credit).toBeTruthy();expect(i.photo.license).toBeTruthy();expect(i.photo.page).toContain('commons.wikimedia.org');}
  }
});

test('loads every local photograph and has no broken assets',async({request})=>{
  const unique=[...new Set(data.items.filter(i=>i.photo).map(i=>i.photo.src))];
  for(let n=0;n<unique.length;n+=4){
    await Promise.all(unique.slice(n,n+4).map(async src=>{
      expect(fs.statSync(path.join(root,src)).size).toBeGreaterThan(1000);
      const response=await request.get('/automotive/formula1/'+src);
      expect(response.ok(),src).toBeTruthy();expect(response.headers()['content-type']).toContain('image/');
    }));
  }
});

test('renders the complete mixed timeline and opens watch links in a new tab',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/automotive/formula1/');
  await expect(page.locator('.season')).toHaveCount(77);
  await expect(page.locator('.entry')).toHaveCount(196);
  await expect(page.locator('.entry-race')).toHaveCount(124);
  await expect(page.locator('.entry-person')).toHaveCount(38);
  await expect(page.locator('.entry-documentary')).toHaveCount(23);
  await expect(page.locator('.entry-screen')).toHaveCount(11);
  expect(await page.locator('.watch-link').evaluateAll(links=>links.every(a=>a.target==='_blank'&&a.rel.includes('noopener')))).toBeTruthy();
  expect(errors).toEqual([]);
});

test('searches, combines filters, handles empty results and jumps to hidden years',async({page})=>{
  await page.goto('/automotive/formula1/');
  await expect(page.locator('.entry')).toHaveCount(196);
  await page.getByLabel('Entry type',{exact:true}).selectOption('person');
  await page.getByLabel('Era',{exact:true}).selectOption('2022-2026');
  await expect(page.locator('.entry:not([hidden])')).toHaveCount(2);
  await page.getByLabel('Search the timeline').fill('Piastri');
  await expect(page.locator('.entry:not([hidden])')).toHaveCount(1);
  await page.getByLabel('Search the timeline').fill('zz-no-such-driver');
  await expect(page.locator('#empty')).toBeVisible();
  await page.getByRole('link',{name:'Start with Schumacher'}).click();
  await expect(page.locator('#year-1991')).toBeVisible();
  await expect(page.locator('#type')).toHaveValue('all');
  await expect(page.locator('#search')).toHaveValue('');
  await expect(page.locator('#status')).toContainText('196 entries');
  await page.getByLabel('Jump to year',{exact:true}).selectOption('2026');
  await expect(page).toHaveURL(/#year-2026$/);
  expect(await page.locator('#year-2026').evaluate(e=>Math.abs(e.getBoundingClientRect().top))).toBeLessThan(80);
});

test('race notes reset scroll between races and restore keyboard focus',async({page})=>{
  await page.goto('/automotive/formula1/#year-1994');
  const first=page.locator('[data-notes="1994-australia"]');
  await first.click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').evaluate(d=>d.scrollTop=d.scrollHeight);
  expect(await page.getByRole('dialog').evaluate(d=>d.scrollTop)).toBeGreaterThan(100);
  await page.getByRole('button',{name:'Close race notes'}).click();
  await expect(first).toBeFocused();
  await page.locator('[data-notes="1997-europe"]').click();
  expect(await page.getByRole('dialog').evaluate(d=>d.scrollTop)).toBe(0);
  await expect(page.locator('#notes-title')).toContainText('Jerez');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/modal-open/);
});

test('supports direct race links and distinguishes FIA findings from the classification',async({page})=>{
  await page.goto('/automotive/formula1/#race=2021-abu-dhabi');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#notes-content')).toContainText('human error');
  await expect(page.locator('#notes-content')).toContainText('classification remained valid');
  await expect(page.getByRole('link',{name:'FIA report on the 2021 Abu Dhabi Grand Prix'})).toHaveAttribute('href',/fia\.com/);
});

test('hides race outcomes and artwork until the individual story is revealed',async({page})=>{
  await page.goto('/automotive/formula1/');
  await page.getByLabel('Hide race outcomes').check();
  const race=page.locator('#entry-2024-miami');
  await expect(race.locator('h3')).not.toBeVisible();
  await expect(race.locator('figure')).not.toBeVisible();
  await race.getByRole('button',{name:'Reveal race story'}).click();
  await expect(race.locator('h3')).toBeVisible();
  await expect(race.locator('figure')).toBeVisible();
  await race.getByRole('button',{name:'Hide race story'}).click();
  await expect(race.locator('h3')).not.toBeVisible();
});

test('keeps race photographs landscape and prevents horizontal overflow',async({page})=>{
  await page.goto('/automotive/formula1/#year-1991');
  const photo=page.locator('#entry-1991-belgium figure img');
  await expect(photo).toBeVisible();
  const ratio=await photo.evaluate(i=>i.getBoundingClientRect().width/i.getBoundingClientRect().height);
  expect(ratio).toBeGreaterThan(1.7);expect(ratio).toBeLessThan(1.85);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),JSON.stringify(await page.locator('body *').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,cls:e.className,w:e.getBoundingClientRect().width,text:e.textContent.slice(0,50)}))))).toBeFalsy();
  await page.setViewportSize({width:320,height:740});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),JSON.stringify(await page.locator('body *').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,cls:e.className,w:e.getBoundingClientRect().width,text:e.textContent.slice(0,50)}))))).toBeFalsy();
  await page.goto('/automotive/formula1/#year-2025');
  await page.evaluate(()=>document.fonts.ready);
  if(test.info().project.name==='mobile-chromium')await page.screenshot({path:'/tmp/formula1-mobile.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),JSON.stringify(await page.locator('body *').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,cls:e.className,w:e.getBoundingClientRect().width,text:e.textContent.slice(0,50)}))))).toBeFalsy();
});
