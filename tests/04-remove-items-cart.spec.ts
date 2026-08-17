import { test, expect } from '../core/hooks/hooks';
import { loadJsonData } from '../core/fixtures/testData';

const data = loadJsonData();

test.describe('Scenario 4 — Remove items from the cart', () => {
  test.beforeEach(async ({ cleanCart, loginPage }) => {
    await cleanCart();

    await loginPage.goto();
    await loginPage.login(
      data.login.validUser.username,
      data.login.validUser.password,
    );
  });

  test(
    'Remove one item from cart',
    async ({ homePage, cartPage }) => {
      const productName = data.products.singleProduct.name;

      await homePage.goto();
      await homePage.addToCart(productName);
      await homePage.openCart();

      await cartPage.removeFirstItem();

      await expect(cartPage.productRow(productName)).toHaveCount(0);
    },
  );

  test(
    'Remove all items from cart',
    async ({ homePage, cartPage }) => {
      const productName = data.products.singleProduct.name;

      await homePage.goto();
      await homePage.addToCart(productName);
      await homePage.addToCart(productName);
      await homePage.openCart();

      await expect(cartPage.productRow(productName)).toHaveCount(1);

      await expect
        .poll(() => cartPage.getProductQuantity(productName))
        .toBe('2');

      await cartPage.removeAllItems();

      await expect(cartPage.itemRows).toHaveCount(0);
    },
  );
});