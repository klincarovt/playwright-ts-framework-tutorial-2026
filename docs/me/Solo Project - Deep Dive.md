# Solo Project - Deep Dive

Builds on `Solo Project - Senior Framework.md` (**same section numbers**). That file says *what* to build and in which order; this one shows *how it looks*, the pitfalls, and the model interview answers.

**How to use it:**
- Build from the main file and from memory first. Open this one when stuck or to check your version.
- The snippets are **reference patterns**, not copy-paste code. Type them yourself, and check the APIs against playwright.dev (versions change).
- Every site-specific detail (endpoint names, form fields, `data-qa` values, ad domains) is marked **verify**: confirm it on the live site before relying on it.

---

## 1. Layers: what may import what

```
tests/*.spec.ts
   └─ imports → src/fixtures/index.ts          (test, expect)
                  └─ builds → src/ui/pages, src/ui/components, src/api/clients, src/data/builders
                                 └─ use → src/config/environments.ts, src/api/endpoints.ts, src/api/models
```

| Allowed | Not allowed | Why |
| --- | --- | --- |
| A spec imports `test` (browser specs) or `apiTest` (API specs) + `expect` from fixtures, and data/builders | A spec does `new LoginPage(page)` | Fixtures own construction and lifecycle |
| A page imports a component | A page imports a client or a fixture | Pages only know the UI |
| A client imports endpoints + models | A client imports `expect` | Assertions belong to the test |
| Anything imports `config` | `config` imports anything from `src/` | Config is the bottom layer |

**Pitfall:** a "utils" folder that grows into a second framework. Rule: utils are **pure functions** (format a price, parse a date), never something that touches `page` or `request`.

---

## 2. Environments: reference shape

```ts
// src/config/environments.ts
import dotenv from 'dotenv';
import path from 'node:path';
import { ROOT } from './paths';

dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

// Keyed by SITE (which app), because this repo targets two different public demo apps.
// In a company project the same map is keyed by environment (dev/staging/prod) and defaults to dev, never prod.
const sites = {
  automationexercise: {
    baseURL: 'https://automationexercise.com',
    apiURL: 'https://automationexercise.com',     // API paths live in endpoints.ts ('/api/...')
    testIdAttribute: 'data-qa',
  },
  saucedemo: {
    baseURL: 'https://www.saucedemo.com',
    apiURL: '',                                   // UI-only site
    testIdAttribute: 'data-test',
  },
} as const;

export type SiteName = keyof typeof sites;

function isSiteName(value: string): value is SiteName {   // validate first, then narrow (no blind `as` cast)
  return Object.hasOwn(sites, value);                     // not `value in sites`: that also matches inherited keys like "toString"
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}: add it to .env (local) or CI secrets`);
  return value;
}

const name = process.env.SITE ?? 'automationexercise';
if (!isSiteName(name)) {
  throw new Error(`Unknown SITE "${name}". Valid: ${Object.keys(sites).join(', ')}`);
}

export const env = {
  name,
  ...sites[name],
  // secrets: read lazily where a test needs them, e.g. env.secret('SAUCE_PASSWORD')
  secret: required,
};
```

```ts
// src/config/paths.ts — the ONLY place file paths are defined
import path from 'node:path';

export const ROOT = path.resolve(__dirname, '../..');
export const AUTH_DIR = path.join(ROOT, 'playwright/.auth');
export const USER_STATE = path.join(AUTH_DIR, 'user.json');
export const ACCOUNT_FILE = path.join(AUTH_DIR, 'account.json');
export const workerStateFile = (index: number) => path.join(AUTH_DIR, `worker-${index}.json`);
```

- **Why `paths.ts`:** setup, teardown, the config and the worker fixture all use these constants, resolved from the project root. "Setup writes to one folder, the config reads another" (your old auth-path bug) can't happen.
- **Why secrets are read lazily (`env.secret(...)`)**: if `required()` ran at import time, *every* run would need *every* secret, even API-only runs. Lazy = fail fast exactly where the value is used.
- **`.env.example`** (committed): one line per variable, no values: `SITE=`, `SAUCE_USER=`, `SAUCE_PASSWORD=`.
- **`.gitignore`:** `.env*` plus `!.env.example`, and `playwright/.auth/`.
- **Two dimensions, don't mix them:** *site* (which app) and *environment* (dev/staging/prod of one app). This repo only needs `SITE`; a company project needs `ENV`. An interviewer may ask why.
- **One repo = one site.** Specs, pages and clients are site-specific, so `SITE=saucedemo npm test` in the automationexercise repo would run the wrong specs against the wrong app (and `apiURL: ''` breaks the API project). The mock task gets its own copy of the starter kit with `SITE` defaulting to `saucedemo`.
- **Pitfall:** loading dotenv in `playwright.config.ts` *and* here. Pick one place (here), because imports run before the config body.
- **Pitfall:** `__dirname` only exists in CommonJS. If `package.json` has `"type": "module"`, use `import.meta.dirname` instead.

**Interview answer, "How do you handle environments?":** *"A typed map is committed and reviewed like code; one variable picks the entry and an unknown value fails immediately. Secrets never live in that file. They come from `.env` locally and CI secrets in the pipeline, validated where they're used. Even site differences like the test-id attribute are config, so the same skeleton runs on two sites. In a company project the map is keyed by environment and the default is dev, never prod."*

---

## 3. Locators: decision examples

| Element | First choice | Why not the alternative |
| --- | --- | --- |
| "Login" button | `getByRole('button', { name: 'Login' })` | `#login-btn`: an implementation detail; the role + name is what the user sees |
| Email field with a label | `getByLabel('Email')` | If there's no label → `getByTestId('login-email')` (**verify** `data-qa` value) |
| One product card among many | `page.locator('.product-card').filter({ hasText: 'Blue Top' })` → then `getByRole('link', { name: 'View Product' })` | `nth(3)`: breaks when the order changes |
| "The first result" (order *is* the behaviour) | `results.first()` + comment `// first result = most relevant` | Fine **with** the comment |
| Text that appears twice | `getByText('Total', { exact: true })` or scope it: `summary.getByText('Total')` | A global `getByText` matches both |

