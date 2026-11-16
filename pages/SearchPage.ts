import { Page, Locator } from "@playwright/test";

export class SearchPage {

    readonly navigateHome: Locator;
    readonly searchInput: Locator;
    readonly searchTerm: Locator;
    readonly searchCompleted: Locator;
    readonly productNames: Locator;

    constructor(private readonly page: Page) {
        this.navigateHome = page.getByTestId('nav-home');
        this.searchInput = page.getByTestId('search-query');
        this.searchTerm = page.getByTestId('search-term');
        this.searchCompleted = page.getByTestId('search_completed');
        this.productNames= this.searchCompleted.getByTestId('product-name');
    }

    async goToHomePage() {
        await this.navigateHome.click();
    }

    async searchProductByName(name: string) {
        await this.searchInput.fill(name);
        await this.searchInput.press('Enter');
    }
}