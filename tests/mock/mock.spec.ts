import { test, expect } from '../../fixtures/fixtures';

test('search shows no results when the API returns an empty list', async ({ page, searchPage }) => {
  await page.route('**/products/search*', async (route) => {
    await route.fulfill({ json: { data: 
        []
    } });
  });

   await page.goto('');
   await searchPage.goToHomePage();
   await searchPage.searchProductByName('pliers');

  await expect(searchPage.productNames).toHaveCount(0);
});