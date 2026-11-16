import { Page, Locator } from '@playwright/test';

export class LoginPage {

    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(private readonly page: Page) {
        this.emailInput = page.getByTestId('email');
        this.passwordInput = page.getByTestId('password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
    }

    async goToPage() {
        await this.page.goto("/auth/login");
    }


    async performUserLogin(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}