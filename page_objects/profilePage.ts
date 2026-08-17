import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './basePage';

export class ProfilePage extends BasePage {
  /**
   * The editable full-name text input.
   * We target the pf-input class specifically and exclude the readonly
   * username field (pf-input-readonly) to avoid the wrong element.
   */
  readonly fullNameField: Locator;

  /** The "Lưu thay đổi" save button. */
  readonly saveButton: Locator;

  /**
   * The success paragraph rendered by the app after a successful save.
   * The app uses class "pf-success" on a <p> element.
   */
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameField = page.locator('input.pf-input:not(.pf-input-readonly)').first();
    this.saveButton = page.locator('button.pf-save-btn');
    this.successMessage = page.locator('p.pf-success');
  }

  /**
   * Navigate to the profile page using SPA-style navigation.
   *
   * The app is a client-side SPA that stores auth in sessionStorage.
   * A hard `page.goto('/profile')` re-boots the JS bundle and does NOT
   * restore auth from sessionStorage, so the app shows the login form even
   * though the URL is /profile.
   *
   * The safe pattern is:
   *   1. Go to /home (which bootstraps the SPA with auth intact after login).
   *   2. Click the in-app profile link so the router navigates without a
   *      full page reload.
   *
   * Callers must already be authenticated (use the `signedIn` fixture).
   */
  async goto() {
    // Always navigate home → profile link so the SPA bootstraps with auth.
    // A hard page.goto('/profile') re-boots the JS bundle and loses
    // sessionStorage auth, causing the app to render the login form at /profile.
    await this.page.goto('/home', { waitUntil: 'load' });

    // Click the profile link inside the SPA (client-side routing).
    await this.page.locator('a[href="/profile"]').first().click();
    await this.page.waitForURL(/\/profile/, { timeout: 10000 });
    await this.fullNameField.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Read the current value from the full-name input field.
   */
  async currentFullName(): Promise<string> {
    return this.fullNameField.inputValue();
  }

  /**
   * Clear the full-name field, type the new value, and click Save.
   */
  async updateFullName(value: string) {
    await this.fullNameField.waitFor({ state: 'visible', timeout: 15000 });
    await this.fullNameField.clear();
    await this.fullNameField.fill(value);
    await this.saveButton.click();
  }

  /**
   * Legacy helpers kept for backward compatibility with other specs.
   */
  async open() {
    await this.goto();
  }

  async expectName(value: string) {
    await expect(this.page.locator('body')).toContainText(value);
  }
}
