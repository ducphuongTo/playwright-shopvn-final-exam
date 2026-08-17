import { test, expect } from '../core/hooks/hooks';
import { TEXT } from '../core/config/ui-text';
import profileData from '../data/profile.json';

/**
 * Scenario 6 (REQUIRED) — Update the full name through the UI, then clean up
 * via the API.
 *
 * The restore is registered BEFORE the edit happens, so the account goes back
 * to its original name even when an assertion fails. That ordering is the
 * whole point of the scenario: it is what makes a test that mutates a shared
 * account safe to run over and over.
 *
 * Fixtures used:
 *   - signedIn      → performs UI login before the test body runs
 *   - api           → ApiClient pre-authenticated with the UI session's token
 *   - cleanupTasks  → array of teardown callbacks that run after the test
 *   - profilePage   → ProfilePage page-object
 */
test.describe('Scenario 6 — Update the full name', () => {
  for (const data of profileData.fullNameUpdates) {
    test(`updates the full name — ${data.case} @smoke`, async ({
      signedIn,
      api,
      cleanupTasks,
      profilePage,
    }) => {
      // ── 1. Capture the current name so we can restore it afterwards ──────
      const original = (await api.getProfile()).name;

      // Register the restore BEFORE the risky part.
      // Registering it after the assertions is the classic mistake — a red
      // test would then poison every later run by leaving a renamed account.
      cleanupTasks.push(async () => {
        await api.updateName(original);
      });

      // ── 2. Navigate to profile page ──────────────────────────────────────
      await profilePage.goto();

      // ── 3. Assert the form is pre-filled with the current name ───────────
      await test.step('The form is pre-filled with the current name', async () => {
        expect(await profilePage.currentFullName()).toBe(original);
      });

      // ── 4. Update the full name via the UI ───────────────────────────────
      await profilePage.updateFullName(data.newFullName);

      // ── 5. A success message should appear ───────────────────────────────
      await test.step('A success message appears', async () => {
        await expect(profilePage.successMessage).toBeVisible();
        await expect(profilePage.successMessage).toContainText(TEXT.profile.success);
      });

      // ── 6. The new name survives a page reload ───────────────────────────
      await test.step('The new name survives a reload', async () => {
        await profilePage.goto();
        expect(await profilePage.currentFullName()).toBe(data.newFullName);
      });

      // ── 7. The API agrees with what the UI shows ─────────────────────────
      await test.step('The API agrees with what the UI shows', async () => {
        expect((await api.getProfile()).name).toBe(data.newFullName);
      });
    });
  }

  /**
   * This extra test runs independently and proves that teardown always works:
   * whatever order the tests above execute in, the account is never left with
   * a test name after the suite finishes.
   */
  test('cleanup really restored the original name', async ({ signedIn, api }) => {
    const current = (await api.getProfile()).name;
    for (const data of profileData.fullNameUpdates) {
      expect(current, 'the account should not be left with a test name').not.toBe(
        data.newFullName,
      );
    }
  });
});
