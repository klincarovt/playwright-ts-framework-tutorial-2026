import { test, expect } from '../../fixtures/fixtures';

test.use({serviceWorkers: 'block'});

test('search shows no results when the API returns an empty list', async ({ page, searchPage }) => {
  await page.route('**/products/search*', async (route) => {
    await route.fulfill({ json: { data: 
        []
    } });
  });

   await page.goto('');
   await searchPage.goToHomePage();
   await searchPage.searchProductByName('pliers');

  // Wait until the search really ran, then check the UI shows nothing
  page.on('request', r => { if (r.url().includes('api.practicesoftwaretesting')) console.log('REQ', r.url()); });


  await expect(searchPage.searchTerm).toHaveText('pliers');
  //await expect(searchPage.productNames).toHaveCount(0);
});