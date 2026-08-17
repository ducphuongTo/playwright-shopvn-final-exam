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
    // Ensure we're on home page and products are loaded
    if (!this.page.url().includes('/home')) {
      await this.goto();
    }
    // Wait for button to be visible and clickable
    await this.page.waitForSelector('button:has-text("Thêm vào giỏ")', { timeout: 15000 }).catch(() => {
      console.log('Button not found, retrying navigation...');
    });
    await this.page.waitForTimeout(1000);
    const button = this.page.locator('button').filter({ hasText: 'Thêm vào giỏ' }).first();
    try {
      await button.waitFor({ state: 'visible', timeout: 10000 });
      await button.click();
    } catch (error) {
      console.log('Error clicking button, retrying:', error);
      await this.goto();
      await this.page.waitForTimeout(1000);
      await button.click();
    }
    await this.page.waitForTimeout(800);
  }

  async openCart() {
    await this.cartButton.click();
  }

  async expectCartItemCount(expected: number) {
    await expect(this.page.locator('text=/\d+/')).toContainText(String(expected));
  }

  async expectProductVisible(productName: string) {
    await expect(this.page.getByText(productName, { exact: true })).toBeVisible();
  }
}
