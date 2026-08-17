import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

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
    this.productRow = (productName: string) => this.itemRows.filter({
      has: page.locator('.item-name', {
        hasText: new RegExp(`^${escapeRegExp(productName)}$`),
      }),
    });
  }

  async open() {
    await this.page.goto('/cart');
    await expect(this.page).toHaveURL(/\/cart/);
  }

  async expectCartHasItems(count: number) {
    await expect(this.itemRows).toHaveCount(count);
  }

  async removeFirstItem() {
    await expect(this.itemRows.first()).toBeVisible();
    const itemCount = await this.itemRows.count();
    expect(itemCount, 'Expected at least one item in the cart').toBeGreaterThan(0);

    const cartSaved = this.waitForCartSave();
    await this.itemRows.first().locator('.remove-btn').click();
    await cartSaved;
    await expect(this.itemRows).toHaveCount(itemCount - 1);
  }

  async removeAllItems() {
    while (await this.itemRows.count()) {
      const itemCount = await this.itemRows.count();
      const cartSaved = this.waitForCartSave();

      await this.itemRows.first().locator('.remove-btn').click();
      await cartSaved;
      await expect(this.itemRows).toHaveCount(itemCount - 1);
    }
  }
  
  async getProductQuantity(productName: string) {
    return this.productRow(productName)
        .locator('.qty-value')
        .textContent();
  }

  private async waitForCartSave() {
    const response = await this.page.waitForResponse((candidate) =>
      candidate.url().includes('/api/cart') &&
      candidate.request().method() === 'PUT',
    );

    expect(
      response.ok(),
      `Cart save failed with status ${response.status()}`,
    ).toBeTruthy();
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
