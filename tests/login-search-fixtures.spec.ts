import { test, expect } from '../fixtures/fixtures';

test('logged-in customer finds products when searching "pliers"', async ({ page, loginPage, searchPage }) => {

  await test.step('log in', async () => {
    await loginPage.goToPage();
    await loginPage.performUserLogin(
      process.env.USER_EMAIL!,
      process.env.USER_PASSWORD!
    );
    await expect(page).toHaveURL('/account');
  })

  await test.step('search for "pliers"', async () => {

    await searchPage.goToHomePage();
    await searchPage.searchProductByName('pliers');

    await expect(searchPage.searchTerm).toHaveText('pliers');
    const names = searchPage.productNames;
    await expect(names.first()).toBeVisible();
    expect(await names.count()).toBeGreaterThan(1);
  });
});
