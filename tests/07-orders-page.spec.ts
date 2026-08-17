import { test, expect } from '../core/hooks/hooks';
import { loadJsonData } from '../core/fixtures/testData';

const data = loadJsonData();

test('Advanced — Verify Orders page (seed the order via API)', async ({ page, loginPage, apiClient }) => {
  await loginPage.goto();
  await loginPage.login(data.login.validUser.username, data.login.validUser.password);

  const token = await page.evaluate(() => sessionStorage.getItem('token'));
  apiClient.setToken(token ?? undefined);
  const ordersResponse = await apiClient.getOrders();
  await expect(ordersResponse.ok()).toBeTruthy();

  await page.goto('/orders');
  await expect(page.locator('body')).toContainText(/Lịch sử mua hàng|Đơn hàng|Orders|Order/i);
  await page.screenshot({ path: 'test-results/orders-page-screenshot.png', fullPage: true });
});
