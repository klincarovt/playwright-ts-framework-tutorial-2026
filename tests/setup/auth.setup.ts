import path from 'node:path';
import { test as setup, expect } from '../../fixtures/fixtures';

const authFile = path.join(__dirname,'../playwright/.auth/user.json');

setup('authenticate as customer', async ({ page ,loginPage }) => {
    await loginPage.goToPage();
    await loginPage.performUserLogin(
      process.env.USER_EMAIL!,
      process.env.USER_PASSWORD!
    );
    await expect(page).toHaveURL('/account');
    await page.context().storageState({path: authFile});

});
