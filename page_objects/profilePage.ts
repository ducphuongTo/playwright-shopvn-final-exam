import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './basePage';

export class ProfilePage extends BasePage {
  readonly fullNameField: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    // Try multiple selectors for profile form elements
    this.fullNameField = page.locator('input[type="text"], input[placeholder*="Nguyễn"], input[name="fullName"]').first();
    this.saveButton = page.locator('button:has-text("Lưu"), button:has-text("Save"), button').filter({ hasText: /Lưu|Save/ }).first();
  }

  async open() {
    await this.page.goto('/profile', { waitUntil: 'load' });
    await this.page.waitForTimeout(800);
    // Wait for text input field specifically (not file input)
    await this.page.waitForSelector('input[type="text"]', { timeout: 10000 });
  }

  async updateFullName(value: string) {
    // Wait for any input field and then fill the first one
    await this.page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await this.page.waitForTimeout(500);
    await this.fullNameField.fill(value);
    await this.page.waitForTimeout(500);
    await this.saveButton.click();
    await this.page.waitForTimeout(800);
  }

  async expectName(value: string) {
    await expect(this.page.locator('body')).toContainText(value);
  }
}
