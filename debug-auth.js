const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://testing.platformforge.dev/login');
  await page.locator('input').nth(0).fill('admin');
  await page.locator('input').nth(1).fill('password123');
  await page.locator('button').nth(1).click();
  await page.waitForURL('**/home');
  const token = await page.evaluate(() => sessionStorage.getItem('token'));
  console.log('TOKEN_OK', !!token, token ? token.slice(0, 40) : 'none');
  const headers = { Authorization: `Bearer ${token}` };
  const base = 'https://testing.platformforge.dev/api';
  for (const path of ['/profile', '/cart', '/products', '/orders']) {
    const res = await page.request.get(base + path, { headers });
    console.log('PATH', path, 'STATUS', res.status());
    console.log(await res.text());
  }
  await browser.close();
})();