**Pitfall:** `getByRole` with a name that includes changing data (prices, counts). Scope to the container and match the stable part.

---

## 4. Page object + component: reference shape

```ts
// src/ui/components/HeaderComponent.ts
import { type Page, type Locator } from '@playwright/test';

export class HeaderComponent {
  readonly cartLink: Locator;
  readonly loggedInAs: Locator;

  constructor(page: Page) {
    this.cartLink = page.getByRole('link', { name: 'Cart' });
    this.loggedInAs = page.getByText(/Logged in as/);     // verify the exact text
  }

  async openCart() {
    await this.cartLink.click();
  }
}

// src/ui/pages/LoginPage.ts
export class LoginPage {
  readonly header: HeaderComponent;                        // composition: the page HAS a header
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.email = page.getByTestId('login-email');          // verify data-qa values
    this.password = page.getByTestId('login-password');
    this.submit = page.getByTestId('login-button');
    this.error = page.getByText('Your email or password is incorrect!');   // verify
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {          // a user intent, not a fill() wrapper
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
```

- `error` is **exposed as a locator**, and the **test** asserts it (`await expect(loginPage.error).toBeVisible()`). The page never decides pass/fail.
- **Allowed in a page:** a sync guard such as `await this.submit.waitFor()` *if* the page really needs it before acting. It isn't an outcome check.
- **Anemic wrapper to avoid:** `async clickSubmit() { await this.submit.click(); }`. It adds a method name and no meaning.

**Interview answer, "Why no BasePage?":** *"Playwright already injects `page`, auto-waits and navigates, which are the things a Selenium BasePage used to provide. Without that job, a BasePage becomes a dumping ground every page inherits. Shared UI like the header is a component that pages have. If three pages ever share real behaviour, I'd extract it then, Rule of Three."*

---

## 5. API layer: reference shape

```ts
// src/api/endpoints.ts      (paths only, verify each on the API list page)
export const endpoints = {
  productsList: '/api/productsList',
  searchProduct: '/api/searchProduct',
  verifyLogin: '/api/verifyLogin',
  createAccount: '/api/createAccount',
  deleteAccount: '/api/deleteAccount',
  userByEmail: '/api/getUserDetailByEmail',
} as const;

// src/api/models/products.ts
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.string(),          // verify: the site returns "Rs. 500" as a string
  brand: z.string(),
});

export const ProductsListSchema = z.object({
  responseCode: z.literal(200),
  products: z.array(ProductSchema).min(1),
});
export type ProductsList = z.infer<typeof ProductsListSchema>;   // the type comes FROM the schema

// src/api/clients/ProductsClient.ts
import { type APIRequestContext } from '@playwright/test';
import { endpoints } from '../endpoints';

export class ProductsClient {
  constructor(private readonly request: APIRequestContext) {}

  list() {
    return this.request.get(endpoints.productsList);
  }

  search(term: string) {
    return this.request.post(endpoints.searchProduct, { form: { search_product: term } });   // verify field name
  }

  searchWithoutTerm() {                       // exists so the negative case reads clearly in the test
    return this.request.post(endpoints.searchProduct);
  }
}
```

