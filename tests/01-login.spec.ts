import { test, expect } from '../core/hooks/hooks';
import { loadJsonData } from '../core/fixtures/testData';

const data = loadJsonData();

test('Login fails when username and password are both blank', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.loginWithEmptyCredentials();
  await loginPage.expectLoginError();
  await loginPage.takeScreenshot('login-error-blank-credentials');
  await expect(page).toHaveURL(/\/login$/);
});
