import { test as base, BrowserContext, Page, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/login-page';
import { HomePage } from '../../page_objects/home-page';
import { CartPage } from '../../page_objects/cart-page';
import { CheckoutPage } from '../../page_objects/checkout-page';
import { ProfilePage } from '../../page_objects/profile-page';
import { ApiClient } from '../api/apiClient';
import { loadJsonData } from '../fixtures/testData';

export type TestFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  profilePage: ProfilePage;
  apiClient: ApiClient;
  authContext: BrowserContext;
  authenticatedPage: Page;
  // New fixtures for better test isolation
  testData: ReturnType<typeof loadJsonData>;
  authenticatedUser: { page: Page; apiClient: ApiClient; token: string };
  cleanCart: () => Promise<void>;
  // ── Scenario-6 fixtures ──────────────────────────────────────────────────
  /** Performs a UI login and leaves the browser in the authenticated state. */
  signedIn: void;
  /** ApiClient pre-authenticated with the same token the UI has. */
  api: ApiClient;
  /** Register async teardown callbacks here; they run after the test body. */
  cleanupTasks: Array<() => Promise<void>>;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  apiClient: async ({}, use) => {
    const client = new ApiClient();
    await client.init();
    await use(client);
    await client.dispose();
  },
  authContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },
  authenticatedPage: async ({ authContext }, use) => {
    const page = await authContext.newPage();
    await use(page);
    await page.close();
  },
  // Load test data once and reuse across tests
  testData: async ({}, use: (data: ReturnType<typeof loadJsonData>) => Promise<void>) => {
    const data = loadJsonData();
    await use(data);
  },
  // Create authenticated user (logged in) for tests that need it
  authenticatedUser: async ({ page, apiClient, testData }, use) => {
    // Navigate to login page
    await page.goto('/login', { waitUntil: 'load' });
    
    // Fill login form
    const loginPage = new LoginPage(page);
    await loginPage.login(testData.login.validUser.username, testData.login.validUser.password);
    
    // Get token from sessionStorage
    const token = await page.evaluate(() => sessionStorage.getItem('token'));
    if (!token) {
      throw new Error('Failed to obtain authentication token');
    }
    
    // Set token in API client
    apiClient.setToken(token);
    
    // Provide authenticated context to test
    await use({
      page,
      apiClient,
      token,
    });
    
    // Cleanup: Clear session storage and local storage after test
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  },
  // Authenticate once, then provide a reliable API-based cart reset.
  cleanCart: async ({ apiClient, testData }, use) => {
    const loginResponse = await apiClient.login(
      testData.login.validUser.username,
      testData.login.validUser.password,
    );
    expect(
      loginResponse.ok(),
      `API login failed with status ${loginResponse.status()}`,
    ).toBeTruthy();

    const cleanCartFunction = async () => {
      const response = await apiClient.clearCart();
      expect(
        response.ok(),
        `Cart cleanup failed with status ${response.status()}`,
      ).toBeTruthy();
    };

    await use(cleanCartFunction);

    // Keep the shared practice account isolated from following tests,
    // including when the test body fails.
    await cleanCartFunction();
  },

  // ── Scenario-6 fixtures ──────────────────────────────────────────────────

  /**
   * `signedIn` — navigates to /login, fills credentials, and waits until
   * the browser lands on an authenticated route.  Tests that depend on this
   * fixture start with a logged-in browser session.
   */
  signedIn: async ({ page, testData }, use) => {
    await page.goto('/login', { waitUntil: 'load' });
    const loginPage = new LoginPage(page);
    await loginPage.login(
      testData.login.validUser.username,
      testData.login.validUser.password,
    );
    await use();
  },

  /**
   * `api` — an ApiClient whose Bearer token is taken from the browser's
   * sessionStorage (set by the `signedIn` fixture).  This ensures the UI
   * and the API calls act as the same user in the same test run.
   */
  api: async ({ page, signedIn }, use) => {
    const token = await page.evaluate(() => sessionStorage.getItem('token'));
    const client = new ApiClient();
    await client.init();
    client.setToken(token ?? undefined);
    await use(client);
    await client.dispose();
  },

  /**
   * `cleanupTasks` — an empty array that the test body populates with async
   * teardown callbacks.  All tasks run after `use()` returns, even when the
   * test fails, so mutations are always rolled back.
   */
  cleanupTasks: async ({}, use) => {
    const tasks: Array<() => Promise<void>> = [];
    await use(tasks);
    // Run teardown in registration order (FIFO).
    for (const task of tasks) {
      await task().catch((err) =>
        console.error('cleanupTask failed:', err),
      );
    }
  },
});

export { expect };
