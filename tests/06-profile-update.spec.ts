import { test, expect } from '../core/hooks/hooks';
import { TEXT } from '../core/config/ui-text';
import profileData from '../data/profile.json';

test.describe('Scenario 6 — Update the full name', () => {
  for (const data of profileData.fullNameUpdates) {
    test(`updates the full name — ${data.case} @smoke`, async ({
      signedIn,
      api,
      cleanupTasks,
      profilePage,
    }) => {
      const original = (await api.getProfile()).name;

      cleanupTasks.push(async () => {
        await api.updateName(original);
      });

      await profilePage.goto();

      await test.step('The form is pre-filled with the current name', async () => {
        expect(await profilePage.currentFullName()).toBe(original);
      });

      await profilePage.updateFullName(data.newFullName);

      await test.step('A success message appears', async () => {
        await expect(profilePage.successMessage).toBeVisible();
        await expect(profilePage.successMessage).toContainText(TEXT.profile.success);
      });

      await test.step('The new name survives a reload', async () => {
        await profilePage.goto();
        expect(await profilePage.currentFullName()).toBe(data.newFullName);
      });

      await test.step('The API agrees with what the UI shows', async () => {
        expect((await api.getProfile()).name).toBe(data.newFullName);
      });
    });
  }

  test('cleanup really restored the original name', async ({ signedIn, api }) => {
    const current = (await api.getProfile()).name;
    for (const data of profileData.fullNameUpdates) {
      expect(current, 'the account should not be left with a test name').not.toBe(
        data.newFullName,
      );
    }
  });
});
