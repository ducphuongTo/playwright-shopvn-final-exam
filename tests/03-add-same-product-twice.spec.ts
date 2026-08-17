import { test, expect } from '../core/hooks/hooks';

test('Add the same product twice — quantity increments correctly', async ({ page, loginPage, homePage, testData, cleanCart }) => {
  // Clean cart before test
  await cleanCart();
  
  await loginPage.goto();
  await loginPage.login(testData.login.validUser.username, testData.login.validUser.password);
  await homePage.goto();
  await homePage.addToCart(testData.products.singleProduct.name);
  await homePage.addToCart(testData.products.singleProduct.name);
  await homePage.openCart();
  await homePage.takeScreenshot('cart-quantity-2');

  const productRow = page
    .locator('.cart-item')
    .filter({ hasText: testData.products.singleProduct.name });

  await expect(productRow).toHaveCount(1);
  await expect(productRow.getByText('2', { exact: true })).toBeVisible();
});
