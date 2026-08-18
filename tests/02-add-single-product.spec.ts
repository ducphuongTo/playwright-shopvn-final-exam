import { test, expect } from '../core/hooks/hooks';

test.describe('Scenario 2 — Add a single product to cart', () => {
  test('Add a single product to cart — verify quantity & cart page', async ({
    signedIn,
    homePage,
    cartPage,
    page,
    testData,
    cleanCart,
  }) => {
    await cleanCart();

    const productName = testData.products.singleProduct.name;

    await test.step('Add the product to cart from the home page', async () => {
      await homePage.goto();
      await homePage.addToCart(productName);
    });

    await test.step('Open the cart page', async () => {
      await homePage.openCart();
      await expect(page).toHaveURL(/\/cart/);
    });

    await test.step('The cart shows the correct product with quantity 1', async () => {
      await homePage.takeScreenshot('cart-with-single-product');
      await expect(cartPage.productRow(productName)).toHaveCount(1);
      await expect
        .poll(() => cartPage.getProductQuantity(productName))
        .toBe('1');
    });
  });
});
