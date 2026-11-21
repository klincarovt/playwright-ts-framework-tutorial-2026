import { test, expect } from '../../fixtures/fixtures';

const API = 'https://api.practicesoftwaretesting.com';

// API tests need no browser login → don't load the saved storageState
test.use({ storageState: { cookies: [], origins: [] } });


test('product search API returns pliers', async ({ productsClient }) => {
  //const response = await request.get(`${API}/products/search?q=pliers`);
  const response = await productsClient.search('pliers');

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.length).toBeGreaterThan(1);
});

test('login API returns a token', async ({ authClient }) => {
  const response = await authClient.login(process.env.USER_EMAIL!, process.env.USER_PASSWORD!);

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.access_token).toBeTruthy();
});