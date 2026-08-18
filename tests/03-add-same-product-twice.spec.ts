import { test, expect } from '../core/hooks/hooks';

test.describe('Scenario 3 — Add the same product twice', () => {
  test('Add the same product twice — quantity increments correctly', async ({
    page,
    signedIn,
    homePage,
    testData,
    cleanCart,
  }) => {
    await cleanCart();

    await test.step('Add the same product to cart twice', async () => {
      await homePage.goto();
      await homePage.addToCart(testData.products.singleProduct.name);
      await homePage.addToCart(testData.products.singleProduct.name);
    });

    await test.step('Open the cart and take a screenshot', async () => {
      await homePage.openCart();
      await homePage.takeScreenshot('cart-quantity-2');
    });

    await test.step('The product appears as a single row with quantity 2', async () => {
      const productRow = page
        .locator('.cart-item')
        .filter({ hasText: testData.products.singleProduct.name });

      await expect(productRow).toHaveCount(1);
      await expect(productRow.getByText('2', { exact: true })).toBeVisible();
    });
  });
});
