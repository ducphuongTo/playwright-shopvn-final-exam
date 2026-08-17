import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './basePage';

export class HomePage extends BasePage {
  readonly productButtons: Locator;
  readonly cartButton: Locator;
  readonly welcomeText: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.productButtons = page.locator('button:has-text("Thêm vào giỏ")');
    this.cartButton = page.locator('button').filter({ hasText: '🛒' }).first();
    this.welcomeText = page.locator('text=Xin chào');
    this.productCards = page.locator('body');
  }

  async goto() {
    await this.page.goto('/home', { waitUntil: 'load' });
    await this.page.waitForTimeout(500);
  }

  async addToCart(productName: string) {
    if (!this.page.url().includes('/home')) {
      await this.goto();
    }

    const productCard = this.page.locator('.product-card').filter({
      has: this.page.getByText(productName, { exact: true }),
    });
    await expect(productCard, `Product card for "${productName}"`).toHaveCount(1);

    const button = productCard.getByRole('button', { name: 'Thêm vào giỏ' });
    await expect(button, `Add-to-cart button for "${productName}"`).toBeVisible();

    const cartSaved = this.waitForCartResponse('PUT');
    await button.click();
    await cartSaved;
  }

  async openCart() {
    await this.cartButton.click();
    await expect(this.page).toHaveURL(/\/cart/);
  }

  async expectCartItemCount(expected: number) {
    await expect(this.page.locator('text=/\d+/')).toContainText(String(expected));
  }

  async expectProductVisible(productName: string) {
    await expect(this.page.getByText(productName, { exact: true })).toBeVisible();
  }

  private async waitForCartResponse(method: 'PUT') {
    const response = await this.page.waitForResponse((candidate) =>
      candidate.url().includes('/api/cart') &&
      candidate.request().method() === method,
    );

    expect(
      response.ok(),
      `Cart ${method} failed with status ${response.status()}`,
    ).toBeTruthy();
  }
}
