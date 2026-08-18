import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class ProfilePage extends BasePage {

  readonly fullNameField: Locator;

  readonly saveButton: Locator;

  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameField = page.locator('input.pf-input:not(.pf-input-readonly)').first();
    this.saveButton = page.locator('button.pf-save-btn');
    this.successMessage = page.locator('p.pf-success');
  }

  async goto() {
    await this.page.goto('/home', { waitUntil: 'load' });

    await this.page.locator('a[href="/profile"]').first().click();
    await this.page.waitForURL(/\/profile/, { timeout: 10000 });
    await this.fullNameField.waitFor({ state: 'visible', timeout: 15000 });
  }


  async currentFullName(): Promise<string> {
    return this.fullNameField.inputValue();
  }


  async updateFullName(value: string) {
    await this.fullNameField.waitFor({ state: 'visible', timeout: 15000 });
    await this.fullNameField.clear();
    await this.fullNameField.fill(value);
    await this.saveButton.click();
  }

  async open() {
    await this.goto();
  }

  async expectName(value: string) {
    await expect(this.page.locator('body')).toContainText(value);
  }
}