- **Relative paths work here only because `apiURL` and `baseURL` are the same host** (the `request` fixture uses the project's `baseURL`). With a separate API host, give the clients a context with `baseURL: env.apiURL`, the way `workerAccount` does in §6.

**The test (positive, negative, schema):**
```ts
import { apiTest as test, expect } from '../../src/fixtures';   // API specs: API fixtures only, no browser, no login
import { ProductsListSchema } from '../../src/api/models/products';

test('products list matches the contract', { tag: '@smoke' }, async ({ productsClient }) => {
  const response = await productsClient.list();
  // NOT `expect(response.ok()).toBeTruthy()`: HTTP is always 200 on this site, so it can never fail.
  // responseCode: z.literal(200) in the schema is the real status check.
  const body = ProductsListSchema.parse(await response.json());   // throws with a readable error if the shape is wrong
  expect(body.products.length).toBeGreaterThan(0);
});

test('search without the parameter returns 400 in the body', async ({ productsClient }) => {
  const body = await (await productsClient.searchWithoutTerm()).json();
  expect(body.responseCode).toBe(400);      // HTTP is 200 on this site: the body is the truth
});
```

**Optional senior touch, a custom matcher** (when `responseCode` checks repeat everywhere):
```ts
// src/fixtures/matchers.ts
import { expect as base, type APIResponse } from '@playwright/test';

export const expect = base.extend({
  async toHaveResponseCode(response: APIResponse, expected: number) {
    const body = await response.json();
    const pass = body.responseCode === expected;
    return {
      pass,
      message: () =>
        `expected responseCode ${this.isNot ? 'not ' : ''}${expected}, got ${body.responseCode}: ${JSON.stringify(body)}`,
    };
  },
});
// usage: await expect(response).toHaveResponseCode(404);
```

**Pitfalls:**
- **Checks that can't fail:** `response.ok()`, `toBeOK()` or `status() === 200` always pass on this site, even for errors. Elsewhere `await expect(response).toBeOK()` is the right check; here it proves nothing. (First entry for `docs/ai-review.md`.)
- `response.json()` on this site may come with a `text/html` content type. Playwright parses the body anyway, but note it under "Issues found".
- Don't `parse` negative responses with the positive schema. Give errors their own small schema (`{ responseCode, message }`).

**Interview answer, "How do you structure API tests?":** *"One client per resource returns raw responses; tests own the assertions. For each endpoint: a positive case with a schema check (zod, so the type and the validation can't drift), the negative cases the contract defines (400, 404, 405), and a lifecycle test that creates, reads and deletes, so it cleans up after itself. On this site the HTTP status is always 200, so I assert the body's `responseCode` and I'd raise that as a contract defect."*

---

## 6. Fixtures: reference shapes

**UI fixtures, with ad blocking for every test:**
```ts
// src/fixtures/ui.fixtures.ts
import { test as base, type BrowserContext } from '@playwright/test';

const AD_HOSTS = /googlesyndication|doubleclick|googleadservices|adservice\.google|fundingchoicesmessages/;   // verify in DevTools → Network

// One function, used by the overridden `context` fixture AND by every context we open ourselves (§15)
export async function blockAds(context: BrowserContext) {
  await context.route(AD_HOSTS, (route) => route.abort());
}

export const test = base.extend<{ loginPage: LoginPage }>({
  context: async ({ context }, use) => {          // override the built-in fixture: applies to every page from it
    await blockAds(context);
    await use(context);
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```

**Pitfall: contexts you open yourself.** Two different things happen:
- **Routes never carry over.** The override only covers the built-in `context`, so a context from `browser.newContext()` has **no ad blocking** → call `blockAds()`.
- **Options may carry over.** Inside Playwright Test, `browser.newContext()` can pick up the project's context options, **including `storageState`**. Playwright's own per-worker auth example passes `storageState: undefined` "to authenticate in a clean environment". So be explicit both ways: `browser.newContext({ baseURL: env.baseURL, storageState: undefined })` (§15). Check once: `expect(await context.cookies()).toEqual([])` right after creating it.

**API fixtures, with a worker-scoped account** (2nd type parameter = worker fixtures):
```ts
// src/fixtures/api.fixtures.ts
import { test as base } from '@playwright/test';

type WorkerFixtures = { workerAccount: User };

export const test = base.extend<{ productsClient: ProductsClient; userClient: UserClient; freshAccount: User }, WorkerFixtures>({
  productsClient: async ({ request }, use) => {
    await use(new ProductsClient(request));
  },
  userClient: async ({ request }, use) => {
    await use(new UserClient(request));
  },

  // test-scoped: for the rare test that needs a clean account (requested by name, so it's lazy)
  freshAccount: async ({ userClient }, use) => {
    const user = buildUser();
    await userClient.create(user);
    await use(user);
    await userClient.delete(user.email, user.password);
  },

  workerAccount: [async ({ playwright }, use, workerInfo) => {
    // the `request` fixture is test-scoped → a worker fixture opens its own context
    const request = await playwright.request.newContext({ baseURL: env.apiURL });
    const users = new UserClient(request);
    const user = buildUser({ name: `Worker ${workerInfo.parallelIndex}` });   // email is already unique (builder)

    try {
      await users.create(user);
      await use(user);                                // the tests of THIS worker share it, one after another
      await users.delete(user.email, user.password);  // teardown: an external effect → cleanup
    } finally {
      await request.dispose();                        // runs even if delete throws → no leaked context
    }
  }, { scope: 'worker' }],
});
```

**Combine them:**
```ts
// src/fixtures/index.ts
import { mergeTests } from '@playwright/test';
import { test as uiTest } from './ui.fixtures';
import { test as apiTest } from './api.fixtures';

export const test = mergeTests(uiTest, apiTest);  // browser specs: UI, e2e, setup/teardown
export { apiTest };                               // API specs: API fixtures only → no browser, no login
export { expect } from '@playwright/test';        // or the extended expect from matchers.ts

// Full framework (§15): `test` comes from auth.fixtures.ts (it extends mergeTests(uiTest, apiTest)
// with role + per-worker auth):  export { test } from './auth.fixtures';   apiTest stays as it is.
```

**Pitfalls:**
- A worker fixture can't depend on a test fixture (`request`, `page`). That's why it builds its own context.
- **A worker account is parallel-safe, but not isolated.** Workers never share it, but the tests *inside* one worker run one after another on the same account, so test 2 sees the cart test 1 left. Rule: a test never assumes account state it didn't create. Assert "contains the item", not "cart count = 1", or ask for `freshAccount` when the test really needs a clean one.
- Teardown after `use()` runs even when the test fails. That's the point, and the reason cleanup belongs there and not at the end of the test.
- Fixtures are **lazy**: a fixture no test asks for never runs. That makes "expensive but rarely needed" setup cheap.
- **Why `apiTest` from day one:** when `test` later gets the auth layer (§15), its overridden `storageState` would make every API test log in through a browser. API specs that import `apiTest` never see it, so that switch doesn't touch them.

**Interview answer, "Fixtures vs hooks?":** *"A hook runs for every test in its scope, whether the test needs it or not, and shares state through `let` variables. A fixture is requested by name, so it's lazy, typed and reusable across files, and its teardown sits right after `use()`, so cleanup can't be forgotten. Hooks are fine for one-file, trivial setup like a `goto`."*

---

## 7. Auth: two stages

| Stage | Pattern | When it's right |
| --- | --- | --- |
| **Starter kit** | Setup project creates **one** account, saves `storageState`; teardown project deletes it | While logged-in tests **don't change server state** (browse, view account), or with `workers: 1` |
| **Full framework** | **Per-worker auth** (§15): each worker creates and logs in its own account; the role fixture decides the session | As soon as any logged-in test changes server state (cart, address, orders) |

**Why the switch matters:** with one shared account and `fullyParallel`, two workers adding to the same cart at the same time make cart counts flaky. That's the "shared mutable account" §17 forbids. Write the decision as an ADR: it's a strong interview story ("the simple pattern was right until tests started changing state").

### Starter kit: setup + teardown projects

**Config:**
```ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/, teardown: 'teardown' },
  { name: 'teardown', testMatch: /.*\.teardown\.ts/ },
  { name: 'api', testDir: 'tests/api', use: { baseURL: env.apiURL } },          // no browser state needed
  {
    name: 'chromium',
    testIgnore: /api\//,
    dependencies: ['setup'],
    use: { ...devices['Desktop Chrome'], storageState: USER_STATE },     // from src/config/paths.ts
    // Full framework: remove storageState here, the setup/teardown projects, and the login specs'
    // test.use({ storageState }) opt-outs (they rely on role 'guest'). The role fixture in §15 decides it.
    // Never set it in two places.
  },
],
```

**Setup** (`tests/setup/auth.setup.ts`): it uses the fixtures like any spec, so no `new UserClient(request)` by hand:
```ts
import fs from 'node:fs';
import { test as setup, expect } from '../../src/fixtures';
import { AUTH_DIR, USER_STATE, ACCOUNT_FILE } from '../../src/config/paths';
import { buildUser } from '../../src/data/builders/userBuilder';

setup('create and log in the test account', async ({ page, userClient, loginPage }) => {
  const user = buildUser();
  const created = await (await userClient.create(user)).json();
  expect(created.responseCode).toBe(201);                       // a failed setup should say why

  await loginPage.goto();
  await loginPage.login(user.email, user.password);
  await expect(loginPage.header.loggedInAs).toBeVisible();      // logged in before we save anything

  fs.mkdirSync(AUTH_DIR, { recursive: true });                  // don't rely on another call creating it
  await page.context().storageState({ path: USER_STATE });
  fs.writeFileSync(ACCOUNT_FILE, JSON.stringify({ email: user.email, password: user.password }));   // write state, not config
});
```

**Teardown** (`tests/setup/auth.teardown.ts`):
```ts
import fs from 'node:fs';
import { test as teardown } from '../../src/fixtures';
import { ACCOUNT_FILE } from '../../src/config/paths';

teardown('delete the test account', async ({ userClient }) => {
  if (!fs.existsSync(ACCOUNT_FILE)) return;                     // setup failed before creating it: nothing to clean
  const { email, password } = JSON.parse(fs.readFileSync(ACCOUNT_FILE, 'utf8'));
  const body = await (await userClient.delete(email, password)).json();
  console.log(`teardown: deleteAccount → responseCode ${body.responseCode}`);   // log, don't assert
});
```

**Pitfalls:**
- **Paths come only from `src/config/paths.ts`** (resolved from the project root). Your old bug, setup writing to one folder while the config read another, can't happen when both use the same constant.
- The teardown project runs **after all dependents**, even when they fail. Don't assert anything there that could hide the real failure. Log and clean up.
- With sharding, setup and teardown run **once per shard**, so each shard gets its own account. That's fine.

---

## 8. Builders

```ts
// src/data/builders/userBuilder.ts
import { randomUUID } from 'node:crypto';

export type User = { name: string; email: string; password: string; /* …the createAccount fields */ };

export function buildUser(overrides: Partial<User> = {}): User {
  const id = randomUUID().slice(0, 8);
  return {
    name: `Test User ${id}`,
    email: `user-${id}@test.local`,
    password: `Pw-${id}!`,
    // …defaults for every required createAccount field (verify the list)
    ...overrides,                  // the test only states what it cares about
  };
}
```

- **Why a function, not a class with `withX()`:** spread + `Partial<User>` gives the same flexibility with one line per field.
- **Why `randomUUID`, not `Date.now()` alone:** two workers can hit the same millisecond.
- **Pitfall:** importing `test.info()` inside a builder. It couples a data helper to the test runner; pass values in instead.

---

## 9. A test that shows everything

```ts
import { test, expect } from '../../src/fixtures';
import products from '../../src/data/json/products.json';

test.describe('Product search', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();                     // the page object owns its URL, not the test
  });

  for (const term of products) {
    test(`search shows results for "${term}"`, { tag: '@regression' }, async ({ productsPage }) => {
      await test.step('search', () => productsPage.search(term));   // a form submit → page navigation (verify)

      // The heading IS the signal that results arrived, so no waitForResponse is needed here
      await expect(productsPage.resultsTitle).toHaveText('Searched Products');   // verify text
      // first result: order is the behaviour here; scoped to the product NAME, not the whole card
      await expect(productsPage.resultNames.first()).toContainText(term, { ignoreCase: true });
    });
  }
});
```

- **`waitForResponse`: when it IS the right tool.** Only when the UI gives **no visible signal** before your next step (a background XHR), or when you need the **response data** (e.g. an ID the server created). Start waiting **before** the action. For a page navigation, the web-first assertion on the new page is enough; adding `waitForResponse` there is over-syncing.
- **Why `toContainText(term, { ignoreCase: true })` and not `new RegExp(term, 'i')`:** a term with regex characters (`+`, `(`, `.`) breaks the RegExp.
- **Check the oracle:** if search also matches categories (e.g. "top" → "Tops"), "the first result's name contains the term" can fail for a correct result. Pick terms that appear in product names, or assert on what the search actually promises.
- **`tsconfig.json`:** importing JSON needs `"resolveJsonModule": true` (and `"esModuleInterop": true` for `import dotenv from 'dotenv'`), or `tsc --noEmit` fails even though the tests run. And `include` must cover every folder with `.ts` files (`["src", "tests", "playwright.config.ts"]`), or `tsc` and ESLint's `projectService` report files outside the project (you hit this in the prep repo).

**Auto-waiting, the model answer:** *"Every action first checks that the locator resolves to exactly one element (strictness), and that the element is visible, stable, enabled and receives events, retrying until the timeout. Web-first assertions retry the same way. A fixed `waitForTimeout` is wrong in both directions: too short on a slow CI machine, wasted time on a fast one, and it hides the real event you should be waiting for."*

---

## 10 + 12. Config and lint: reference shapes

```ts
// playwright.config.ts (the parts that matter)
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,     // NOT the template's 1: CI must exercise parallel safety + per-worker auth
  failOnFlakyTests: !!process.env.CI && process.env.GITHUB_REF === 'refs/heads/main',
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html']],
  // Sharded nightly runs switch to blob on the command line (--reporter=blob, §11);
  // a CLI --reporter replaces these, so the PR job still gets its HTML report.
  expect: { timeout: 5_000 },
  use: {
    baseURL: env.baseURL,
    testIdAttribute: env.testIdAttribute,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [ /* §7 */ ],
});
```

```js
// eslint.config.mjs
// Check the current typescript-eslint docs: newer versions may recommend ESLint's own
// defineConfig (from 'eslint/config') instead of tseslint.config. Same content either way.
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', 'blob-report'] },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.base],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: { '@typescript-eslint/no-floating-promises': 'error' },
  },
  { ...playwright.configs['flat/recommended'], files: ['tests/**'] },   // no-wait-for-timeout, no-focused-test, missing await on expect, …
);
```

**npm scripts:**
```json
"test": "playwright test",
"test:smoke": "playwright test --grep @smoke",
"test:api": "playwright test --project=api",
"test:e2e": "playwright test --project=chromium",
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"report": "playwright show-report",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- `test:e2e`, not `test:ui`: `--ui` is Playwright's UI mode, so `test:ui` reads like "open UI mode".
- `format` / `format:check` arrive with Prettier (full framework, step 1).
- `--project=chromium` also runs `setup` automatically, because it's a dependency.

---

## 11. CI: reference shapes

**PR (`.github/workflows/ci.yml`):**
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]      # I push straight to main: a PR-only workflow would never run
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npx playwright install --with-deps chromium
      - run: npm run test:smoke -- --project=api --project=chromium   # API smoke too: the strongest layer runs on every PR
        env: { SITE: automationexercise }
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with: { name: playwright-report, path: playwright-report/, retention-days: 7 }   # exists: CI config includes html
```

**Nightly, sharded + merged (`.github/workflows/nightly.yml`):**
```yaml
on:
  schedule: [{ cron: '0 2 * * *' }]
  workflow_dispatch:
jobs:
  test:
    strategy: { fail-fast: false, matrix: { shard: [1, 2, 3] } }
    runs-on: ubuntu-latest
    steps:
      # checkout, setup-node, npm ci, npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}/3 --reporter=blob   # blob only here, merged below
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with: { name: blob-report-${{ matrix.shard }}, path: blob-report, retention-days: 1 }
  merge:
    needs: test
    if: ${{ !cancelled() }}
    runs-on: ubuntu-latest
    steps:
      # checkout, setup-node, npm ci
      - uses: actions/download-artifact@v4
        with: { path: all-blob-reports, pattern: blob-report-*, merge-multiple: true }
      - run: npx playwright merge-reports --reporter html ./all-blob-reports
      - uses: actions/upload-artifact@v4
        with: { name: html-report, path: playwright-report, retention-days: 14 }
```

**Interview answer, "How would you set up CI?":** *"Fast feedback on PRs: lint, typecheck, API smoke and UI smoke on one browser in a few minutes. The full matrix runs nightly, sharded across machines with blob reports merged into one HTML report. Retries are on in CI but flaky tests fail the main build, so they get fixed instead of hidden. Secrets come from a GitHub Environment; artifacts have short retention."*

---

## 14. Mocking: reference shapes

### ⚠️ Step 0: is there anything to mock on this site?

`page.route` only changes requests **the browser makes**. As far as I know, automationexercise pages are **rendered on the server**: the products page arrives as finished HTML and does **not** call `/api/productsList` (those endpoints exist for API practice). If that's true, mocking `/api/productsList` changes nothing, there is no spinner or error UI to check, and the test passes or fails for unrelated reasons: a test that proves nothing.

**Check first:** DevTools → Network → filter **Fetch/XHR** → click around (products, add to cart, search).

| What you find | What to do |
| --- | --- |
| Real XHR calls whose result the UI shows (add to cart might be one) | Mock those. Assert the UI's reaction |
| No XHR calls that drive the UI | Do the mocking specs on a **single-page app that loads its data through an API** (a separate small spec folder or project), and write in the README *why*: the main site is server-rendered |
| Third-party calls (ads) | Already handled: `blockAds` is the one route that's always real here |

### The patterns (on a page that really fetches `/api/products`)

```ts
test.use({ serviceWorkers: 'block' });

test('shows an error state when the products call fails', async ({ page }) => {
  await page.route('**/api/products', (route) => route.fulfill({ status: 500 }));   // registered BEFORE the navigation
  await page.goto('/');
  await expect(page.getByText(/something went wrong/i)).toBeVisible();               // the app's real error UI
});

test('shows a loading state on a slow response', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    await new Promise((r) => setTimeout(r, 3000));      // the SERVER is slow (mock), not a wait in the test
    await route.continue();
  });
  await page.goto('/');
  await expect(page.getByRole('progressbar')).toBeVisible();
  await expect(page.getByRole('progressbar')).toBeHidden();
});
```

**Make it fail once:** remove the `page.route` line. If the test still passes, the mock wasn't doing anything.

**Pitfall:** mocking the thing you're testing. If the test only proves that the mock returns what you told it to, it's a tautology. A mock is the **input**; the **UI's reaction** is what's under test.

**Interview answer, "When do you mock?":** *"For states the real backend can't produce on demand, like a 500, an empty list or a slow response, and for third-party noise like ads. The real contract is covered by API tests and a few hybrid tests, so mocks don't drift silently: if the contract changes, the API tests fail first."*

---

## 15. Roles + per-worker auth: reference shapes (full framework)

This replaces the starter kit's setup project (§7). Four rules:
- **`storageState` is decided in ONE place:** the fixture below. Remove it from the project `use`, drop the setup/teardown projects, and delete the login specs' `test.use({ storageState })` opt-outs (they rely on the default `role: 'guest'`).
- **Each worker logs in its own account once** (`workerAccount` from §6), so parallel workers never share server state.
- **Every context we open ourselves** starts clean and explicit: `{ baseURL: env.baseURL, storageState: undefined }` + `blockAds()` (§6 pitfall). Without `storageState: undefined` it may copy the existing session, and the multi-session test below can't fail.
- **API specs import `apiTest`**, not this `test`, so they never trigger the browser login.

```ts
// src/fixtures/auth.fixtures.ts — needs UI + API fixtures, so it extends the merged test
import { mergeTests, type Browser, type Page } from '@playwright/test';
import { test as uiTest, blockAds } from './ui.fixtures';
import { test as apiTest } from './api.fixtures';
import { workerStateFile } from '../config/paths';

type Role = 'guest' | 'user';

// One place for "log this user in, in a brand-new context" (used twice below)
async function loginInNewContext(browser: Browser, user: { email: string; password: string }) {
  // clean + explicit: no inherited storageState (else it may copy an existing session), our own baseURL
  const context = await browser.newContext({ baseURL: env.baseURL, storageState: undefined });
  await blockAds(context);
  const page = await context.newPage();
  const login = new LoginPage(page);
  await login.goto();
  await login.login(user.email, user.password);
  await login.header.loggedInAs.waitFor();                                // sync guard: logged in before we continue
  return { context, page };
}

export const test = mergeTests(uiTest, apiTest).extend<
  { role: Role; secondSession: Page },
  { workerStorageState: string }
>({
  role: ['guest', { option: true }],

  // once per worker: log the worker's own account in and save the session
  workerStorageState: [async ({ browser, workerAccount }, use, workerInfo) => {
    const file = workerStateFile(workerInfo.parallelIndex);
    const { context } = await loginInNewContext(browser, workerAccount);
    await context.storageState({ path: file });
    await context.close();
    await use(file);
  }, { scope: 'worker' }],                       // the account itself is deleted by workerAccount's teardown

  // THE one place the session is decided: this is the Strategy
  storageState: async ({ role, workerStorageState }, use) => {
    await use(role === 'user' ? workerStorageState : { cookies: [], origins: [] });
  },

  // the same user, logged in AGAIN in a separate context = a second, independent session
  secondSession: async ({ browser, workerAccount }, use) => {
    const { context, page } = await loginInNewContext(browser, workerAccount);
    await use(page);
    await context.close();                       // teardown: we opened it, we close it
  },
});

// in a spec:
test.use({ role: 'user' });
```

**The multi-session scenario, chosen so it can fail:** add an item to the cart in the main session → open the cart in `secondSession` → the item is there. That's only true if the cart is stored **on the server per user**. If the cart is per session (a cookie), the test fails, and that's a finding for "Issues found", not a broken test. **Verify** which one the site does, and make the test fail once.

Why not "user A's cart isn't visible to user B": two separate contexts **always** have separate sessions, so that test passes even if the server mixes nothing up. It can't fail, so it proves nothing.

**Trade-offs and pitfalls:**
- `storageState` depends on `workerStorageState`, so even a guest test triggers the worker login once per worker (fixtures can't be requested conditionally). Acceptable: one login per worker. **API specs** would pay it too, which is why they import `apiTest`. Verify: `npm run test:api` starts no browser.
- **Check the clean start once:** in a throwaway test, `expect(await context.cookies()).toEqual([])` right after `browser.newContext(...)` in `loginInNewContext`. Then remove `storageState: undefined` and run it again: if cookies show up, you've seen why it's there.
- Logging in again might end the first session on some sites. **Verify**; if it does, that's a finding too.
- Worker accounts are parallel-safe, **not isolated** (§6): assert "the item is in the cart", not "the cart has 1 item".
- `waitFor()` in the helper is a sync guard, not an outcome assertion. The tests still own every check.

**Interview answer, "How do you handle several users?":** *"Each worker creates its own account through the API and logs in once, so parallel tests never share server state. A role option fixture is the single place the session is decided, so `test.use({ role: 'user' })` switches strategy without touching the test body. That's the Strategy pattern through dependency injection. When a test needs a second session, a fixture opens a separate context and closes it afterwards. I started with one shared setup account and switched when tests began changing state, because shared mutable accounts make parallel runs flaky."*

---

## 17. Flaky tests: the walkthrough

**Interview answer, "A test is flaky in CI only. Walk me through it":**
1. **Evidence:** download the CI trace/report. What did the page show at the failing step? (Your mock-test case: the screenshot showed the real API had answered.)
2. **Reproduce:** `--repeat-each=20`, then with `--workers=1`. If it passes with 1 worker, suspect shared state or parallel interference. (In CI this only shows up if CI runs more than one worker: `workers: 2`, §10.)
3. **Classify:** timing (assertion before the data arrived), shared data (two tests on one account), environment (CI is slower, a different network, bot protection) or third-party noise (ads).
4. **Fix the cause:** web-first assertion or `waitForResponse`; builders or per-worker accounts; ad blocking.
5. **If it can't be fixed now:** `test.fixme()` + reason + ticket. Never delete the assertion; never just raise the retries.

**"Retries: help or harm?"** *"Both. They keep CI green against real infrastructure noise, and Playwright marks a retried pass as flaky, so they're also a detector. The harm is when nobody looks at that signal. That's why I'd fail the main build on flaky tests."*

---

## 18. AI workflow: templates

**`CLAUDE.md` (framework rules for AI), the core:**
```
- Layers: tests → fixtures → pages/components/clients/builders → config. Never import upwards.
- Locators: getByRole → getByLabel/getByText → getByTestId → CSS. No XPath. nth() only with a comment.
- No assertions in page objects or API clients. Clients return responses.
- New page object: copy src/ui/pages/LoginPage.ts as the example.
- Every new test must be shown failing once (break the expectation, run, restore).
- Tags: @smoke (critical path, < 2 min total), @regression (everything else).
```

**A reusable prompt (`docs/prompts/add-api-test.md`):**
```
Add an API test for <endpoint> following CLAUDE.md.
Use the client in src/api/clients/ (add a method if missing, no assertions in it).
Write: 1 positive case with a zod schema check, the negative cases from the API docs.
Show me the test failing once before you call it done.
```

**`docs/ai-review.md` format (one row per catch):**

| What the AI produced | What was wrong | How I caught it | Fix |
| --- | --- | --- | --- |
| e.g. `expect(response.status()).toBe(200)` for a negative case | This site returns 200 on errors, so it always passes | Made it fail on purpose: it couldn't | Assert `responseCode` |
| e.g. `expect(response.ok()).toBeTruthy()` in a positive case | Same quirk: can never be false here | Read it against the site's quirks | Rely on `responseCode: z.literal(200)` in the schema |
| e.g. a mock on `/api/productsList` for an error-state test | The page never calls that endpoint | Removed the mock: the test still passed | Check Network → Fetch/XHR first; mock a call the page really makes |

**Interview answer, "How do you use AI, and how do you catch tests that prove nothing?":** *"AI drafts page objects and tests against written rules and an example file. I review every change like a PR, and every test has to fail once on purpose before I trust it. A test that can't go red proves nothing. I keep a log of what the AI got wrong; the most common issues are assertions that can't fail and locators tied to layout."*

---

## 19. ADR template + example

```md
# 0001 - Fixtures over a BasePage

## Context
Page objects need `page`, and several tests need the same pages and API clients.
In earlier frameworks a BasePage provided navigation/waits and every page inherited it.

## Decision
No BasePage. Page objects and API clients are created by Playwright fixtures and
requested by name. Shared UI (header) is a component that pages hold (composition).

## Consequences
+ Tests ask only for what they use (fixtures are lazy); construction and cleanup live in one place.
+ No inheritance chain to understand or break.
- New contributors must learn fixtures (documented in README "How to add a test").
- If ≥3 pages ever share real behaviour, revisit (Rule of Three).
```

**`CONTRIBUTING.md` outline:** naming (`*.spec.ts`, `XxxPage`, `XxxClient`, `buildXxx`), tags and when to use them, where assertions go, how to add a page/test (3 steps), the flaky policy (§17), the PR checklist (lint, typecheck, failed-once proof).

---

## 20. Model answers (the rest)

Short versions to say out loud. The longer ones are in the sections above (§2, §4, §5, §6, §9, §11, §14, §15, §17, §18).

| Question | Model answer |
| --- | --- |
| Test vs worker scope? | *"Test scope is created per test: page objects, per-test data. Worker scope is created once per worker process and shared by its tests: expensive things like an account or an auth token. Worker fixtures can't use test fixtures like `page`."* |
| When is teardown needed? | *"Only for external effects the test created: data in a backend, a context I opened myself. Playwright cleans its own pages and contexts."* |
| Where do assertions go? | *"In the test. Page objects and clients describe how to do things; the test states what must be true. Then one page object serves positive and negative tests, and the expected outcome is visible where you read the test."* |
| Locator strategy, and when you'd break it | *"Role and accessible name first, then label or text, then a test id, CSS last. I'd break it for order-based behaviour like 'first result' or 'sorted by price', with a comment, or for a third-party widget with no accessible markup."* |
| How do you keep tests parallel-safe? | *"Every test has its own context and its own data: builders with unique values, accounts per worker, nothing mutable shared across workers. Inside a worker, tests never assume state they didn't create. `fullyParallel` on; if a test only passes alone, that's a bug to fix, not a setting."* |
| One shared login account: when is it fine? | *"While logged-in tests only read. Once a test changes server state, like the cart, a shared account makes parallel runs flaky, so I switch to per-worker accounts. It's a trade-off: one account is simpler and faster to set up; per-worker auth costs one login per worker but removes the interference."* |
| Why do API specs import a different `test`? | *"So they only get the API fixtures. The browser `test` carries the auth layer, and its session fixture would log every API test in through a browser. Two entry points keep API tests fast and browser-free."* |
| Playwright vs Selenium: what changes in the framework? | *"Auto-waiting removes the wait helpers, fixtures replace BasePage and driver factories, `storageState` replaces logging in per test, the `request` fixture replaces a separate REST client, and workers and sharding replace Grid. The framework gets thinner: fewer layers, each with a clear reason."* |
| Playwright vs Cucumber: what changes? | *"With playwright-bdd, Gherkin steps sit on top of the same fixtures, so fixtures replace Cucumber's World/ScenarioContext. I'd only add BDD if non-technical people actually read or write the scenarios; otherwise it's an extra layer."* |

---

Docs: https://playwright.dev/docs/test-fixtures · https://playwright.dev/docs/auth · https://playwright.dev/docs/test-projects#teardown · https://playwright.dev/docs/test-sharding · https://playwright.dev/docs/mock · https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend · https://zod.dev