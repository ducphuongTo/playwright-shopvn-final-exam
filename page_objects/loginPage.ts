import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input').nth(0);
    this.passwordInput = page.locator('input').nth(1);
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
    
    // Only wait for navigation if credentials are provided (valid login attempt)
    if (username && password) {
      try {
        // Wait for navigation and token to be stored
        await this.page.waitForURL(/\/(home|profile|cart|orders)/, { timeout: 15000 });
        await this.page.waitForTimeout(500);
        // Verify token is stored
        const token = await this.page.evaluate(() => sessionStorage.getItem('token'));
        if (!token) {
          throw new Error('Token not found in sessionStorage after login');
        }
      } catch (error) {
        console.log('Login navigation error:', error);
        throw error;
      }
    }
  }

  async loginWithEmptyCredentials() {
    await this.login('', '');
  }

  async expectLoginError() {
    await expect(this.page.locator('body')).toContainText(/Vui lòng|đăng nhập|Thông báo|error/i);
  }
}
