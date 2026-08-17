import { test, expect } from '../core/hooks/hooks';
import { loadJsonData } from '../core/fixtures/testData';

const data = loadJsonData();

test.beforeEach(async ({ page }) => {
  // Clear cart before each test - navigate to home first
  try {
    await page.goto('/home', { waitUntil: 'load' });
    await page.evaluate(() => localStorage.removeItem('cart'));
    await page.evaluate(() => sessionStorage.clear());
  } catch (error) {
    console.log('beforeEach navigation error:', error);
  }
});

test('Add a single product to cart — verify quantity & cart page', async ({ page, loginPage, homePage }) => {
  await loginPage.goto();
  await loginPage.login(data.login.validUser.username, data.login.validUser.password);
  await homePage.goto();
  await homePage.addToCart(data.products.singleProduct.name);
  await homePage.openCart();
  await expect(page).toHaveURL(/\/cart/);
  await homePage.takeScreenshot('cart-with-single-product');
  await expect(page.locator('body')).toContainText(data.products.singleProduct.name);
  await expect(page.locator('body')).toContainText('1');
});
