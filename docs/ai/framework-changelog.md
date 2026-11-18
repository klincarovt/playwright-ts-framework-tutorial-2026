# Framework changelog

Every change to the framework: config, tests, structure, tooling. Newest first. Each entry says what changed, why, and the interview angle.

---

## 2026-11-18 · apiTest project, CI runs API tests

- `playwright.config.ts`: new project `apiTest` (no `storageState`, no `dependencies`). Todo: `testMatch: /api\/.*\.spec\.ts/` on it, `testIgnore: /api\//` on chromium/webkit (local full runs).
- `tests/api/products.spec.ts`: `test.use` empty storageState; `console.log` removed.
- Workflow: `npx playwright test tests/api --project=apiTest --no-deps`. UI suite runs locally only: the public site blocks GitHub runners (likely Cloudflare, not confirmed).
- `.gitignore`: `playwright/.auth/` line removed by JoJo's choice (user.json committed for now; plan: empty it + re-ignore).
- Interview angle: "Separate API project without browser state; CI runs it because the demo site blocks cloud runners. Real project: bot-free test env or a self-hosted runner."

---

## 2026-11-18 · Auth path fix + .gitignore

- `tests/setup/auth.setup.ts`: `path.join(__dirname, '../../playwright/.auth/user.json')`. After the move to `tests/setup/`, `../` wrote to `tests/playwright/.auth/` while the config read the root → stale login.
- `.gitignore`: `playwright/.auth/` (no leading `/` → any folder) + `ci-report/` (downloaded CI report with traces).
- Workflow: Environment renamed `.env` → `env` (`environment: env`).
- CI still red: setup can't find the email field on GitHub runners → probably Cloudflare's bot check (to confirm in the trace).
- Interview angle: "After a refactor, setup passed but tests weren't logged in: the setup wrote the auth file relative to `__dirname`, the config read from the root."

---

## 2026-11-18 · Day 4: API, hybrid, mock, CI secrets

- `tests/api/products.spec.ts`: GET product search (status + results) and POST login (token) with the `request` fixture.
- `tests/hybrid/hybrid.spec.ts`: API login → token into localStorage via `page.addInitScript` → UI opens `/account`. Todo: `test.use({ storageState: { cookies: [], origins: [] } })` so the config login can't make it pass.
- `tests/mock/mock.spec.ts`: `page.route('**/products/search*')` → `{ data: [] }` → no product names shown.
- `tests/setup/auth.setup.ts` (moved into `tests/setup/`).
- `playwright.config.ts`: firefox project commented out (faster runs).
- `.github/workflows/playwright.yml`: branches `main` only; `environment: .env` (GitHub Environment holding `USER_EMAIL`, `USER_PASSWORD`); `env:` on the test step. Todo: remove the unused `BASE_URL` line.
- Interview angle: "API tests for logic, hybrid for fast setup, mocks only for UI edge cases, all running in GitHub Actions with secrets."

---

## 2026-11-18 · Day 3 Step 4: storageState

- `tests/auth.setup.ts`: logs in via the `loginPage` fixture, asserts `/account`, saves `page.context().storageState()` to `playwright/.auth/user.json` (gitignored).
- `playwright.config.ts`: project `setupUser` (`testMatch: /.*\.setup\.ts/`); chromium/firefox/webkit get `storageState` + `dependencies: ['setupUser']`. `BaseURL` → `BASEURL` (case fix).
- `tests/account.spec.ts`: opens `/account` directly; asserts `page-title` contains "My account" (`toHaveURL` alone passed without login → SPA redirect false positive). Proven both ways.
- Test titles renamed to behaviour-style names.
- Interview angle: "Log in once in a setup project; tests start from the saved state and stay isolated. I proved the test fails without the state."

---

## 2026-11-18 · Day 3 Step 3: custom fixtures

- `fixtures/fixtures.ts`: `base.extend<{ loginPage: LoginPage; searchPage: SearchPage }>` builds both page objects from the built-in `page` and hands them over with `use()`; re-exports `test` and `expect`.
- `tests/login-search-fixtures.spec.ts` (new): imports from `../fixtures/fixtures`, asks for `{ page, loginPage, searchPage }`, no `new ...Page()`. `expect(page).toHaveURL('/account')` after login (race fix kept). Run: passed.
- `tests/login-search.spec.ts` (old) kept for comparison → delete before the Day 4 push (duplicate coverage).
- Why fixtures over `beforeEach`: reusable across files, created only on demand, typed, setup + teardown in one function, and the base for `storageState`.
- Interview angle: "Fixtures are Playwright's dependency injection: the test declares what it needs; the fixture builds and cleans it up."

---

## 2026-11-16 · First push to GitHub

- Repo: `github.com/klincarovt/playwright-ts-framework-tutorial-2026`, branch `main`, remote `origin`.
- One combined first commit covering Days 1–3 (setup, login-search test, env config, page objects, ESLint, docs).
- Pushed from Windows git (Git Credential Manager). WSL git needs `gh auth login` or the Windows credential helper.
- GitHub Actions ran `.github/workflows/playwright.yml` on push. Expected to fail until `USER_EMAIL` / `USER_PASSWORD` / `BASEURL` are added as **GitHub Secrets** (Day 4).
- From now on: one commit per step.

