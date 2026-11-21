import { test, expect } from '../../fixtures/fixtures'
import  Products  from '../../data/products.json';


test.describe("productuct search", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
    });

    for (const product of Products) {
        test(`find results for ${product}`, { tag: '@smoke' }, async ({ page, searchPage }) => {
            const searchResponse = page.waitForResponse('**/products/search*');
            await searchPage.searchProductByName(product);
            const response = await searchResponse;
            expect(response.status()).toBe(200);

            await expect(searchPage.searchTerm).toHaveText(product);
            await expect(searchPage.productNames.first()).toBeVisible();
        });
    }
});