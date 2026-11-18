import { test, expect } from '../../fixtures/fixtures';

test('saved login opens My account without logging in', async ({ page }) => {

  await test.step('open My account directly', async () => {
    await page.goto('/account');
await expect(page.getByTestId('page-title')).toContainText('My account');
    await expect(page).toHaveURL('/account');
  })

});
