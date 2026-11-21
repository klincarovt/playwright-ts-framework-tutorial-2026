# Solo Project - Senior Framework

**Goal:** build a Playwright + TypeScript framework the way a senior on a company project would: clear layers, typed config, UI + API, reporting, CI. Built **from memory**, with this file as the checklist. Bring it back for a PR-style review.

**Site:** [automationexercise.com](https://automationexercise.com). It has a UI **and** a documented public API ([API list](https://automationexercise.com/api_list)), so you get a real API layer. Fallback: [saucedemo.com](https://www.saucedemo.com) (UI only).

**My angle:** 2 years of API testing → make the **API layer** the strongest part. It's the thing most UI-focused candidates do weakly.

---

## ✅ Framework checklist (review this first)

Tick what you want in. ⭐ = what a reviewer of a Playwright test task looks for first.

### Architecture
- [ ] ⭐ **POM**: one class per page, locators as `readonly` fields, methods = user intents
- [ ] ⭐ **Components** ("sub pages"): shared parts (header, product card, cart modal) as their own classes; pages *have* them (composition)
- [ ] **BasePage only if needed**: start without one. Add one only when ≥3 pages share real behaviour (Rule of Three). Decision written in the README either way
- [ ] ⭐ **API clients** (one per resource: `ProductsClient`, `UserClient`): no assertions, return responses. *(Keyword: "API client", not "ClientPage")*
- [ ] ⭐ **Fixtures** inject pages + clients; `mergeTests` combines UI + API fixtures
- [ ] Layer rule: tests → fixtures → pages/components/clients → config (never upwards)

### Config & environments
- [ ] ⭐ **Read config**: typed `src/config/environments.ts`, `ENV` picks dev/staging/prod, fail-fast validation
- [ ] ⭐ **Secrets** only from env vars (`.env` locally, GitHub secrets in CI), never in code
- [ ] **Write state, not config**: config files are read-only at runtime. What tests *produce* goes to generated, gitignored files: `playwright/.auth/<role>.json` (storageState), optionally `.state/created-data.json` for cleanup
- [ ] Explicit timeouts: `actionTimeout`, `navigationTimeout`, `expect.timeout`

### Test data
- [ ] ⭐ **Data providers**: JSON in `src/data/json/` + a `for...of` loop → one named test per row
- [ ] **Builders**: `buildUser({ ...overrides })` with unique defaults (`Date.now()`) → parallel-safe
- [ ] Data created via API in setup, deleted in teardown (fixture code after `use()`)

### Tests
- [ ] ⭐ UI specs, API specs (positive + negative + schema check), 1 hybrid e2e (API setup → UI verify)
- [ ] ⭐ Auth: setup project + `storageState`; login tests opt out
- [ ] `test.describe` + hooks, tags `@smoke` / `@regression`, `test.step` in long flows
- [ ] `waitForResponse` for network sync, web-first assertions only, no `waitForTimeout`
- [ ] Typed API responses + **zod** schema validation
- [ ] Selenium classics on the site's Contact Us form: file upload (`setInputFiles`) + confirm dialog (`page.on('dialog')`)

### Reporting
- [ ] ⭐ `list` + `html`, JUnit XML on CI, screenshot on failure, trace on first retry

### CI (GitHub Actions)
- [ ] ⭐ Workflow: lint + typecheck + tests on PR, report as artifact
- [ ] PR = `@smoke`, main/nightly = full suite; `ENV` per GitHub Environment
- [ ] Sharding matrix + `merge-reports`; `failOnFlakyTests` on main
- [ ] Install only the browser you use

### Quality gates
- [ ] ⭐ ESLint + **`eslint-plugin-playwright`** + `no-floating-promises`; `tsc --noEmit`
- [ ] npm scripts: `test`, `test:smoke`, `test:api`, `test:ui`, `lint`, `typecheck`, `report`
- [ ] *(optional)* Prettier, husky + lint-staged pre-commit

### Roles & coverage types
- [ ] Role **option fixture** (Strategy via DI), multi-role test (`adminPage` + `userPage`), per-worker accounts (§15)
- [ ] Mocking edge cases: 500, empty state, slow response (§14)
- [ ] Cross-browser + mobile-web projects (§16); optional axe/visual

### AI workflow
- [ ] ⭐ `CLAUDE.md` with the framework rules, 3 reusable prompts, agents for 1–2 tests, **`docs/ai-review.md`** (§18)

### Presentation
- [ ] ⭐ **ADRs** in `docs/adr/` + `CONTRIBUTING.md` (§19)
- [ ] ⭐ README: what it covers, CI badge, architecture diagram, **design decisions with trade-offs**, how to run
- [ ] Clean history: small commits with clear messages

### ⚠️ Site quirks (automationexercise.com)
- [ ] **Ads + consent popup** (some in iframes) → block ad domains with `context.route` in a fixture, accept consent once. Main flakiness source on this site
- [ ] **API returns HTTP 200 even on errors**, real code in the body (`responseCode`) → assert on the body. Verify this first and note it in the README

---

## 1. Folder structure

Keeps the `src/ui` + `src/api` split, typed models, endpoint maps and builders from my earlier frameworks, in the Playwright-native form.

```
├── src/
│   ├── config/
│   │   └── environments.ts        # typed envs, ENV picks one, secrets validated (the ONLY place dotenv is loaded)
│   ├── ui/
│   │   ├── pages/                 # page objects: locators as readonly fields (getByRole first), user-intent methods
│   │   └── components/            # shared parts a page HAS: HeaderComponent, ProductCard, CartModal
│   ├── api/
│   │   ├── endpoints.ts           # endpoint map: { products: '/productsList', user: (email) => `/getUserDetailByEmail?email=${email}` }
│   │   ├── clients/               # one class per resource (ProductsClient, UserClient): takes `request`, returns the response, no assertions
│   │   └── models/                # TS types for request/response bodies + zod schemas
│   ├── data/
│   │   ├── builders/              # buildUser({ ...overrides }): unique defaults, override what the test cares about
│   │   └── json/                  # static data for data-driven tests (products.json)
│   ├── fixtures/
│   │   ├── ui.fixtures.ts         # page objects, ad-blocking, role option fixture, adminPage/userPage
│   │   ├── api.fixtures.ts        # API clients (+ worker-scoped token/account)
│   │   └── index.ts               # mergeTests(ui, api) → export test, expect
│   ├── types/                     # shared types (Role, EnvName, User)
│   └── utils/                     # small pure helpers only (no Playwright wrappers)
├── tests/
│   ├── setup/                     # auth.setup.ts (one per role)
│   ├── ui/
│   ├── api/
│   └── e2e/                       # hybrid: API setup → UI verify
├── .github/workflows/             # ci.yml (PR: lint → typecheck → @smoke), nightly.yml (schedule: full matrix, sharded)
├── docs/
│   ├── adr/                       # 0001-fixtures-over-basepage.md, …
│   ├── prompts/                   # reusable AI prompts
│   └── ai-review.md               # what the AI got wrong and how I caught it
├── CLAUDE.md                      # framework rules for AI tools
├── CONTRIBUTING.md                # conventions, tags, flaky policy
├── README.md
├── playwright.config.ts
├── eslint.config.mjs
└── tsconfig.json
```

**Rule:** tests → fixtures → pages/components/API clients → config. Lower layers never import upper ones.

**Deliberately NOT included** (patterns from earlier frameworks replaced by Playwright features):

| Old pattern | Replaced by | Why |
| --- | --- | --- |
| Separate `locators/` files with XPath/`#id` strings | `getByRole`/`getByTestId` as `readonly` fields in the page | One place per page, user-facing, no stale-element layer |
| `BasePage` with `goto` in try/catch + `getPage()` | No BasePage (add one only at the Rule of Three) | Swallowing a navigation error hides the real failure; `page` is already injected |
| Assertion classes (`*Asserts extends BasePage`) | `expect` in tests; `expect.extend` custom matcher if a check repeats | Less inheritance, assertions stay visible in the test |
| Service that checks status and throws | Client returns the response; the test asserts | Negative tests (400/404) become possible |
| `request.newContext()` per call | The `request` fixture (or one context per worker) | No leaked contexts; baseURL/headers set once |
| `dotenv.config()` in many files | Loaded once in `src/config/environments.ts` | One source of truth |
| Hardcoded paths (`C:/Users/...`) | `path.join(__dirname, ...)` to files in `src/data/` | Works on every machine and in CI |
| Builder class with a `withX()` per field | `buildUser({ ...overrides })` factory function | Same idea, a fraction of the code; unique defaults keep parallel runs safe |

## 2. Environments (senior pattern)

| Piece | Rule |
| --- | --- |
| `src/config/environments.ts` | All env URLs in one **committed, typed** object (`as const`) |
| `ENV=staging` | Picks the entry; default when unset |
| Secrets | Only from `process.env`: `.env` locally (gitignored), CI secrets / secrets manager in the pipeline |
| Fail fast | `required('USER_EMAIL')` throws a clear error; an unknown `ENV` throws a list of valid ones |
| dotenv | Loaded **inside** `src/config/environments.ts` (imports run first), `quiet: true` |
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
- Paths come from the **endpoint map** (`src/api/endpoints.ts`), never typed inline.
- Request/response bodies are **typed models** (`src/api/models/`); a **zod** schema per response validates the shape in API tests.
- baseURL and auth headers live on the request context (project `use` or `request.newContext`), not in every call.
- Clients are injected via fixtures.
- Test positive **and** negative cases. On automationexercise the HTTP status is always 200: assert `body.responseCode` (see Site quirks).

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

- **Builders** create unique data with overrides: `buildUser({ email: 'x@test.com' })`; defaults like `user-${Date.now()}@test.com` keep parallel runs safe.
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

## 14. Network mocking (edge cases)

Mock only what the real backend can't give you on demand. The real API is covered by API and hybrid tests.

| Case | How |
| --- | --- |
| Server error | `route.fulfill({ status: 500 })` → UI shows the error state |
| Empty state | `route.fulfill({ json: { products: [] } })` → "no results" UI |
| Slow response | `async route => { await new Promise(r => setTimeout(r, 3000)); await route.continue(); }` → loading spinner shown |
| Network down | `route.abort()` |

- Register the route **before** the action, and block service workers in mock specs (`test.use({ serviceWorkers: 'block' })`).
- Block third-party ads/trackers for every test with a fixture (`context.route` on ad domains): the main flakiness source on this site.

## 15. Roles (multi-role, per-worker, option fixture)

| Piece | How |
| --- | --- |
| storageState per role | Setup project writes `playwright/.auth/admin.json`, `user.json` |
| **Option fixture for the role** | `role: ['user', { option: true }]`; `test.use({ role: 'admin' })` switches it. This is the **Strategy pattern via DI**: the test picks the strategy, the fixture builds the right session |
| Multi-role in one test | `adminPage` and `userPage` fixtures, each opening its own `browser.newContext({ storageState })` |
| Per-worker accounts | Worker-scoped fixture creates one account per worker via API (`testInfo.parallelIndex` in the name) and deletes it after → parallel-safe |

## 16. Cross-browser & mobile web

- Projects: `chromium`, `firefox`, `webkit`, plus `Mobile Chrome` (`devices['Pixel 7']`) and `Mobile Safari` (`devices['iPhone 13']`): viewport, touch, user agent.
- PR runs Chromium only; nightly runs the full matrix.
- Optional: `@axe-core/playwright` accessibility scan on 2–3 key pages; `toHaveScreenshot` for 1 visual check.

## 17. Reliability & flaky-test policy

- `fullyParallel: true`, isolated tests (own context, own data), no shared mutable accounts.
- Retries **only in CI** (2), `trace: 'on-first-retry'`, `video: 'retain-on-failure'`.
- **Flaky policy** (written in `CONTRIBUTING.md`):
  1. **Find:** the report marks retried passes as *flaky*; `failOnFlakyTests` on main makes them visible.
  2. **Reproduce:** `--repeat-each=20`, then read the trace.
  3. **Quarantine:** `test.fixme()` with a reason + ticket link. Never delete the assertion.
  4. **Fix the root cause:** usually timing (→ web-first assertion / `waitForResponse`) or shared data (→ builders, per-worker accounts).

## 18. AI workflow

| Piece | What |
| --- | --- |
| `CLAUDE.md` / `AGENTS.md` | The framework rules for any AI: layers, locator order, no assertions in pages/clients, naming, tags |
| Reusable prompts (`.claude/commands/` or `docs/prompts/`) | "Add a page object", "Write an API test for endpoint X", "Fix a flaky test" (each points at the rules + an example file) |
| Playwright MCP / Test Agents | `npx playwright init-agents --loop=claude`: planner → generator → healer for 1–2 tests |
| **`docs/ai-review.md`** | What the AI got wrong and how I caught it (e.g. wrong locator, assertion that can't fail, healer that hid a bug) |

## 19. Documentation

- **README:** how to run, folder structure, how to add a test (step by step), environments.
- **ADRs** in `docs/adr/` (one short file each: context → decision → trade-off):
  `0001-fixtures-over-basepage.md` · `0002-api-data-setup.md` · `0003-typed-env-config.md` · `0004-tagging-strategy.md` · `0005-mocking-scope.md`
- **`CONTRIBUTING.md`:** naming, tags, where assertions go, the flaky policy, PR checklist.

---

## Spec coverage (senior list → where it is)

| Senior requirement | Section |
| --- | --- |
| Layered structure, mergeTests, composition, API clients, builders, typed fail-fast env | 1, 2, 4, 5, 6, 8 |
| storageState per role, multi-role, per-worker accounts, role option fixture | 7, 15 |
| UI e2e (critical journeys only), API (pos/neg/schema), hybrid, mocking, mobile + cross-browser, a11y/visual | 9, 5, 14, 16 |
| Web-first, user-facing locators, no hard waits, fullyParallel, CI-only retries, flaky policy | 3, 9, 17 |
| ESLint Playwright rules, `tsc --noEmit`, Prettier + Husky + lint-staged | 12 |
| CI: lint → typecheck → sharded run → merged report, artifacts, @smoke on PR / nightly full, secrets | 11 |
| BDD (optional) | Optional extras |
| AI workflow | 18 |
| README, ADRs, CONTRIBUTING | 13, 19 |

## Build order

Tier 1 = what a reviewer of a test task checks first. Do Tier 1 completely before starting Tier 2.

| # | Tier | Step | Done |
| --- | --- | --- | --- |
| 1 | 1 | `npm init playwright@latest`, tsconfig, `.gitignore`, ESLint + `eslint-plugin-playwright`, Prettier, Husky + lint-staged | ⬜ |
| 2 | 1 | `src/config/environments.ts` (typed, fail-fast) + config wired | ⬜ |
| 3 | 1 | 2 page objects + 1 component; ad-blocking fixture | ⬜ |
| 4 | 1 | UI fixtures + first UI spec (a critical journey) | ⬜ |
| 5 | 1 | Auth setup project (one role) | ⬜ |
| 6 | 1 | Endpoint map, typed models + zod, API clients, API fixtures + `mergeTests` | ⬜ |
| 7 | 1 | API specs: positive, negative (`responseCode`), schema | ⬜ |
| 8 | 1 | Builders + JSON + data-driven spec; cleanup in teardown | ⬜ |
| 9 | 1 | Hybrid e2e (API setup → UI verify) | ⬜ |
| 10 | 1 | Tags, describe/hooks, `waitForResponse`, reporters, npm scripts | ⬜ |
| 11 | 1 | CI: lint → typecheck → tests → report artifact; @smoke on PR | ⬜ |
| 12 | 1 | README + 3 ADRs + CONTRIBUTING | ⬜ |
| 13 | 2 | Mocking edge cases (500, empty, slow) | ⬜ |
| 14 | 2 | Roles: option fixture, second role, multi-role test, per-worker accounts | ⬜ |
| 15 | 2 | Cross-browser + mobile projects; nightly full matrix on a `schedule` | ⬜ |
| 16 | 2 | Sharding + `merge-reports`; videos/traces as artifacts; `failOnFlakyTests` | ⬜ |
| 17 | 2 | AI workflow: CLAUDE.md, 3 prompts, agents for 1–2 tests, `docs/ai-review.md` | ⬜ |
| 18 | 3 | Optional: axe/visual, BDD | ⬜ |

## Definition of done

- [ ] `npm run lint`, `npm run typecheck` and `npm run format:check` are clean; the pre-commit hook runs them
- [ ] Every spec passes locally and in CI, and each one has been made to fail once on purpose
- [ ] No secrets in the repo; `.env*` and `playwright/.auth/` are gitignored
- [ ] No `waitForTimeout`, no XPath/`nth`, no assertions in page objects or API clients
- [ ] Each layer has a reason, written in an ADR or the README; nothing over-engineered
- [ ] Fast, parallel and stable in CI (no flaky tests without a `fixme` + reason)
- [ ] **A new person can add a test in 10 minutes** using the README "how to add a test" section
- [ ] I can explain every folder and every ADR in 2 minutes without notes

## Optional extras (after Tier 2)

BDD (playwright-bdd: Gherkin steps on top of the same fixtures) · visual tests (`toHaveScreenshot`) · accessibility (`@axe-core/playwright`) · HAR replay (`routeFromHAR`)

Docs: https://playwright.dev/docs/intro · Best practices: https://playwright.dev/docs/best-practices · Fixtures: https://playwright.dev/docs/test-fixtures · Auth: https://playwright.dev/docs/auth · Sharding: https://playwright.dev/docs/test-sharding · Agents: https://playwright.dev/docs/test-agents
