import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button').filter({ hasText: 'Đăng nhập' }).first();
    this.registerLink = page.getByRole('link', { name: 'Đăng ký' });
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.page).toHaveURL(/\/login$/);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    if (username && password) {
      await this.page.waitForURL(/\/(home|profile|cart|orders)/, { timeout: 15000 });
      await expect
        .poll(() => this.page.evaluate(() => sessionStorage.getItem('token')), {
          message: 'Token not found in sessionStorage after login',
        })
        .toBeTruthy();
    }
  }

  async loginWithEmptyCredentials() {
    await this.login('', '');
  }

  async expectLoginError() {
    await expect(this.page.locator('body')).toContainText(/Vui lòng|đăng nhập|Thông báo|error/i);
  }
}
