import { test, expect } from '../core/hooks/hooks';

test.describe('Scenario 2 — Add a single product to cart', () => {
  test('Add a single product to cart — verify quantity & cart page', async ({
    loginPage,
    homePage,
    page,
    testData,
    cleanCart,
  }) => {
    await cleanCart();

    await test.step('Login with valid credentials', async () => {
      await loginPage.goto();
      await loginPage.login(
        testData.login.validUser.username,
        testData.login.validUser.password,
      );
    });

    await test.step('Add the product to cart from the home page', async () => {
      await homePage.goto();
      await homePage.addToCart(testData.products.singleProduct.name);
    });

    await test.step('Open the cart page', async () => {
      await homePage.openCart();
      await expect(page).toHaveURL(/\/cart/);
    });

    await test.step('The cart shows the correct product and quantity 1', async () => {
      await homePage.takeScreenshot('cart-with-single-product');
      await expect(page.locator('body')).toContainText(
        testData.products.singleProduct.name,
      );
      await expect(page.locator('body')).toContainText('1');
    });
  });
});
