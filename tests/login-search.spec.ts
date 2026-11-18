import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SearchPage } from '../pages/SearchPage';

test('customer finds products when searching "pliers" (old: no fixtures)', async ({ page }) => {

  await test.step('open the shop', async () => {

    await page.goto('');
    await expect(page.getByTestId('nav-home')).toBeVisible();
  });

  // await test.step('log in', async () => {
  //   await page.goto("/auth/login");
  //   await page.getByLabel('email').fill('customer2@practicesoftwaretesting.com');
  //   await page.getByTestId('password').fill('welcome01');
  //   await page.getByRole('button', { name: 'Login' }).click();
  //
  //   await expect(page).toHaveURL('/account');
  //   await expect(page.getByTestId('page-title')).toContainText('My account');
  //
  // });

  await test.step('log in', async () => {
    const loginPage: LoginPage = new LoginPage(page);
    await loginPage.goToPage();
    await loginPage.performUserLogin(
      process.env.USER_EMAIL!,
      process.env.USER_PASSWORD!
    );
    await expect(page).toHaveURL('/account');
  })


  //    await test.step('search for pliers', async () => {
  //      await page.getByTestId('nav-home').click();
  //      await page.getByTestId('search-query').fill('pliers');
  //      await page.getByTestId('search-query').press('Enter');//
  //
  //      await expect(page.getByTestId('search-term')).toHaveText("pliers");
  //      await expect(page.getByTestId('search-term')).toHaveText("pliers");//
  //
  //      const names = page.getByTestId('search_completed').getByTestId('product-name');//
  //
  //      await expect(names.first()).toBeVisible();
  //      expect(await names.count()).toBeGreaterThan(1);//
  //
  //    });

  await test.step('search for "pliers"', async () => {
    const searchPage: SearchPage = new SearchPage(page);
    await searchPage.goToHomePage();
    await searchPage.searchProductByName('pliers');

    await expect(searchPage.searchTerm).toHaveText('pliers');
    const names = searchPage.productNames;
    await expect(names.first()).toBeVisible();
    expect(await names.count()).toBeGreaterThan(1);
  });

}); 