const {test,expect}=require('@playwright/test');
const data=require('../automotive/porsche/data.json');

test('911 generations and the 930 milestone retain their own variants and links',async({page})=>{
  const entries=[
    ['911',1963,['Original 911 / F series','Classic Targa']],
    ['911-g-series',1973,['G series','G-series Cabriolet']],
    ['930-turbo',1974,['930 Turbo']],
    ['911-964',1988,['964']],['911-993',1993,['993']],
    ['911-996',1997,['996']],['911-997',2004,['997']],
    ['911-991',2011,['991','991 Targa']],
    ['911-992',2018,['992','992 GT3 RS','992 Dakar']],
  ];
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/automotive/porsche/');
  await expect(page.locator('.car')).toHaveCount(data.cars.length);
  const years=(await page.locator('.car>.year').allTextContents()).map(Number);
  expect(years).toEqual([...years].sort((a,b)=>a-b));
  for(const [id,year,variants] of entries){
    const car=data.cars.find(car=>car.id===id);
    expect(car.year).toBe(year);
    expect(car.variants.map(v=>v.name)).toEqual(variants);
    await expect(page.locator(`#entry-${id}>.year`)).toHaveText(String(year));
    await page.locator(`.model-index-item[data-car="${id}"]`).click();
    await expect(page.locator('#detail-title')).toHaveText(car.name);
    await expect(page.locator('#car-dialog .generation')).toHaveCount(variants.length);
    await expect(page).toHaveURL(new RegExp(`#car=${id}$`));
    await page.locator('#car-dialog [data-gallery="main"] img').first().evaluate(img=>img.decode());
    expect(await page.locator('#car-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
    await page.keyboard.press('Escape');
  }
  await page.goto('/automotive/porsche/#car=911');
  await expect(page.locator('#detail-title')).toHaveText('911 (original / F series)');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
