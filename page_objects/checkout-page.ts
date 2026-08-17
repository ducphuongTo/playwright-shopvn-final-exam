import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class CheckoutPage extends BasePage {
  readonly fullNameInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameInput = page.getByTestId('checkout-name');
    this.phoneInput = page.getByTestId('checkout-phone');
    this.addressInput = page.getByTestId('checkout-address');
    this.placeOrderButton = page.getByTestId('checkout-submit');
  }

  async fillReceiverInfo(fullName: string, phone: string, address: string, city: string, note: string) {
    await this.fullNameInput.fill(fullName);
    await this.phoneInput.fill(phone);
    await this.addressInput.fill(address);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }

  async expectSuccess() {
    await expect(this.page.locator('body')).toContainText(/Đặt hàng|thành công|success|Order/i);
  }
}
