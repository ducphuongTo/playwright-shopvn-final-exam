import { test, expect } from '../core/hooks/hooks';
import { loadJsonData } from '../core/fixtures/testData';

const data = loadJsonData();

test('Advanced — Update Full Name, then clean up via the API', async ({ page, loginPage, profilePage, apiClient }) => {
  await loginPage.goto();
  await loginPage.login(data.login.validUser.username, data.login.validUser.password);
  await profilePage.open();
  await profilePage.updateFullName(data.profile.updatedName);
  await profilePage.expectName(data.profile.updatedName);
  await profilePage.takeScreenshot('profile-updated');

  const token = await page.evaluate(() => sessionStorage.getItem('token'));
  apiClient.setToken(token ?? undefined);
  const response = await apiClient.getProfile();
  await expect(response.ok()).toBeTruthy();
});
