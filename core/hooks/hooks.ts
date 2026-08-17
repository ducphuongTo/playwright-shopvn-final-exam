import { test as base, BrowserContext, Page, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/loginPage';
import { HomePage } from '../../page_objects/homePage';
import { CartPage } from '../../page_objects/cartPage';
import { CheckoutPage } from '../../page_objects/checkoutPage';
import { ProfilePage } from '../../page_objects/profilePage';
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
  testData: async ({}, use) => {
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
});

export { expect };
