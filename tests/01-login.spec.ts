import { test, expect } from '../core/hooks/hooks';

test.describe('Scenario 1 — Login with blank credentials', () => {
  test('Login fails when username and password are both blank', async ({
    page,
    loginPage,
  }) => {
    await test.step('Navigate to the login page', async () => {
      await loginPage.goto();
    });

    await test.step('Submit the form with both fields empty', async () => {
      await loginPage.loginWithEmptyCredentials();
    });

    await test.step('An error message is shown', async () => {
      await loginPage.expectLoginError();
      await loginPage.takeScreenshot('login-error-blank-credentials');
    });

    await test.step('The browser stays on /login', async () => {
      await expect(page).toHaveURL(/\/login$/);
    });
  });
});
