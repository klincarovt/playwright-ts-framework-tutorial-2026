import { test, expect } from '../../fixtures/fixtures';

// Start logged out, so only the API login below can log the UI in
test.use({ storageState: { cookies: [], origins: [] } });

test('API login lets the UI open My account', async ({ authClient, page }) => {

    const response = await authClient.login(process.env.USER_EMAIL!, process.env.USER_PASSWORD!);

    expect(response.status()).toBe(200);
    const { access_token } = await response.json();

    await page.addInitScript((token) => {
        window.localStorage.setItem('auth-token', token)
    }, access_token);

    await page.goto('/account');
    await expect(page.getByTestId('page-title')).toContainText('My account');

})
