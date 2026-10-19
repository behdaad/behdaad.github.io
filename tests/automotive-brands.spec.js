const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const slugs=['ferrari','lamborghini','porsche','tesla','mercedes'];
const catalogs=Object.fromEntries(slugs.map(slug=>[slug,require(`../automotive/${slug}/data.json`)]));

for(const slug of slugs){
  test(`${slug}: chronological family index, all modals, galleries and films`,async({page},testInfo)=>{
    test.setTimeout(90000);
    const data=catalogs[slug],errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`/automotive/${slug}/`);
    await expect(page.locator('.car')).toHaveCount(data.cars.length);
    await expect(page.locator('.model-index-item')).toHaveCount(data.cars.length);
    await expect(page.locator('.film-card')).toHaveCount(data.films.length);
    expect(data.films.length).toBeGreaterThan(0);
    const years=await page.locator('.car>.year').allTextContents();
    expect(years.map(Number)).toEqual([...years.map(Number)].sort((a,b)=>a-b));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(new Set(data.cars.map(c=>c.id)).size).toBe(data.cars.length);
    for(const car of data.cars){
      expect(car.variants.map(v=>v.year)).toEqual([...car.variants.map(v=>v.year)].sort((a,b)=>a-b));
      expect(car.sources.length).toBeGreaterThan(0);
      for(const v of car.variants){
        expect(v.photos.length,`${car.name}: ${v.name}`).toBeGreaterThan(0);
        expect(v.shape.length).toBeGreaterThan(15);
        expect(v.engineering.length).toBeGreaterThan(15);
        for(const p of v.photos){
          expect(fs.existsSync(path.resolve(__dirname,`../automotive/${slug}`,p.src)),p.src).toBe(true);
          expect(p.credit.length).toBeGreaterThan(0);expect(p.license.length).toBeGreaterThan(0);
          expect(p.page).toMatch(/^https:\/\//);
        }
      }
      await page.locator(`.model-index-item[data-car="${car.id}"]`).click();
      const dialog=page.locator('#car-dialog');
      await expect(dialog).toBeVisible();
      await expect(page.locator('#detail-title')).toHaveText(car.name);
      await expect(dialog.locator('.generation')).toHaveCount(car.variants.length);
      await expect(dialog.locator('.diff')).toHaveCount(car.variants.length);
      await expect(dialog.locator('.diff-pictures')).toHaveCount(car.variants.length-1);
      await expect.poll(()=>dialog.evaluate(el=>el.scrollTop)).toBe(0);
      await dialog.locator('[data-gallery="main"] .gallery-stage img').evaluate(img=>img.decode());
      expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1),car.name).toBe(true);
      await expect(dialog.locator('iframe')).toHaveCount(0);
      if(car.variants[0].photos.length>1){
        const gallery=dialog.locator('[data-gallery="main"]');
        const before=await gallery.locator('.gallery-stage img').getAttribute('src');
        await gallery.locator('[data-step="1"]').click();
        expect(await gallery.locator('.gallery-stage img').getAttribute('src')).not.toBe(before);
        await expect(gallery.locator('[data-index="1"]')).toHaveAttribute('aria-pressed','true');
      }
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
    await page.locator('#search').fill(data.cars.at(-1).variants.at(-1).name);
    await expect(page.locator(`#entry-${data.cars.at(-1).id}`)).toBeVisible();
    await page.locator('#reset').click();
    await expect(page.locator('.car')).toHaveCount(data.cars.length);
    await page.locator('#brand').selectOption(data.cars[0].category);
    await expect(page.locator('.car')).toHaveCount(data.cars.filter(c=>c.category===data.cars[0].category).length);
    await page.locator('#reset').click();
    await page.goto(`/automotive/${slug}/#car=${data.heroId}`);
    await expect(page.locator('#detail-title')).toHaveText(data.cars.find(c=>c.id===data.heroId).name);
    await page.locator('#car-dialog').evaluate(el=>el.scrollTo({top:1500,behavior:'instant'}));
    await page.locator('#close-dialog').click();
    await page.locator('.model-index-item').first().click();
    await expect.poll(()=>page.locator('#car-dialog').evaluate(el=>el.scrollTop)).toBe(0);
    await page.keyboard.press('Escape');
    if(testInfo.project.name.startsWith('mobile')){
      await page.setViewportSize({width:320,height:740});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.locator('.model-index-item').last().click();
      expect(await page.locator('#car-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('brand archive assets are served locally and all five pages are linked from Automotive',async({page,request})=>{
  test.setTimeout(60000);
  const paths=[...new Set(Object.entries(catalogs).flatMap(([slug,data])=>data.cars.flatMap(car=>car.variants.flatMap(v=>v.photos.map(p=>new URL(p.src,`http://127.0.0.1:4173/automotive/${slug}/`).pathname)))))];
  for(let offset=0;offset<paths.length;offset+=12)await Promise.all(paths.slice(offset,offset+12).map(async url=>{
    const response=await request.get(url);expect(response.status(),url).toBe(200);expect(response.headers()['content-type'],url).toMatch(/^image\//);
  }));
  await page.goto('/automotive/');
  for(const slug of slugs)await expect(page.locator(`.archive-directory a[href="${slug}/"]`)).toBeVisible();
});


test('direct film-section links land after the asynchronous timeline has rendered',async({page})=>{
  for(const slug of slugs){
    await page.goto(`/automotive/${slug}/#watch`);
    await expect(page.locator('.film-card')).toHaveCount(catalogs[slug].films.length);
    await expect.poll(()=>page.locator('#watch').evaluate(el=>{const top=el.getBoundingClientRect().top;return top>=-1 && (top<100 || scrollY+innerHeight>=document.documentElement.scrollHeight-1);})).toBe(true);
    await expect(page.locator('#films-title')).toBeInViewport();
  }
});
