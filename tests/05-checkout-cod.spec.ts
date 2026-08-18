import { test } from '../core/hooks/hooks';

test.describe('Scenario 5 — COD checkout', () => {
  test('Checkout succeeds with valid receiver info (COD)', async ({
    signedIn,
    homePage,
    cartPage,
    checkoutPage,
    testData,
  }) => {
    const { customer } = testData.checkout;

    await homePage.goto();
    await homePage.addToCart(testData.products.singleProduct.name);
    await homePage.openCart();
    await cartPage.checkoutButton.click();
    await checkoutPage.fillReceiverInfo(
      customer.fullName,
      customer.phone,
      customer.address,
    );
    await checkoutPage.placeOrder();
    await checkoutPage.expectSuccess();
    await checkoutPage.takeScreenshot('checkout-success');
  });
});
