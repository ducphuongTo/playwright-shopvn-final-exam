const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://testing.platformforge.dev/login');
  console.log('title', await page.title());
  console.log('input_count', await page.locator('input').count());
  console.log('input_info', JSON.stringify(await page.locator('input').evaluateAll(els => els.map(e => ({type:e.type, placeholder:e.placeholder, ariaLabel:e.getAttribute('aria-label'), name:e.name}))), null, 2));
  const clicks = await page.locator('button').evaluateAll(els => els.map(e => e.textContent && e.textContent.trim()));
  console.log('buttons', JSON.stringify(clicks));
  await page.locator('input').nth(0).fill('admin');
  await page.locator('input').nth(1).fill('password123');
  await page.locator('button').filter({ hasText: 'Ðang nh?p' }).click({ timeout: 15000 });
  await page.waitForTimeout(5000);
  console.log('url', page.url());
  console.log('body', (await page.locator('body').innerText()).slice(0, 2000));
  await browser.close();
})();