---

## 2026-11-16 · Day 3: page objects + ESLint

- `pages/LoginPage.ts`: locator fields (email, password, login button), `goToPage()`, `performUserLogin(email, password)`.
- `pages/SearchPage.ts`: locator fields (nav home, search input, search term, results container, `productNames` chained from it), `goToHomePage()`, `searchProductByName(name)`.
- `tests/login-search.spec.ts` uses both page objects; assertions stay in the test; credentials via `process.env.X!`.
- ESLint (v10, flat config `eslint.config.mjs`) + `typescript-eslint` with only `@typescript-eslint/no-floating-promises: error`; `tsconfig.json` (strict, commonjs, esModuleInterop); script `npm run lint`.
  - Why: JoJo kept forgetting `await` on async calls (4×); the linter catches it automatically.
- `npm audit`: 7 moderate (one minimatch ReDoS inside typescript-eslint, dev-only). Accepted; did **not** run `audit fix --force` (it would downgrade to 8.36.0, a breaking change).
- Interview angle: "A lint rule enforces `await`; I triage audit warnings by dev/runtime, reachability and fix risk."

---

## 2026-11-16 · Day 3 Step 0: secrets out of code + git

- `git init` on branch `main`.
- `dotenv` added (dev dependency); `playwright.config.ts` loads `.env` via `dotenv.config({ path: path.resolve(__dirname, '.env') })`.
- `.env` (gitignored): `BASEURL`, `USER_EMAIL`, `USER_PASSWORD`. The test reads the credentials from `process.env`.
- Todo: commit a `.env.example` with fake values; a fail-fast guard for missing variables.
- Interview angle: "Secrets live in a gitignored `.env` locally and GitHub Secrets in CI; a committed secret gets rotated."

---

## 2026-11-15 · Day 2 Steps 2–4: locators, assertions, trace

- `playwright.config.ts`: `testIdAttribute: 'data-test'`, so `getByTestId` matches this site's attribute.
- `tests/login-search.spec.ts`: `goto('/auth/login')`; `getByLabel` (email), `getByTestId` (password, search), `getByRole('button', { name: 'Login' })`; result check by chaining `search_completed` → `product-name` (wait first, then count).
- Debugged a deliberate failure with `--trace on`. The config stays `trace: 'on-first-retry'` for CI.
- Interview angle: "Role/label first, test IDs when text is unstable; web-first assertions retry; traces for CI failures."

---

## 2026-11-15 · Day 2 Step 1: `baseURL` from an env variable

- `playwright.config.ts`: `baseURL: process.env.BASEURL ?? 'https://practicesoftwaretesting.com'` (JoJo chose `BASEURL`; the common convention is `BASE_URL`)
  - Why: one place for the environment URL; switch envs with `BASEURL=... npx playwright test`, no code change.
- `tests/login-search.spec.ts`: relative `goto`, `toHaveURL('/account')`, removed click-before-fill and redundant `toBeVisible` checks, switched to `customer2` (customer was locked).
- `node_modules` repaired with `npm ci` (`.bin/` was empty after an install during MCP setup).
- Open: credentials still hardcoded → `.env` + dotenv (add `.env` to `.gitignore` first).
- Interview angle: "Same suite on dev/staging/prod: only `BASE_URL` changes; tests use relative paths."

---

## 2026-11-15 · Docs reorganized + MCP servers

**Structure**
- `docs/Interview Plan.md`: the plan, moved from the root.
- `docs/ai/`: Claude-maintained (`progress.md`, this changelog).
- `docs/me/`: JoJo's revision notes (`Day N - Progress.md`, `Claude Code Learning.md`).
- `CLAUDE.md` at the root: project rules that Claude Code loads automatically every session.

**MCP servers added** (by JoJo):
```bash
claude mcp add playwright npx @playwright/mcp@latest
claude mcp add typescript npx ts-language-mcp /mnt/code/TypeScript/playwright-ts-framework-prep
```
| Server | What it gives Claude | Used for |
| --- | --- | --- |
| `playwright` | Drives a real browser: navigate, click, read accessibility snapshots | Exploring the app, finding locators, Day 5 agentic AI |
| `typescript` | TS language intelligence: diagnostics, types, definitions, references | Reviewing your code with real type info |

- **Scope:** added without `--scope`, so they're **local**: private to JoJo in this project, stored in `~/.claude.json`, not in the repo. `--scope project` would write a shared `.mcp.json` instead.
- `@playwright/mcp@latest` is unpinned and pulls the newest version on each start. Pin a version if it ever breaks.
- **Interview angle:** "I use Playwright MCP so an AI agent can explore the app in a real browser, but I review every generated locator and test like a PR."

---

## 2026-11-12 · Day 1: project setup

- `npm init playwright@latest`: TypeScript, `tests/`, GitHub Actions workflow, browsers chromium/firefox/webkit.
- WSL: OS libraries installed with `npx playwright install-deps`.
- `tests/login-search.spec.ts`: recorded with codegen, then rewritten as 1 test with 3 `test.step` blocks (`toHaveURL` after login, `toHaveText` on the search term).
- Known leftovers for Day 2: absolute URLs (→ `baseURL`), click before fill, redundant visibility checks.
