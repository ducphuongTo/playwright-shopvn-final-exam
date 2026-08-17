import { test, expect } from '../core/hooks/hooks';
import { loadJsonData } from '../core/fixtures/testData';

const data = loadJsonData();

test.describe('Scenario 5 — COD checkout', () => {

  test('Checkout succeeds with valid receiver info (COD)', async ({ loginPage, page, homePage, checkoutPage }) => {
      await loginPage.goto();
      await loginPage.login(data.login.validUser.username, data.login.validUser.password);
      await homePage.goto();
      await homePage.addToCart(data.products.singleProduct.name);
      await homePage.openCart();
      await page.locator('.checkout-btn').click();
      await checkoutPage.fillReceiverInfo(
      data.checkout.customer.fullName,
      data.checkout.customer.phone,
      data.checkout.customer.address,
      data.checkout.customer.city,
      data.checkout.customer.note,
      );
      await checkoutPage.placeOrder();
      await checkoutPage.expectSuccess();
      await checkoutPage.takeScreenshot('checkout-success');
  });
});
