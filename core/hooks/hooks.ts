import { test as base, expect } from '@playwright/test';
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
  testData: ReturnType<typeof loadJsonData>;
  cleanCart: () => Promise<void>;
  signedIn: void;
  api: ApiClient;
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
  testData: async ({}, use: (data: ReturnType<typeof loadJsonData>) => Promise<void>) => {
    const data = loadJsonData();
    await use(data);
  },

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

    await cleanCartFunction();
  },

  signedIn: async ({ page, testData }, use) => {
    await page.goto('/login', { waitUntil: 'load' });
    const loginPage = new LoginPage(page);
    await loginPage.login(
      testData.login.validUser.username,
      testData.login.validUser.password,
    );
    await use();
  },

  api: async ({ page, signedIn }, use) => {
    const token = await page.evaluate(() => sessionStorage.getItem('token'));
    const client = new ApiClient();
    await client.init();
    client.setToken(token ?? undefined);
    await use(client);
    await client.dispose();
  },

  cleanupTasks: async ({}, use) => {
    const tasks: Array<() => Promise<void>> = [];
    await use(tasks);
    for (const task of tasks) {
      await task().catch((err) =>
        console.error('cleanupTask failed:', err),
      );
    }
  },
});

export { expect };
