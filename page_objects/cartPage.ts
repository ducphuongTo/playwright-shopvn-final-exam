import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './basePage';

export class CartPage extends BasePage {
  readonly itemRows: Locator;
  readonly removeButton: Locator;
  readonly checkoutButton: Locator;
  readonly productRow: (productName: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.itemRows = page.locator('.cart-item');
    this.removeButton = page.locator('.remove-btn').first();
    this.checkoutButton = page.locator('.checkout-btn').first();
    this.productRow = (productName: string) => page.locator('main').filter({ hasText: productName });
  }

  async open() {
    await this.page.goto('/cart');
    await expect(this.page).toHaveURL(/\/cart/);
  }

  async expectCartHasItems(count: number) {
    await expect(this.itemRows).toHaveCount(count);
  }

  async removeFirstItem() {
    await this.page.waitForSelector('.remove-btn', { timeout: 5000 });
    await this.removeButton.click();
    await this.page.waitForTimeout(500);
  }

  async removeAllItems() {
    const count = await this.itemRows.count();
    for (let i = 0; i < count; i++) {
      const btn = this.page.locator('.remove-btn').first();
      if (await btn.isVisible()) {
        await btn.click();
        await this.page.waitForTimeout(500);
      }
    }
  }
  
  async getProductQuantity(productName: string) {
    return this.productRow(productName)
        .locator('text=/^\\d+$/')
        .textContent();
  }
}
