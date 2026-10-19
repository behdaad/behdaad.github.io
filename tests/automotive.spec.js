const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const catalog=require('../automotive/data.json');

test('serves every referenced photograph with an image content type',async({request})=>{
  const photos=[...catalog.cars.flatMap(car=>car.variants.flatMap(v=>v.photos)),...catalog.honors.flatMap(car=>car.photos)];
  const paths=[...new Set(photos.map(photo=>photo.src))];
  for(let offset=0;offset<paths.length;offset+=8){
    await Promise.all(paths.slice(offset,offset+8).map(async src=>{
      const response=await request.get(`/automotive/${src}`);
      expect(response.status(),src).toBe(200);
      expect(response.headers()['content-type'],src).toMatch(/^image\//);
      expect((await response.body()).length,src).toBeGreaterThan(0);
    }));
  }
});

test('keeps the archive bounded, chronological and complete',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/automotive/');
  await expect(page.locator('.car')).toHaveCount(25);
  const brands=new Set(catalog.cars.map(c=>c.brand));
  expect(brands.size).toBe(19);
  expect(catalog.cars.length).toBeLessThanOrEqual(Math.floor(brands.size*2.5));
  const years=await page.locator('.car>.year').allTextContents();
  expect(years.map(Number)).toEqual([...years.map(Number)].sort((a,b)=>a-b));
  await expect(page.locator('.maker')).toHaveCount(brands.size);
  await expect(page.locator('.honor')).toHaveCount(catalog.honors.length);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const car of catalog.cars){
    expect(car.sources.length).toBeGreaterThan(0);
    expect(car.video.id?car.video.id.length:car.video.episode.length).toBeGreaterThan(5);
    for(const variant of car.variants){
      expect(variant.photos.length,`${car.name} ${variant.name} gallery`).toBeGreaterThanOrEqual(2);
      for(const p of variant.photos){
        expect(fs.existsSync(path.resolve(__dirname,'../automotive',p.src)),p.src).toBe(true);
        expect(p.credit.length).toBeGreaterThan(0);
        expect(p.license.length).toBeGreaterThan(0);
      }
    }
  }
  expect(errors).toEqual([]);
});

test('opens every car with its own galleries, evidence and evolution',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/automotive/');
  for(const car of catalog.cars){
    const trigger=page.locator(`#entry-${car.id} .arrow-link`);
    await trigger.click();
    const dialog=page.locator('#car-dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('#detail-title')).toHaveText(car.name);
    await expect(dialog.locator('.generation')).toHaveCount(car.variants.length);
    await expect(dialog.locator('.diff')).toHaveCount(car.variants.length);
    await expect(dialog.locator('.diff-pictures')).toHaveCount(car.variants.length-1);
    const first=dialog.locator('[data-gallery="main"]');
    const before=await first.locator('.gallery-stage img').getAttribute('src');
    await first.getByRole('button',{name:`Next ${car.name} photo`,exact:true}).click();
    expect(await first.locator('.gallery-stage img').getAttribute('src')).not.toBe(before);
    await first.locator('.gallery-stage img').evaluate(img=>img.decode());
    await expect(first.locator('.gallery-thumbs button').nth(1)).toHaveAttribute('aria-pressed','true');
    const overflow=await dialog.evaluate(d=>d.scrollWidth>d.clientWidth+1);
    expect(overflow,car.name).toBe(false);
    await expect(dialog.locator('iframe')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page).not.toHaveURL(/#car=/);
  }
  expect(errors).toEqual([]);
});

test('filters by maker and name, preserves chronology, and resets',async({page})=>{
  await page.goto('/automotive/');
  await page.locator('[data-brand="Lamborghini"]').click();
  await expect(page.locator('.car')).toHaveCount(2);
  await expect(page.locator('.car h4')).toHaveText(['Miura','Countach']);
  await page.locator('#search').fill('countach');
  await expect(page.locator('.car')).toHaveCount(1);
  await page.locator('#search').fill('no such car');
  await expect(page.locator('#empty')).toBeVisible();
  await page.locator('#reset').click();
  await expect(page.locator('.car')).toHaveCount(25);
});

test('opens each car at the top after closing or navigating from a scrolled modal',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/automotive/');
  const dialog=page.locator('#car-dialog');
  await page.locator('#entry-mustang .arrow-link').click();
  await dialog.evaluate(el=>el.scrollTo({top:2000,behavior:'instant'}));
  expect(await dialog.evaluate(el=>el.scrollTop)).toBeGreaterThan(500);
  await page.locator('#close-dialog').click();
  await expect(page).not.toHaveURL(/#car=/);
  await page.locator('#entry-911 .arrow-link').click();
  await expect(page.locator('#detail-title')).toHaveText('911');
  await expect.poll(()=>dialog.evaluate(el=>el.scrollTop)).toBe(0);

  await dialog.locator('[data-neighbor="1"]').click();
  await expect(page.locator('#detail-title')).toHaveText('Mustang');
  await expect.poll(()=>dialog.evaluate(el=>el.scrollTop)).toBe(0);
});

test('supports direct links, browser back, keyboard focus and video opt-in',async({page})=>{
  await page.goto('/automotive/#car=cybertruck');
  const dialog=page.locator('#car-dialog');
  await expect(page.locator('#detail-title')).toHaveText('Cybertruck');
  await expect(page.locator('#close-dialog')).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(()=>!!document.activeElement.closest('dialog'))).toBe(true);
  await expect(dialog.locator('iframe')).toHaveCount(0);
  await dialog.locator('[data-video]').click();
  await expect(dialog.locator('iframe')).toHaveAttribute('src',/youtube-nocookie\.com\/embed\/hcioIka_ByE/);
  await page.keyboard.press('Escape');
  // The iframe may retain keyboard focus, so use the explicit close affordance if needed.
  if(await dialog.isVisible())await page.locator('#close-dialog').click();
  await expect(dialog).not.toBeVisible();
  await page.locator('#entry-ds .arrow-link').click();
  await page.goBack();
  await expect(dialog).not.toBeVisible();
});

test('renders loaded photographs without narrow-screen overflow',async({page},testInfo)=>{
  await page.goto('/automotive/');
  await expect(page.locator('.car')).toHaveCount(25);
  await page.locator('#hero img').evaluate(img=>img.decode());
  await page.screenshot({path:testInfo.outputPath('automotive.png')});
  await page.locator('#entry-countach .arrow-link').click();
  await page.locator('[data-gallery="main"] .gallery-stage img').evaluate(img=>img.decode());
  await page.screenshot({path:testInfo.outputPath('countach-modal.png')});
  if(testInfo.project.name.startsWith('mobile')){
    await page.keyboard.press('Escape');
    await page.setViewportSize({width:320,height:740});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('#entry-prius .arrow-link').click();
    expect(await page.locator('#car-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1)).toBe(true);
  }
});
