# Solo Project - Senior Framework (interview-first edition)

**Context:** interview in a few days (date not confirmed). Expect a **Playwright test task** (take-home or live, not confirmed), then more interviews. So the order is:

1. **Starter kit** (next 2 days): a small, clean skeleton I know by heart, so the test task never starts from zero.
2. **Mock test task** (day 3): time-boxed, then a reviewer-style review.
3. **Interview prep** (15 min daily): the questions in section 20.
4. **Full framework** (after the task): Tier 1 → Tier 2, built from memory with this file as the checklist.

**Deeper dive:** `Solo Project - Deep Dive.md` builds on this file with the same section numbers: reference patterns, pitfalls and model interview answers.

**Goal of the full framework:** build it the way a senior would on a company project: clear layers, typed config, UI + API, reporting, CI. Bring it back for a PR-style review.

**Site:** [automationexercise.com](https://automationexercise.com). It has a UI **and** a documented public API ([API list](https://automationexercise.com/api_list)), so you get a real API layer. For the mock task: [saucedemo.com](https://www.saucedemo.com) (the most common test-task site, UI only), in **its own repo** copied from the starter kit: **one repo targets one site**.

**My angle:** 2 years of API testing → make the **API layer** the strongest part. It's the thing most UI-focused candidates do weakly.

---

## 0. Test-task playbook (read before the real task)

### Before writing code (first 15 min)
- Read the task twice. List the scenarios and **ask questions** if anything is unclear (asking is a senior signal).
- Write down your **assumptions** for the README straight away.
- Ask or check: **are AI tools allowed?** If yes, say in the README how you used them.

### While building
- Build only the ⭐ items. **Small, clean, well-explained beats big.**
- Order: one test working end to end → refactor into page object + fixture → add the next scenarios → negative cases.
- Commit in small steps with clear messages (reviewers read the history).

### Time split for a 3–4 hour take-home
| Share | What |
| --- | --- |
| 10% | Read, ask questions, list assumptions |
| 60% | Tests + page objects + fixtures |
| 15% | Negative cases, config, lint, a basic CI file if time allows |
| 15% | **README** (decisions, trade-offs, "what I'd add with more time") |

### Live-coding variant
- Think aloud: say the principle while you do it ("I'm not asserting in the page object because…").
- Start with one working test, then refactor. A working simple test beats an unfinished framework.
- If stuck, say what you'd check (trace, locator in the inspector) instead of going silent.

### Final checks (last 15 min)
- [ ] `npm run lint` and `npm run typecheck` are clean
- [ ] Every test passes 3× in a row (`--repeat-each=3`) and each one has been made to fail once on purpose
- [ ] No `test.only`, no `waitForTimeout`, no secrets, no hardcoded local paths
- [ ] README: how to run, structure, decisions + trade-offs, assumptions, site quirks found, what I'd add with more time, AI usage

### README template
```
# <Project name>
## What it covers         (scenarios, UI / API)
## How to run             (install, env vars, npm scripts)
## Structure              (folders + the layer rule)
## Design decisions       (each with its trade-off)
## Assumptions
## Issues found           (bugs / quirks on the site, e.g. API returns 200 on errors)
## What I'd add with more time
## AI usage               (if allowed: what I generated, what I had to fix)
```

---

## ✅ Framework checklist

⭐ = starter kit and test task (what a reviewer checks first). The rest is Tier 1/2 of the full framework.

### Architecture
- [ ] ⭐ **POM**: one class per page, locators as `readonly` fields, methods = user intents
- [ ] ⭐ **Components**: shared parts (header, product card, cart modal) as their own classes; pages *have* them (composition)
- [ ] **BasePage only if needed**: start without one. Add one only when ≥3 pages share real behaviour (Rule of Three). Decision written in the README either way
- [ ] ⭐ **API clients** (one per resource: `ProductsClient`, `UserClient`): no assertions, return responses
- [ ] ⭐ **Fixtures** inject pages + clients; `mergeTests` combines UI + API fixtures
- [ ] Layer rule: tests → fixtures → pages/components/clients/builders → config (never upwards)

### Config & environments
- [ ] ⭐ **Typed config**: `src/config/environments.ts`, `SITE` picks the target app (`automationexercise` / `saucedemo`), fail-fast validation. **One repo targets one site** (the mock task gets its own copy). *(In a company project the same map is keyed by environment, dev/staging/prod, and defaults to dev, never prod.)*
- [ ] ⭐ **Site-specific settings in the config too** (e.g. `testIdAttribute`: `data-qa` on automationexercise, `data-test` on SauceDemo) → the same skeleton, copied per repo, serves both sites
- [ ] ⭐ **Secrets** only from env vars (`.env` locally, GitHub secrets in CI), never in code
- [ ] ⭐ **`.env.example`** listing every required variable (no values)
- [ ] ⭐ **`.gitignore`**: `.env*` + `!.env.example`, `playwright/.auth/`
- [ ] ⭐ **`tsconfig.json`**: `strict`, `resolveJsonModule` (JSON test data), `esModuleInterop`, and **`include: ["src", "tests", "playwright.config.ts"]`** (a folder missing from `include` breaks `tsc` and ESLint's `projectService`)
- [ ] ⭐ **Write state, not config**: config files are read-only at runtime. What tests *produce* goes to generated, gitignored files, all under **one `AUTH_DIR` constant** (`src/config/paths.ts`, resolved from the project root, used by setup, teardown, config and fixtures): `playwright/.auth/user.json` (storageState), `playwright/.auth/account.json` (the created test account, for teardown), later `playwright/.auth/worker-<n>.json`
- [ ] Explicit timeouts: `actionTimeout`, `navigationTimeout`, `expect.timeout`
- [ ] `.nvmrc` (or `engines` in package.json) to pin the Node version

### Test data
- [ ] **Data providers**: JSON in `src/data/json/` + a `for...of` loop → one named test per row
- [ ] **Builders**: `buildUser({ ...overrides })` with unique defaults → parallel-safe
- [ ] Data created via API in setup, deleted in teardown (fixture code after `use()`, or a teardown project)

### Tests
- [ ] ⭐ UI specs, API specs (positive + negative), later schema checks and 1 hybrid e2e (API setup → UI verify)
- [ ] ⭐ Auth (starter kit): setup project **creates its own account via API**, logs in, saves `storageState`; a teardown project deletes the account; login tests opt out. **One shared account is fine only while logged-in tests don't change server state** → then per-worker auth (§7, §15)
- [ ] `test.describe` + hooks, tags `@smoke` / `@regression`, `test.step` in long flows
- [ ] ⭐ Web-first assertions only, no `waitForTimeout`; `waitForResponse` only when there's no visible signal (§9)
- [ ] Typed API responses + **zod** schema validation (type derived from the schema)
- [ ] Contact Us form: file upload (`setInputFiles`) + confirm dialog (`page.on('dialog')`)

### Reporting
- [ ] ⭐ `list` + `html` (on CI: `open: 'never'`), JUnit XML on CI, screenshot on failure, trace on first retry; sharded runs add `--reporter=blob` on the command line

### CI (GitHub Actions)
- [ ] ⭐ Workflow: `npm ci` → lint → typecheck → tests, report as artifact
- [ ] PR = `@smoke` on the **`api` + `chromium` projects**, main/nightly = full suite; `SITE` set by the job, secrets from a GitHub Environment
- [ ] Sharding matrix + `merge-reports`; `failOnFlakyTests` on main
- [ ] Install only the browsers **each job** uses (PR: Chromium; nightly: the full matrix)

### Quality gates
- [ ] ⭐ ESLint + **`eslint-plugin-playwright`** + `no-floating-promises`; `tsc --noEmit`
- [ ] ⭐ `forbidOnly: !!process.env.CI` in the config (a leftover `test.only` fails CI)
- [ ] ⭐ npm scripts: `test`, `test:smoke`, `test:api`, `test:e2e`, `lint`, `typecheck`, `report` (`test:e2e`, not `test:ui`: `--ui` is Playwright's UI mode)
- [ ] *(after the task)* Prettier (`format`, `format:check` scripts), husky + lint-staged pre-commit

### Roles & coverage types
- [ ] **Per-worker auth** + role **option fixture** (Strategy via DI) as the **single place** `storageState` is decided: `guest` vs `user`; second-session test (same user, new login) (§15)
- [ ] Mocking edge cases: 500, empty state, slow response. ⚠️ **First check the site makes XHR calls** (§14)
- [ ] Cross-browser + mobile-web projects (§16); optional axe/visual

### AI workflow
- [ ] `CLAUDE.md` with the framework rules, 3 reusable prompts, agents for 1–2 tests, **`docs/ai-review.md`** (§18)

### Presentation
- [ ] ⭐ README: what it covers, **design decisions with trade-offs**, how to run, "what I'd add with more time"
- [ ] **ADRs** in `docs/adr/` + `CONTRIBUTING.md` (§19)
- [ ] CI badge + architecture diagram in the README
- [ ] ⭐ Clean history: small commits with clear messages

### ⚠️ Site quirks (automationexercise.com)
- [ ] **Ads + consent popup** (some in iframes) → block ad domains with `context.route` in a fixture, accept consent once. Main flakiness source on this site
- [ ] **API returns HTTP 200 even on errors**, the real code is in the body (`responseCode`) → assert on the body. Verify this first and note it in the README. **Interview line:** *"I'd raise this as a contract defect. Until it's fixed, the schema validates `responseCode` so it can't be missed."*
- [ ] **POST endpoints appear to take form fields, not JSON** (`createAccount`, `verifyLogin`, `searchProduct`) → send with the request's `form` option. Verify on the API list page first
- [ ] The site uses **`data-qa`** attributes **where present** (mainly forms: login, signup, contact) → `testIdAttribute: 'data-qa'` from the env config; elsewhere (product cards, navigation) use `getByRole` / `getByText`
- [ ] **Pages appear to be rendered on the server**: the UI probably doesn't call `/api/*`, so there may be little or nothing to mock in the browser. Check DevTools → Network → Fetch/XHR before writing mock specs (§14)

---

## 1. Folder structure

Keeps the `src/ui` + `src/api` split, typed models, endpoint maps and builders from my earlier frameworks, in the Playwright-native form. **Starter kit** = the folders marked ⭐.

```
├── src/
│   ├── config/
│   │   ├── environments.ts        # ⭐ typed site map (+ testIdAttribute per site), SITE picks one, secrets validated (the ONLY place dotenv is loaded)
│   │   └── paths.ts               # ⭐ AUTH_DIR + state files, resolved from the project root (the ONLY place file paths are defined)
│   ├── ui/
│   │   ├── pages/                 # ⭐ page objects: locators as readonly fields (getByRole first), user-intent methods
│   │   └── components/            # ⭐ shared parts a page HAS: HeaderComponent, ProductCard, CartModal
│   ├── api/
│   │   ├── endpoints.ts           # ⭐ endpoint map: PATHS ONLY { productsList: '/api/productsList', userByEmail: '/api/getUserDetailByEmail' }
│   │   ├── clients/               # ⭐ one class per resource: takes `request`, returns the response, no assertions
│   │   └── models/                # zod schemas; TS types derived with z.infer (one source of truth)
│   ├── data/
│   │   ├── builders/              # buildUser({ ...overrides }): unique defaults, override what the test cares about
│   │   └── json/                  # static data for data-driven tests (products.json)
│   ├── fixtures/
│   │   ├── ui.fixtures.ts         # ⭐ page objects, ad blocking (blockAds, reused by every context we open)
│   │   ├── api.fixtures.ts        # ⭐ API clients (+ worker-scoped account)
│   │   ├── auth.fixtures.ts       # full framework: extends mergeTests(ui, api) with role option, per-worker storageState, secondSession
│   │   └── index.ts               # ⭐ exports `test` (browser specs: mergeTests(ui, api), later from auth.fixtures), `apiTest` (API specs: no browser, no auth) + expect
│   ├── types/                     # shared types (Role, SiteName, User)
│   └── utils/                     # small pure helpers only (no Playwright wrappers)
├── tests/
│   ├── setup/                     # ⭐ starter kit: auth.setup.ts (creates account via API + saves storageState), auth.teardown.ts (deletes it); replaced by per-worker auth later
│   ├── ui/                        # ⭐
│   ├── api/                       # ⭐
│   └── e2e/                       # hybrid: API setup → UI verify
├── .github/workflows/             # ⭐ ci.yml (PR: lint → typecheck → @smoke); later nightly.yml (schedule: full matrix, sharded)
├── docs/
│   ├── adr/                       # 0001-fixtures-over-basepage.md, …
│   ├── prompts/                   # reusable AI prompts
│   └── ai-review.md               # what the AI got wrong and how I caught it
├── .env.example                   # ⭐ required variables, no values
├── .nvmrc                         # Node version
├── CLAUDE.md                      # framework rules for AI tools
├── CONTRIBUTING.md                # conventions, tags, flaky policy
├── README.md                      # ⭐
├── playwright.config.ts           # ⭐
├── eslint.config.mjs              # ⭐
└── tsconfig.json                  # ⭐
```

**Rule:** tests → fixtures → pages/components/API clients/builders → config. Lower layers never import upper ones.

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
| Query strings built into URLs | Paths in the endpoint map, values via the `params` option | Playwright encodes them (emails with `+` or `&` don't break) |
| Separate TS interfaces + validation | zod schema, type from `z.infer` | The type and the validation can't drift apart |

## 2. Environments (senior pattern)

| Piece | Rule |
| --- | --- |
| `src/config/environments.ts` | All target URLs in one **committed, typed** object (`as const`) |
| Site-specific settings | Also in the entry: `testIdAttribute` (`data-qa` / `data-test`), `apiURL` if the site has one |
| `SITE=saucedemo` | Picks the entry; default `automationexercise` when unset |
| Two dimensions | *Site* (which app) ≠ *environment* (dev/staging/prod of one app). This repo needs `SITE`; a company project needs `ENV`, default dev, **never prod** |
| One repo = one site | Specs, page objects and API clients are site-specific: `SITE=saucedemo npm test` in the automationexercise repo would run the wrong specs against the wrong app (and `apiURL: ''` breaks the API project). The mock task gets **its own repo**: a copy of the starter kit with `SITE` defaulting to `saucedemo`. The map still shows that site differences are config, not code |
| Secrets | Only from `process.env`: `.env` locally (gitignored), CI secrets in the pipeline |
| `.env.example` | Lists every required variable without values; committed |
| Fail fast | `required('SAUCE_PASSWORD')` throws a clear error where the secret is used; an unknown `SITE` throws a list of valid ones. automationexercise needs **no** secrets: tests create throwaway accounts |
| dotenv | Loaded **inside** `src/config/environments.ts` (imports run first), `quiet: true` |
| `playwright.config.ts` | Reads `env.baseURL` and `env.testIdAttribute`; API project uses `env.apiURL` |

Interview line: *"Non-secret config is versioned and typed; secrets come from the environment and are validated at startup. Site differences like the test-id attribute are config, not code. In a company project the same map is keyed by environment and defaults to dev, never prod."*

## 3. Locator strategy

1. `getByRole(role, { name })`: what the user sees, plus accessibility
2. `getByLabel` / `getByPlaceholder` / `getByText`
3. `getByTestId` (attribute from the env config: `data-qa` here **where present**, `data-test` on SauceDemo)
4. CSS last.

- **Avoid by default:** XPath, `nth()`, positional selectors. **Allowed with a comment** when order *is* the behaviour (e.g. "the first search result", "sorted by price").
- Narrow down with `filter({ hasText })` and chaining (`row.getByRole('button')`).
- Locators are `readonly` fields in page objects.

## 4. Page objects & components

- **No outcome assertions** in pages. Allowed: sync guards (wait until the page is ready).
- **Composition over BasePage:** a page *has* a `HeaderComponent`.
- **No anemic wrappers:** don't wrap `click()` or `fill()`. Methods are **user intents** (`login(user)`, `addToCart(name)`).
- `goto()` is a method, not in the constructor.

## 5. API layer

- One client per resource. It takes `APIRequestContext` and returns responses or parsed data. **No assertions inside.**
- Paths come from the **endpoint map** (`src/api/endpoints.ts`), never typed inline. Query values go through the `params` option, never string-built.
- POST bodies on this site are **form fields** (`form` option), not JSON (verify first).
- Each response has a **zod** schema; the TS type is derived from it with `z.infer`.
- baseURL and headers live on the request context (project `use` or `request.newContext`), not in every call.
- Clients are injected via fixtures. **API specs import `apiTest`** (API fixtures only), so they never start a browser or trigger the login (§15).
- Relative paths work here only because `apiURL` and `baseURL` are the **same host** (the `request` fixture uses the project's `baseURL`). With a separate API host, the clients get their own context with `baseURL: env.apiURL`, the way the worker fixtures do.
- Test positive **and** negative cases. The HTTP status is always 200: assert `body.responseCode`.
- **Don't assert `response.ok()` / `toBeOK()` / status 200 here:** on this site they can never fail. The schema's `responseCode: z.literal(200)` is the real check.

**Ready-made API cases.** ⚠️ These codes come from the site's API list but are **not verified yet**. In starter-kit step S5, check each one against the live API (a quick `request` call or the browser) **before** writing the test, and note any difference in the README under "Issues found".

| Case | Expected `responseCode` |
| --- | --- |
| GET products list | 200 + products array (schema check) |
| POST to products list (wrong method) | 405 |
| Search product with a term | 200 + matching products |
| Search product without the parameter | 400 |
| Verify login, valid credentials | 200 |
| Verify login, missing email | 400 |
| Verify login, wrong credentials | 404 |
| Create account → get user by email → delete account | 201 → 200 → 200 (the full lifecycle, cleanup included) |

## 6. Fixtures

| Kind | Use |
| --- | --- |
| Test-scoped (default) | Page objects, per-test data, `freshAccount` (create → `use` → delete) for the rare test that needs a clean account |
| **Worker-scoped** (`{ scope: 'worker' }`) | Expensive setup shared by one worker: a per-worker account. **Parallel-safe, not isolated**: the worker's tests run one after another on it, so a test never assumes state it didn't create |
| **Option fixtures** (`{ option: true }`) | Values a project or test can override (`test.use({ role: 'user' })`) |
| Teardown (code after `use()`) | Only for external effects: delete created data, close contexts you opened (`try/finally` when one cleanup step could throw) |
| `mergeTests` | Combine `ui` + `api` fixture files into one `test` |
| Contexts you open yourself | **Routes never carry over** (the ad-blocking override only covers the built-in `context`) → call `blockAds()`. **Options may be inherited** from the project, including `storageState` → be explicit: `browser.newContext({ baseURL: env.baseURL, storageState: undefined })`. Check once: `await context.cookies()` is empty right after creating it |

## 7. Auth

Login accounts are **created by the tests themselves**, never a real or shared credential (this is what keeps the public repo's traces harmless, see §11). Auth comes in **two stages**:

| Stage | Pattern | Right while… |
| --- | --- | --- |
| **Starter kit** | Setup project creates **one** account and saves `storageState`; teardown project deletes it | logged-in tests **don't change server state** (or `workers: 1`) |
| **Full framework** | **Per-worker auth** (§15): each worker creates and logs in its own account | any logged-in test changes server state (cart, address, orders) |

Why: with one shared account and `fullyParallel`, two workers adding to the same cart make cart counts flaky (the shared mutable account §17 forbids). Record the switch as an ADR.

**Starter kit steps:**
1. **Setup project** (`tests/setup/auth.setup.ts`, imports `test as setup` from `src/fixtures` and asks for `userClient` + `loginPage`): build a unique user → `createAccount` via the API → log in through the UI once → `mkdirSync(AUTH_DIR, { recursive: true })` → save `USER_STATE` (storageState) **and** `ACCOUNT_FILE` (the generated credentials, for teardown). All paths from `src/config/paths.ts`; all gitignored.
2. **Teardown project** (`tests/setup/auth.teardown.ts`, linked with `teardown:` on the setup project): read `ACCOUNT_FILE` (skip if setup never created it) → `deleteAccount` via the API. Log, don't assert.
3. Browser projects use `dependencies: ['setup']` + `storageState: USER_STATE`.
4. Login tests opt out with `test.use({ storageState: { cookies: [], origins: [] } })`.

**Full framework:** remove `storageState` from the project, drop the setup/teardown projects, and **delete the login specs' `test.use({ storageState: … })` opt-outs** (they rely on the default `role: 'guest'` instead). The role fixture (§15) becomes the **only** place the session is decided. Never set it in two places.

On SauceDemo (mock task) there's no signup: the demo users are fixed and public, read them from env anyway to show the pattern.

## 8. Test data

- **Builders** create unique data with overrides: `buildUser({ email: 'x@test.com' })`; unique defaults (`crypto.randomUUID()`, not `Date.now()` alone: two workers can hit the same millisecond) keep parallel runs safe.
- Create data **via API** in setup and **delete it** in teardown (createAccount / deleteAccount).
- Static data goes in JSON (needs `resolveJsonModule` in tsconfig).
- **Accounts:** never shared across workers. Inside one worker, tests never assume what an earlier test left (assert "contains the item", not "count = 1"); a test that needs a clean account asks for **`freshAccount`** (test-scoped fixture, §6).

## 9. Writing tests

- `test.describe` + `beforeEach` for shared steps, and fixtures for reusable setup.
- Tags: `{ tag: ['@smoke'] }`, run with `--grep @smoke`.
- Data-driven: loop over JSON and create one `test()` per row, each with a unique title.
- **Web-first assertions only** (`await expect(locator)…`). No `waitForTimeout`.
- `waitForResponse` **only** when the UI gives no visible signal before the next step (a background XHR) or you need the response data; start waiting **before** the click. For a page navigation, the web-first assertion on the new page is enough (adding `waitForResponse` there is over-syncing).
- Matching text from data: `toContainText(term, { ignoreCase: true })`, not `new RegExp(term)` (regex characters in the data break it).
- Every test must be able to fail. Prove it once.

## 10. Reporting & debugging

| Setting | Value |
| --- | --- |
| `reporter` | Local: `list` + `html`. CI: `list` + `html { open: 'never' }` + `junit` → `test-results/junit.xml`. Sharded nightly: `--reporter=blob` on the command line (replaces the config's reporters), merged afterwards |
| `screenshot` | `'only-on-failure'` |
| `trace` | `'on-first-retry'` |
| `retries` | CI 2, local 0 (retries **flag** flaky tests, they don't fix them) |
| `forbidOnly` | `!!process.env.CI` |
| `workers` | CI `2`, local default. **Not the template's `1` on CI**: with one worker, parallel safety and per-worker auth are never exercised in CI (the prep repo's mock test only failed in parallel) |

## 11. CI (GitHub Actions)

- **Triggers:** `pull_request` **and** `push` to `main`. I push straight to `main`, so a PR-only workflow would never run.
- **Install:** `npm ci` (lockfile, reproducible), Node version from `.nvmrc` (`actions/setup-node` with `node-version-file: '.nvmrc'`).
- **PR:** lint + type-check + `@smoke` on the **`api` and `chromium` projects** (`--project=api --project=chromium`), so the API layer runs on every PR. Install Chromium only (`npx playwright install --with-deps chromium`).
- **main / nightly:** full suite on the full browser matrix (install all browsers in that job).
- **Sharding:** a matrix with `--shard=${{ matrix.shard }}/3 --reporter=blob`, then a `merge-reports` job.
- **Artifacts:** HTML report (generated on CI because the config includes `html`) and traces with a short `retention-days`. The repo is **public** (portfolio), so tests use **only throwaway accounts they create themselves** (§7), never a real credential. Then traces leak nothing that matters.
- **Secrets & target:** the job sets `SITE`; secrets come from a GitHub Environment.

## 12. Quality gates

- ESLint with `eslint-plugin-playwright` and `@typescript-eslint/no-floating-promises` (catches a missing `await`).
- `tsc --noEmit` in CI.
- npm scripts: `test`, `test:smoke`, `test:api`, `test:e2e`, `lint`, `typecheck`, `report`.
- After the task: Prettier (`format`, `format:check`) + Husky + lint-staged.

## 13. README (for the interviewer)

- What the framework covers, plus a CI badge.
- An **architecture diagram** (the layers from section 1).
- **Design decisions**, each with its trade-off: composition vs BasePage, the env pattern, API setup + UI verify, the tagging strategy.
- **Issues found** on the site (200 on errors, ads, any API code that differs from the docs).
- How to run, with all the npm scripts. "What I'd add with more time."

---

## 14. Network mocking (edge cases)

Mock only what the real backend can't give you on demand. The real API is covered by API and hybrid tests.

**⚠️ Step 0: check there's something to mock.** `page.route` only changes requests the **browser** makes. automationexercise pages appear to be rendered on the server, so the UI probably never calls `/api/productsList`, and has no spinner or error state to check. Open DevTools → Network → **Fetch/XHR** and click around first:
- **Real XHR calls whose result the UI shows** (add to cart might be one) → mock those.
- **None** → put the mocking specs on a **single-page app that loads its data through an API**, and say why in the README. A mock on a call the page never makes is a test that proves nothing.
- **Make each mock test fail once:** remove the `page.route` line. If it still passes, the mock did nothing.

| Case | How |
| --- | --- |
| Server error | `route.fulfill({ status: 500 })` → UI shows the error state |
| Empty state | `route.fulfill({ json: { products: [] } })` → "no results" UI |
| Slow response | `async route => { await new Promise(r => setTimeout(r, 3000)); await route.continue(); }` → loading state shown |
| Network down | `route.abort()` |

- **The delay in "slow response" is not a hard wait in the test.** It lives in the **mock** and simulates a slow server. The test itself still waits web-first (`await expect(spinner).toBeVisible()`, then `toBeHidden()`). Say this if an interviewer asks.
- Register the route **before** the action, and block service workers in mock specs (`test.use({ serviceWorkers: 'block' })`).
- Block third-party ads/trackers for every test with a fixture (`context.route` on ad domains): the main flakiness source on this site.

## 15. Roles + per-worker auth (fitted to this site)

automationexercise has **no admin role**, only guests and registered users. The patterns stay the same with honest scenarios. This stage **replaces** the starter kit's setup project (§7). It lives in `src/fixtures/auth.fixtures.ts`, which extends `mergeTests(ui, api)` because it needs both.

| Piece | How |
| --- | --- |
| Per-worker account | `workerAccount` (worker-scoped, §6) creates one account per worker via API and deletes it after → workers never share server state |
| Per-worker session | `workerStorageState` (worker-scoped) logs that account in **once** in its own context and saves `playwright/.auth/worker-<n>.json` |
| **Option fixture for the role** | `role: ['guest', { option: true }]`, values `guest` / `user`; `test.use({ role: 'user' })` switches it. This is the **Strategy pattern via DI**: the test picks the strategy, the fixture builds the right session |
| **One place for the session** | The overridden `storageState` fixture: `user` → the worker's session file, `guest` → empty. Removed from the project config |
| Second session in one test | `secondSession`: the **same user logged in again** in a separate context, created with `{ baseURL, storageState: undefined }` + `blockAds()` and closed after `use()`. Without `storageState: undefined` it may copy the first session's cookies, and the scenario below can't fail |
| Scenario that can fail | Add to cart in the main session → the item is in the cart in `secondSession`. True only if the cart is stored on the server per user; if it fails, that's a finding. **Verify** |

**Why not "user A's cart isn't visible to user B":** separate contexts always have separate sessions, so that test passes even if the server is wrong. It can't fail, so it proves nothing.

**Trade-off:** even a guest test triggers the worker login once per worker (fixtures can't be requested conditionally). One login per worker is an acceptable cost. **API specs must not pay it:** they import `apiTest` (no auth layer); otherwise every API test would launch a browser and log in. Verify with `npm run test:api`: no browser should start.

## 16. Cross-browser & mobile web

- Projects: `chromium`, `firefox`, `webkit`, plus `Mobile Chrome` (`devices['Pixel 7']`) and `Mobile Safari` (`devices['iPhone 13']`): viewport, touch, user agent.
- PR runs Chromium only; nightly runs the full matrix.
- Optional: `@axe-core/playwright` accessibility scan on 2–3 key pages; `toHaveScreenshot` for 1 visual check.

## 17. Reliability & flaky-test policy

- `fullyParallel: true` and **`workers: 2` on CI** (§10); every test has its own context; data is unique per test or per worker; no mutable account shared across workers; no test assumes state another test left.
- Retries **only in CI** (2), `trace: 'on-first-retry'`, `video: 'retain-on-failure'`.
- **Flaky policy** (written in `CONTRIBUTING.md`):
  1. **Find:** the report marks retried passes as *flaky*; `failOnFlakyTests` on main makes them visible.
  2. **Reproduce:** `--repeat-each=20`, then read the trace.
  3. **Quarantine:** `test.fixme()` with a reason + ticket link. Never delete the assertion.
  4. **Fix the root cause:** usually timing (→ web-first assertion / `waitForResponse`), shared data (→ builders, per-worker accounts) or third-party noise (→ ad blocking).

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
  `0001-fixtures-over-basepage.md` · `0002-api-data-setup.md` · `0003-typed-env-config.md` · `0004-tagging-strategy.md` · `0005-mocking-scope.md` · `0006-per-worker-auth.md` (why the shared setup account was replaced)
- **`CONTRIBUTING.md`:** naming, tags, where assertions go, the flaky policy, PR checklist.

## 20. Interview prep (15 min daily)

For each: define it in 1–2 sentences, give one example from this framework, name one trade-off. Say "it depends" + the trade-off, not absolutes. Model answers: `Solo Project - Deep Dive.md` §20.

| Question | Section |
| --- | --- |
| What are fixtures and why use them over hooks / a BasePage? | 6 |
| Test vs worker scope? When is teardown needed? | 6 |
| Where do assertions go, and why not in page objects or API clients? | 4, 5 |
| BasePage: when is it fine, when is it a problem? Composition vs inheritance | 1, 4 |
| Your locator strategy, and when you'd break it | 3 |
| How does auto-waiting work? Why is `waitForTimeout` an anti-pattern? | 9 |
| How do you handle auth for many tests and several users? | 7, 15 |
| How do you keep tests parallel-safe? | 8, 15, 17 |
| One shared login account vs per-worker auth: when do you switch? | 7, 15 |
| Why do API specs import `apiTest` instead of `test`? | 5, 15 |
| A test is flaky in CI only. Walk me through it | 17 |
| Retries: help or harm? | 10, 17 |
| How do you structure API tests? Positive vs negative vs schema | 5 |
| When do you mock and when do you hit the real backend? | 14 |
| How do you manage environments and secrets? | 2 |
| How would you set up CI for this suite? | 11 |
| How do you use AI for tests, and how do you catch tests that prove nothing? | 18 |
| Playwright vs Selenium / Cucumber: what changes in the framework? | 1 ("Deliberately NOT included") |

---

## Build order

### Starter kit (next 2 days) — do this before the test task

| # | Step | Done |
| --- | --- | --- |
| S1 | `npm init playwright@latest`, tsconfig (`strict`, `resolveJsonModule`, `esModuleInterop`, `include` covers `src` + `tests` + the config), `.gitignore` (`.env*`, `!.env.example`, `playwright/.auth/`), `.env.example`, ESLint + `eslint-plugin-playwright`, **npm scripts** (`test`, `test:smoke`, `test:api`, `test:e2e`, `lint`, `typecheck`, `report`) | ⬜ |
| S2 | `src/config/environments.ts` (typed site map, `SITE`, fail-fast, `testIdAttribute` per site) + `src/config/paths.ts` (`AUTH_DIR`) + config wired (`forbidOnly`, retries, `workers: 2` on CI, reporters incl. `html` on CI, trace, `testIdAttribute` from env) | ⬜ |
| S3 | 1 page object + 1 component; ad-blocking fixture | ⬜ |
| S4 | UI fixtures + first UI spec (a critical journey) + 1 negative UI case | ⬜ |
| S5 | **Verify the API codes (§5) against the live API first**, then endpoint map + 1 API client + API fixture + `mergeTests` (`index.ts` exports `test` and `apiTest`); 1 positive + 1 negative API spec | ⬜ |
| S6 | Auth: setup project creates the account via API + saves `storageState`; teardown project deletes it; login spec opts out. Logged-in tests stay read-only for now (§7) | ⬜ |
| S7 | Minimal CI on **`pull_request` + `push` to `main`**: `npm ci` → lint → typecheck → smoke on `api` + `chromium` → HTML report artifact | ⬜ |
| S8 | README from the template in section 0 | ⬜ |

### Mock test task (day 3) — time-box 3 hours, then bring it for review

In **its own repo** (copy the starter kit, `SITE` default `saucedemo`, remove the automationexercise specs and API layer), on **saucedemo.com** (users: `standard_user`, `locked_out_user`, `problem_user`; password `secret_sauce`; read them from env anyway to show the pattern; `testIdAttribute: 'data-test'` via the env config):
1. Login: success + locked-out user (negative)
2. Sort products by price (low → high) and verify the order
3. Add 2 items → cart shows 2 → checkout → verify **"Item total" = the sum of the two item prices** (read from the page, not hardcoded) and **"Total" = item total + tax** → order complete
4. Checkout with a missing field shows the error
5. README with decisions, assumptions and "what I'd add with more time"

### Full framework (after the task)

| # | Tier | Step | Done |
| --- | --- | --- | --- |
| 1 | 1 | Prettier (`format`, `format:check`), Husky + lint-staged, `.nvmrc` | ⬜ |
| 2 | 1 | More pages/components; Contact Us (upload + dialog) | ⬜ |
| 3 | 1 | Remaining API clients + zod schemas (`z.infer`) + the ready-made API cases (§5) | ⬜ |
| 4 | 1 | Builders + JSON + data-driven spec; cleanup in teardown | ⬜ |
| 5 | 1 | Hybrid e2e (API creates the account → UI logs in → verify) | ⬜ |
| 6 | 1 | Tags, describe/hooks, `waitForResponse`, `test.step`, full npm scripts | ⬜ |
| 7 | 1 | CI: `@smoke` on PR, full on main | ⬜ |
| 8 | 1 | README (diagram, CI badge) + 3 ADRs + CONTRIBUTING | ⬜ |
| 9 | 2 | Mocking edge cases (500, empty, slow): **first check Network → Fetch/XHR**; if the site has nothing to mock, use a single-page app (§14) | ⬜ |
| 10 | 2 | Per-worker auth replaces the setup project; role option fixture as the single `storageState` source; `secondSession` test; ADR 0006 | ⬜ |
| 11 | 2 | Cross-browser + mobile projects; nightly full matrix on a `schedule` | ⬜ |
| 12 | 2 | Sharding + `merge-reports`; videos/traces as artifacts; `failOnFlakyTests` | ⬜ |
| 13 | 2 | AI workflow: CLAUDE.md, 3 prompts, agents for 1–2 tests, `docs/ai-review.md` | ⬜ |
| 14 | 3 | Optional: axe/visual, BDD | ⬜ |

## Definition of done (full framework)

- [ ] `npm run lint`, `npm run typecheck` and `npm run format:check` are clean; the pre-commit hook runs them
- [ ] Every spec passes locally and in CI, and each one has been made to fail once on purpose (mock specs: remove the route, and the test must fail)
- [ ] No checks that can't fail on this site (`response.ok()`, status 200); no mutable account shared across workers
- [ ] CI runs on PRs **and** pushes to `main`, with more than one worker; API specs start no browser
- [ ] No secrets in the repo; `.env*` (except `.env.example`) and `playwright/.auth/` are gitignored
- [ ] No `waitForTimeout`; no XPath/`nth` without a comment explaining why; no assertions in page objects or API clients
- [ ] Each layer has a reason, written in an ADR or the README; nothing over-engineered
- [ ] Fast, parallel and stable in CI (no flaky tests without a `fixme` + reason)
- [ ] **A new person can add a test in 10 minutes** using the README "how to add a test" section
- [ ] I can explain every folder and every ADR in 2 minutes without notes

## Optional extras (after Tier 2)

BDD (playwright-bdd: Gherkin steps on top of the same fixtures) · visual tests (`toHaveScreenshot`) · accessibility (`@axe-core/playwright`) · HAR replay (`routeFromHAR`)

Docs: https://playwright.dev/docs/intro · Best practices: https://playwright.dev/docs/best-practices · Fixtures: https://playwright.dev/docs/test-fixtures · Auth: https://playwright.dev/docs/auth · Sharding: https://playwright.dev/docs/test-sharding · Agents: https://playwright.dev/docs/test-agents