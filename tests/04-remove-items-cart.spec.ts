import { test, expect } from '../core/hooks/hooks';
import { loadJsonData } from '../core/fixtures/testData';

const data = loadJsonData();

test('Remove item from cart — one item and multiple items', async ({ page, loginPage, homePage, cartPage }) => {
  await loginPage.goto();
  await loginPage.login(data.login.validUser.username, data.login.validUser.password);

  await homePage.goto();
  await homePage.addToCart(data.products.singleProduct.name);
  await homePage.openCart();
  await cartPage.removeFirstItem();
  await expect(page.locator('body')).not.toContainText(data.products.singleProduct.name);

  await homePage.goto();
  await homePage.addToCart(data.products.singleProduct.name);
  await homePage.addToCart(data.products.singleProduct.name);
  await homePage.openCart();
  await cartPage.removeAllItems();
  await expect(page.locator('body')).not.toContainText(data.products.singleProduct.name);
});
