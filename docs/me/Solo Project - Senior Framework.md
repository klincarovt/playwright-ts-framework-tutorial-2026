# Solo Project - Senior Framework

**Goal:** build a Playwright + TypeScript framework the way a senior on a company project would: clear layers, typed config, UI + API, reporting, CI. Built **from memory**, with this file as the checklist. Bring it back for a PR-style review.

**Site:** [automationexercise.com](https://automationexercise.com). It has a UI **and** a documented public API ([API list](https://automationexercise.com/api_list)), so you get a real API layer. Fallback: [saucedemo.com](https://www.saucedemo.com) (UI only).

---

## 1. Folder structure

```
├── config/
│   └── environments.ts        # typed envs, ENV picks one, secrets validated
├── pages/                     # page objects (one per page)
├── components/                # shared UI parts (header, cart badge, modal)
├── api/                       # one client per resource (ProductsClient, UserClient)
├── fixtures/
│   ├── ui.fixtures.ts         # page objects
│   ├── api.fixtures.ts        # API clients
│   └── index.ts               # mergeTests(ui, api) → export test, expect
├── data/
│   ├── factories/             # userFactory(): unique data per test
│   └── products.json          # static test data
├── tests/
│   ├── setup/                 # auth.setup.ts (one per role)
│   ├── ui/
│   ├── api/
│   └── e2e/                   # hybrid: API setup → UI verify
├── utils/                     # small helpers only (no Playwright wrappers)
├── .github/workflows/
├── playwright.config.ts
├── eslint.config.mjs
└── tsconfig.json
```

**Rule:** tests → fixtures → pages/components/API clients → config. Lower layers never import upper ones.

## 2. Environments (senior pattern)

| Piece | Rule |
| --- | --- |
| `config/environments.ts` | All env URLs in one **committed, typed** object (`as const`) |
| `ENV=staging` | Picks the entry; default when unset |
| Secrets | Only from `process.env`: `.env` locally (gitignored), CI secrets / secrets manager in the pipeline |
| Fail fast | `required('USER_EMAIL')` throws a clear error; an unknown `ENV` throws a list of valid ones |
| dotenv | Loaded **inside** `environments.ts` (imports run first), `quiet: true` |
| `playwright.config.ts` | Reads `env.baseURL`; API project uses `env.apiURL` |

Interview line: *"Non-secret config is versioned and typed; secrets come from the environment and are validated at startup."*

## 3. Locator strategy

1. `getByRole(role, { name })`: what the user sees, plus accessibility
2. `getByLabel` / `getByPlaceholder` / `getByText`
3. `getByTestId` (set `testIdAttribute` in the config)
4. CSS last. **Never** XPath, `nth()` or positional selectors.

- Narrow down with `filter({ hasText })` and chaining (`row.getByRole('button')`).
- Locators are `readonly` fields in page objects.

## 4. Page objects & components

- **No outcome assertions** in pages. Allowed: sync guards (wait until the page is ready).
- **Composition over BasePage:** a page *has* a `HeaderComponent`.
- **No anemic wrappers:** don't wrap `click()` or `fill()`. Methods are **user intents** (`login(user)`, `addToCart(name)`).
- `goto()` is a method, not in the constructor.

## 5. API layer

- One client per resource. It takes `APIRequestContext` and returns responses or parsed data. **No assertions inside.**
- baseURL and auth headers live on the request context (project `use` or `request.newContext`), not in every call.
- Clients are injected via fixtures.
- Check response **shape** (schema check) in API tests, plus negative cases (400/401/404).

## 6. Fixtures

| Kind | Use |
| --- | --- |
| Test-scoped (default) | Page objects, per-test data |
| **Worker-scoped** (`{ scope: 'worker' }`) | Expensive setup shared by one worker: an API token, a per-worker account |
| **Option fixtures** (`{ option: true }`) | Values a project or test can override (`test.use({ role: 'admin' })`) |
| Teardown (code after `use()`) | Only for external effects: delete created data |
| `mergeTests` | Combine `ui` + `api` fixture files into one `test` |

## 7. Auth

- A setup project logs in once per role and saves `playwright/.auth/<role>.json` (gitignored).
- Browser projects use `dependencies` + `storageState`.
- Login tests opt out with `test.use({ storageState: { cookies: [], origins: [] } })`.
- Multi-role: one fixture per role opens its own context (`adminPage`, `userPage`).

## 8. Test data

- **Factories** create unique data (`user-${Date.now()}@test.com`), which keeps parallel runs safe.
- Create data **via API** in setup and **delete it** in teardown.
- Static data goes in JSON. Never share mutable accounts between tests.

## 9. Writing tests

- `test.describe` + `beforeEach` for shared steps, and fixtures for reusable setup.
- Tags: `{ tag: ['@smoke'] }`, run with `--grep @smoke`.
- Data-driven: loop over JSON and create one `test()` per row, each with a unique title.
- Sync on the network with `waitForResponse` (start waiting **before** the click).
- **Web-first assertions only** (`await expect(locator)…`). No `waitForTimeout`.
- Every test must be able to fail. Prove it once.

## 10. Reporting & debugging

| Setting | Value |
| --- | --- |
| `reporter` | `list` + `html`; on CI also `html { open: 'never' }` + `junit` → `test-results/junit.xml` |
| `screenshot` | `'only-on-failure'` |
| `trace` | `'on-first-retry'` |
| `retries` | CI 2, local 0 (retries **flag** flaky tests, they don't fix them) |

## 11. CI (GitHub Actions)

- **PR:** lint + type-check + `@smoke`.
- **main / nightly:** full suite.
- **Sharding:** a matrix with `--shard=${{ matrix.shard }}/3` and blob reporters, then a `merge-reports` job.
- **Artifacts:** HTML report and traces with `retention-days` set. Traces contain tokens, so keep the repo private or retention short.
- **Secrets:** a GitHub Environment per env; the job sets `ENV`.
- Install only the browsers you use: `npx playwright install --with-deps chromium`.

## 12. Quality gates

- ESLint with `@typescript-eslint/no-floating-promises` (catches a missing `await`).
- `tsc --noEmit` in CI.
- npm scripts: `test`, `test:smoke`, `test:api`, `test:ui`, `lint`, `typecheck`, `report`.

## 13. README (for the interviewer)

- What the framework covers, plus a CI badge.
- An **architecture diagram** (the layers from section 1).
- **Design decisions**, each with its trade-off: composition vs BasePage, the env pattern, API setup + UI verify, the tagging strategy.
- How to run, with all the npm scripts.

---

## Build order

| # | Step | Done |
| --- | --- | --- |
| 1 | `npm init playwright@latest`, ESLint, tsconfig, `.gitignore` | ⬜ |
| 2 | `config/environments.ts` + config wired | ⬜ |
| 3 | 2 page objects + 1 component | ⬜ |
| 4 | UI fixtures + first UI spec | ⬜ |
| 5 | Auth setup project | ⬜ |
| 6 | API clients + API fixtures + `mergeTests` | ⬜ |
| 7 | API specs (positive, negative, schema) | ⬜ |
| 8 | Data factory + JSON + data-driven spec | ⬜ |
| 9 | Hybrid e2e test (API setup → UI verify) | ⬜ |
| 10 | Tags, describe/hooks, `waitForResponse` | ⬜ |
| 11 | Reporters, npm scripts | ⬜ |
| 12 | CI: PR smoke + full run, then sharding | ⬜ |
| 13 | README with architecture + decisions | ⬜ |

## Definition of done

- [ ] `npm run lint` and `npm run typecheck` are clean
- [ ] Every spec passes locally and in CI, and each one has been made to fail once on purpose
- [ ] No secrets in the repo; `.env*` and `playwright/.auth/` are gitignored
- [ ] No `waitForTimeout`, no XPath/`nth`, no assertions in page objects or API clients
- [ ] README explains the layers and the decisions
- [ ] I can explain every folder in 2 minutes without notes

## Optional extras (after the core)

Multi-role auth · worker-scoped accounts · BDD (playwright-bdd) · mobile emulation (`devices['iPhone 13']`) · visual tests (`toHaveScreenshot`) · HAR replay · agentic AI (Playwright MCP + Test Agents: planner, generator, healer)

Docs: https://playwright.dev/docs/intro · Best practices: https://playwright.dev/docs/best-practices
