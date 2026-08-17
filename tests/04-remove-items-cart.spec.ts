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

  test('Remove one item from cart', async ({ homePage, cartPage }) => {
    const productName = data.products.singleProduct.name;

    await test.step('Add the product to cart', async () => {
      await homePage.goto();
      await homePage.addToCart(productName);
      await homePage.openCart();
    });

    await test.step('Remove the item', async () => {
      await cartPage.removeFirstItem();
    });

    await test.step('The product row is gone', async () => {
      await expect(cartPage.productRow(productName)).toHaveCount(0);
    });
  });

  test('Remove all items from cart', async ({ homePage, cartPage }) => {
    const productName = data.products.singleProduct.name;

    await test.step('Add the product twice to have quantity 2', async () => {
      await homePage.goto();
      await homePage.addToCart(productName);
      await homePage.addToCart(productName);
      await homePage.openCart();
    });

    await test.step('Verify initial state — 1 row, quantity 2', async () => {
      await expect(cartPage.productRow(productName)).toHaveCount(1);
      await expect
        .poll(() => cartPage.getProductQuantity(productName))
        .toBe('2');
    });

    await test.step('Remove all items', async () => {
      await cartPage.removeAllItems();
    });

    await test.step('The cart is empty', async () => {
      await expect(cartPage.itemRows).toHaveCount(0);
    });
  });
});