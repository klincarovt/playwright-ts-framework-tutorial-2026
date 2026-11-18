import { test, expect } from '@playwright/test';

const API = 'https://api.practicesoftwaretesting.com';

test('product search API returns pliers', async ({ request }) => {
    const response = await request.get(`${API}/products/search?q=pliers`);
    //console.log(response);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.length).toBeGreaterThan(1);
});

test('login API returns a token', async ({ request }) => {
  const response = await request.post(`${API}/users/login`, {
    data: {
      email: process.env.USER_EMAIL!,
      password: process.env.USER_PASSWORD!
    },
  });

  console.log(response);
  
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.access_token).toBeTruthy();
});