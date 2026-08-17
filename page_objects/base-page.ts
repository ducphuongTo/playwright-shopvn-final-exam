import { Page, expect, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async waitForLoaded() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }

  async assertAndCapture(locator: Locator, expectedText: string, name: string) {
    await expect(locator).toContainText(expectedText);
    await this.takeScreenshot(name);
  }
}