import { test, expect } from '../core/hooks/hooks';

test.describe('Scenario 7 — Orders page, seeded via the API', () => {
  test('Advanced — Verify Orders page (seed the order via API)', async ({
    page,
    signedIn,
    api,
  }) => {
    const ordersResponse = await api.getOrders();
    expect(ordersResponse.ok()).toBeTruthy();

    await page.goto('/orders');
    await expect(page.locator('body')).toContainText(
      /Lịch sử mua hàng|Đơn hàng|Orders|Order/i,
    );
    await page.screenshot({
      path: 'test-results/orders-page-screenshot.png',
      fullPage: true,
    });
  });
});
