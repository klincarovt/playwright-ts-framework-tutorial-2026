import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SearchPage } from '../pages/SearchPage';
import { ProductsClient } from '../api/ProductsClient';
import { AuthClient } from '../api/AuthClient';

export const test = base.extend<{
    loginPage: LoginPage;
    searchPage: SearchPage;
    authClient: AuthClient;
    productsClient: ProductsClient
}>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    searchPage: async ({ page }, use) => {
        const searchPage = new SearchPage(page);
        await use(searchPage);
    },
    authClient: async ({ request }, use) => {
        await use(new AuthClient(request));
    },
    productsClient: async ({ request }, use) => {
        await use(new ProductsClient(request));
    },

});

export { expect };
