# Revision

One file to revise from: **definitions** first, then **questions** to test yourself.

---

# Part 1: Definitions

### Tooling
| Term | Plain meaning |
| --- | --- |
| **Node.js** | Runtime that runs JavaScript outside the browser (≈ JVM) |
| **npm** | Package manager: installs libraries (≈ Maven) |
| **npx** | Package runner: runs a tool from `node_modules` (= `npm exec`) |
| **package.json** | My manifest: dependencies as version *ranges* (≈ pom.xml) |
| **package-lock.json** | Generated: *exact* versions of everything → same install everywhere |
| **`npm ci`** | Clean install exactly from the lock file (CI, repairs `node_modules`) |
| **Transpile** | Convert TS → JS (types stripped, no type-check) |
| **`tsc --noEmit`** | Type-check only, write no files |
| **ESLint** | Code checker; `no-floating-promises` = catches a missing `await` |
| **git** | Version control on my machine |
| **GitHub** | Website hosting git repos + CI (Actions) |
| **CI** | Server runs the tests automatically on every push |

### Playwright basics
| Term | Plain meaning |
| --- | --- |
| **Browser** | One browser process (Chromium, Firefox, WebKit) |
| **Context** | Fresh incognito profile, **one per test** (own cookies/storage) |
| **Page** | One tab inside a context |
| **Spec file** | `*.spec.ts` file holding tests (not a "feature file") |
| **Test** | One `test()` block = one isolated scenario |
| **Step** | `test.step()` = a labeled section *inside* one test (shares state) |
| **Test isolation** | Tests share nothing → any order, in parallel |
| **Worker** | Separate process running tests in parallel |
| **Codegen** | Recorder: gives actions + locators, *not* assertions |
| **baseURL** | Config root URL → `goto('/auth/login')` |

### Locators & assertions
| Term | Plain meaning |
| --- | --- |
| **Locator** | *Description* of how to find an element. Lazy: no browser call, no `await` |
| **Locator priority** | role > label > test id > CSS |
| **Test id** | `data-test="..."` attribute → `getByTestId` (`testIdAttribute` in config) |
| **Chaining** | `parent.getBy...()` = search only inside a container |
| **Actionability / auto-wait** | Before an action, PW waits until the element is visible, enabled, stable |
| **Web-first assertion** | `await expect(locator).toHaveText()` → **retries** until timeout |
| **Generic assertion** | `expect(value).toBe()` → checks **once**, no retry |

### Async (JS/TS)
| Term | Plain meaning |
| --- | --- |
| **Promise** | "Result comes later" object |
| **`async`** | Function that returns a Promise |
| **`await`** | Pause until the Promise finishes. Needed on every browser action, web-first assertion, and my own async methods |
| **Floating promise** | Promise without `await` → test moves on too early |

### Framework design
| Term | Plain meaning |
| --- | --- |
| **POM** | Page Object Model: one class per page, holds locators + actions |
| **SRP** | Single Responsibility: one class, one job → assertions stay in tests |
| **YAGNI** | "You aren't gonna need it": don't build (BasePage) before it's needed |
| **Composition** | Combine small parts instead of deep inheritance |
| **Fixture** | Object PW builds and *injects* into the test (`page`, my `loginPage`) ≈ dependency injection |
| **`test.extend`** | Creates my own `test` with extra fixtures |
| **`use(value)`** | Inside a fixture: "hand this to the test now". Code before = setup, code after = teardown |
| **storageState** | Saved cookies/storage of a logged-in user → reuse login, skip the UI login |

### Config & secrets
| Term | Plain meaning |
| --- | --- |
| **Env var** | Value from outside the code: `process.env.BASEURL` (`string \| undefined`) |
| **`??`** | Fallback if the value is `undefined`/`null` |
| **`.env` + dotenv** | Local file with secrets, loaded into `process.env`; never committed |
| **`.env.example`** | Committed template with names, no values |
| **GitHub Secrets** | Where CI gets secrets instead of `.env` |
| **JWT / Bearer token** | Login token sent in API headers → a secret |

### Debugging
| Term | Plain meaning |
| --- | --- |
| **HTML report** | Results page (`npx playwright show-report`) |
| **Trace** | Recording of a run: actions, DOM snapshots, network, console. Contains secrets |
| **Flaky test** | Sometimes passes, sometimes fails, same code |
| **Retries** | Re-run on failure; *hides* flakiness, never the fix |
| **Failure triage** | Sort a red test: **test bug / app bug / environment** |

---

# Part 2: Questions

Answer out loud **before** opening the answer.
✅ got it · 🟡 half · ❌ missed · ⬜ not asked yet (new)

**Re-read first:** all ❌ → then 🟡.

---

## Day 1: setup, codegen, first test

### 1.1 Node.js, npm, npx: what is each one? 🟡
<details><summary>Answer</summary>

| Thing | Category | Java analogy |
| --- | --- | --- |
| Node.js | **runtime** (not a library) | JVM |
| npm | **package** manager (not "packet") | Maven |
| npx | package **runner** (= `npm exec`) | `mvn exec` |

Direction: npm/npx run **on** Node, not the other way round.
</details>

### 1.2 package.json vs package-lock.json? 🟡 (swapped them)
<details><summary>Answer</summary>

| package.json | package-lock.json |
| --- | --- |
| Written by me | Generated by npm |
| Version **ranges** (`^1.48.0`) | **Exact** versions of the whole tree |
| ≈ pom.xml | Reproducibility |

Both are committed. CI uses `npm ci` (installs exactly from the lock file).
</details>

### 1.3 You delete the lock file and run `npm install`. What happens? ❌
<details><summary>Answer</summary>

It **still builds**. npm resolves the ranges again and may pick **newer** versions → **version drift** ("works on my machine", a teammate or CI gets different versions).
</details>

### 1.4 Browser → context → page: what is each? 🟡 (called it "page object")
<details><summary>Answer</summary>

```
Browser (1 process, e.g. Chromium)
 └─ Context  = fresh incognito profile, 1 per test (cookies, storage)
     └─ Page = one tab
```
A **page object** is something else: my own class (POM).
</details>

### 1.5 First run failed at `browserType.launch`. Which category, and what's the fix? ⬜
<details><summary>Answer</summary>

**Environment** (not a test bug). Missing OS libraries.

| Command | Installs |
| --- | --- |
| `npx playwright install` | Browser binaries |
| `npx playwright install-deps` | OS libraries (Linux) |
| `npx playwright install --with-deps` | Both, used in CI |
</details>

### 1.6 Why is `div.nth(3)` a bad locator? ✅
<details><summary>Answer</summary>

It depends on page structure/order → breaks when the layout changes. Use role / label / test id instead.
</details>

### 1.7 The test clicked Login and checked the next page immediately → flaky. Why, and what's the fix? ⬜
<details><summary>Answer</summary>

**Race:** the check ran before navigation finished. Fix: a web-first assertion that **waits**: `await expect(page).toHaveURL(/account/)`.
One-liner: *assertions are the synchronization, not sleeps.*
</details>

### 1.8 Codegen: what does it give you, and what's your job? ⬜
<details><summary>Answer</summary>

Codegen = **actions + locators**. My job: add **assertions**, delete recording noise, check locator quality.
</details>

### 1.9 Does Playwright type-check my TypeScript? ⬜
<details><summary>Answer</summary>

**No.** It **transpiles** (not "translates") on the fly and strips types. Type check separately: `npx tsc --noEmit` (in CI).
</details>

---

## Day 2: locators, assertions, baseURL, trace

### 2.1 `getByRole` vs `getByTestId`: when to use which? ❌ (not answered)
<details><summary>Answer</summary>

Priority: **role > label > test id > CSS**.

| `getByRole` | `getByTestId` |
| --- | --- |
| User-facing, also checks accessibility | Stable, independent of the UI text |
| Breaks on translations/text changes | Needs devs to add `data-test` |
| Default choice | Duplicates, translated apps, no good role |
</details>

### 2.2 A: `expect(await loc.textContent()).toBe('X')` vs B: `await expect(loc).toHaveText('X')`. Which, and why? ❌
<details><summary>Answer</summary>

**B.** A reads the value **once** (snapshot), so if the text isn't there yet → fails (flaky). B **retries** until it matches or times out.

| | `await` position | Retries? |
| --- | --- | --- |
| Generic (`toBe`) | **inside** (on the browser value) | ❌ |
| Web-first (`toHaveText`) | **outside** (on `expect`) | ✅ |
</details>

### 2.3 Why did `expect(loc.count()).toBe(5)` show "Received: Promise {}"? 🟡
<details><summary>Answer</summary>

`count()` returns a Promise and it wasn't awaited. Also, `count()` is a snapshot → better: `await expect(loc).toHaveCount(5)`.
</details>

### 2.4 You ran with `BASEURL=...` but the config reads `BASE_URL`. What happened? ⬜
<details><summary>Answer</summary>

`process.env.BASE_URL` was `undefined` → `??` **silently** used the fallback URL. Exact names matter. Fail fast with a guard if no fallback is wanted.
</details>

### 2.5 Interview: why is Playwright less flaky than Selenium? 🟡 (said "WebSocket")
<details><summary>Answer</summary>

1. **Auto-wait**: actions wait for the element to be actionable (visible, enabled, stable).
2. **Web-first assertions** retry until timeout.
3. **Fresh context per test**: no leftover state.

The WebSocket is the **protocol/transport**, not the reason (tool ≠ protocol).
Not "await instead of sleep" → **assert on the expected state** instead of sleeping.
</details>

### 2.6 Interview: a test fails in CI only. What do you do? 🟡
<details><summary>Answer</summary>

1. Download the **HTML report** artifact → filter failed.
2. Open the **trace** (`on-first-retry`): error (expected vs received), DOM snapshot, Network tab, console.
3. **Triage**: test / app / environment (see 3W.4).
4. Fix the root cause. **Never add retries as the fix**: they hide flakiness.
</details>

### 2.7 Why must traces/reports never be shared publicly? ✅
<details><summary>Answer</summary>

They contain **secrets**: tokens (JWT in headers), cookies, typed passwords.
</details>

### 2.8 What's the difference between `goto('/auth/login')` and `goto('auth/login')`? ⬜
<details><summary>Answer</summary>

Leading `/` = from the **domain root**. Without it = relative to the baseURL path. Keep the leading `/`.
</details>

---

## Day 3: git, .env, page objects

### 3.1 git vs GitHub? 🟡 (said "github" for git)
<details><summary>Answer</summary>

**git** = version control tool on my machine. **GitHub** = website that hosts git repos (+ Actions CI).
</details>

### 3.2 Does it matter if `.env` is added to `.gitignore` before or after creating it? ✅
<details><summary>Answer</summary>

Not as long as it's **never committed**. If it was committed: it stays in **history** → **rotate** the secrets (deleting the file isn't enough).
</details>

### 3.3 Run output said "injected env (3)" then "(0)". Why? ⬜
<details><summary>Answer</summary>

The config loads in the **main process** (injects 3) and again in each **worker**. The workers already inherit the vars, and dotenv doesn't override → 0.
</details>

### 3.4 `process.env.USER_EMAIL` has which type, and how do you handle it? ⬜
<details><summary>Answer</summary>

`string | undefined`. Options: `!` (quick, "trust me") or a **guard** that throws a clear error (fail fast).
</details>

### 3.5 Why no `goto` in the POM constructor? ⬜
<details><summary>Answer</summary>

Constructors **can't be async** (can't `await`). Put it in a method: `async goToPage()`.
</details>

### 3.6 Should you create a BasePage? ⬜
<details><summary>Answer</summary>

Not by default: **YAGNI**. Prefer **composition** (small components/fixtures) over a big inheritance tree. Add it only when real duplication appears.
</details>

### 3W.1 When do you need `await`, and when not? 🟡
<details><summary>Answer</summary>

| `await` ✅ (talks to the browser → Promise) | No `await` ❌ (lazy / sync) |
| --- | --- |
| Actions: `click`, `fill`, `goto` | Creating locators: `page.getByTestId('x')` |
| Web-first assertions: `await expect(loc).toHaveText()` | `new LoginPage(page)` |
| **My own async methods**: `await loginPage.goToPage()` | |

One-liner: *locators describe, actions do. Only the doing is awaited.*
</details>

### 3W.2 What goes in a page object, what stays in the test? ✅
<details><summary>Answer</summary>

| Page object | Test |
| --- | --- |
| Locators, actions (`performUserLogin`) | Flow + **assertions** |

Why: SRP. A POM that asserts mixes "how to use the page" with "what is correct", so it can't be reused for negative tests.
</details>

### 3W.3 Test A logs in, test B runs after it in the same file. Is B logged in? ❌ (Day 5: ❌ again, said "context is usually shared")
<details><summary>Answer</summary>

**No.** Every `test()` gets its **own fresh browser context** (no cookies, no storage), even in the same file.

| | Shares state? |
| --- | --- |
| `test.step` blocks inside one test | ✅ yes, same context |
| Two `test()` blocks, same file | ❌ no |
| Two spec files | ❌ no |

Rule: **context per test.** Fix for "log in once": `storageState`.
</details>

### 3W.4 Failure triage: the 3 categories + evidence? 🟡 (Day 5: categories OK, no own examples)
<details><summary>Answer</summary>

Triage = sort a red test into a cause **before** fixing it.

| Category | Example | Evidence |
| --- | --- | --- |
| **Test bug** | Wrong locator, missing `await`, typo (`zpliers`) | Error points at my code |
| **App bug** | Site really broken | Expected ≠ received; wrong API response in Network tab |
| **Environment** | Browser won't launch, site down, locked account | `browserType.launch` error, 5xx, timeouts everywhere |

Interview line: *"First I decide: is it the test, the app, or the environment? Then I fix, or report it."*
</details>

### 3.7 Why use a fixture instead of `new LoginPage(page)` in every test? ⬜
<details><summary>Answer</summary>

1. **No repetition**: setup is written once, and tests just ask for `loginPage`.
2. **Setup + teardown in one place**: code before `use()` runs before the test, code after it runs after the test (even when the test fails).
3. **On demand**: a fixture is created only if the test asks for it.

Name: a *fixture* is the fixed, known starting state a test needs. The term comes from hardware testing, where the device is clamped into a holder.
Interview line: *"Fixtures are Playwright's dependency injection: the test declares what it needs, and the fixture builds it and cleans it up."*
</details>

---

# Part 3: Why we did it (decision log)

Each framework choice as: **problem → solution → why this one.** Interviewers ask "why did you do it like that?", so these are your answers.

| # | Day | Problem | Solution | Why this one (vs the alternative) |
| --- | --- | --- | --- | --- |
| D1 | 1 | Recording split into 3 tests, test 2 not logged in | 1 test + `test.step` | Tests are isolated (context per test); steps keep one context but still read clearly |
| D2 | 1 | Check ran before login finished (race) | `await expect(page).toHaveURL()` | Web-first assertions wait + retry; sleeps are slow and still flaky |
| D3 | 2 | Full URL hardcoded in every test | `baseURL` in config + relative paths | Change environment in one place (dev/stage/prod) |
| D4 | 2 | CSS/`nth` locators break on layout changes | role > label > test id; `testIdAttribute: 'data-test'` | User-facing and stable; the site uses `data-test`, not `data-testid` |
| D5 | 2 | `textContent()` + `toBe` checked only once | `toHaveText` / `toHaveCount` | They retry, the snapshot doesn't |
| D6 | 3 | Password in code → ends up in git | `.env` + dotenv, `.env` in `.gitignore` | Secrets stay local; CI gets them from GitHub Secrets |
| D7 | 3 | Locators copied in every test | Page objects (`LoginPage`, `SearchPage`) | Locator changes once; tests read like steps |
| D8 | 3 | "Should I add a BasePage?" | No | YAGNI, nothing shared yet; composition over inheritance |
| D9 | 3 | Forgot `await` 4× → tests moved on too early | ESLint `no-floating-promises` | A tool catches it every time; memory doesn't |
| D10 | 3 | `new LoginPage(page)` in every test, no shared setup/cleanup | Custom fixtures (`test.extend`) | vs `beforeEach`: see below |
| D11 | 3 | UI login in every test: slow, fragile, account locks | Setup project saves `storageState`; browser projects use `dependencies` + `storageState` | Login once; each test still gets its own fresh context (isolation kept) |
| D12 | 3 | `toHaveURL('/account')` passed even without login (SPA redirects later) | Also assert `page-title` contains "My account"; proved by running with and without storageState | A test must be able to fail; assert content only a logged-in user sees |

### D10 in detail: why fixtures and not `beforeEach`?

```ts
// beforeEach version
let loginPage: LoginPage;                  // shared variable, can be undefined
test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);         // runs for EVERY test, needed or not
});                                        // only works in THIS file
```

| | `beforeEach` | Fixture |
| --- | --- | --- |
| Reuse across files | ❌ copy into every file | ✅ import once |
| Runs when | Always, for every test | Only if the test asks for it |
| Typing | `let` variable, can be undefined | Typed parameter `{ loginPage }` |
| Teardown | Separate `afterEach`, easy to forget | Same function, after `use()` |
| Next step | — | Login once → `storageState` → a fixture can hand over an already logged-in page |

<!-- Questions continued (Day 3) -->

### 3.8 What does `export const test = base.extend(...)` do, and why `test as base`? ⬜
<details><summary>Answer</summary>

`base.extend` returns a **new** `test` = original fixtures + mine. It's stored as `test` (so specs still write `test(...)`) and exported so specs can import it. The original is renamed `base` on import so the names don't clash.
</details>

### 3.9 Why re-export `expect` from the fixtures file? ⬜
<details><summary>Answer</summary>

Convenience + safety: **one import line** (`import { test, expect } from '../fixtures/fixtures'`). If a spec imports `test` from `@playwright/test` by mistake, it gets the original without my fixtures. Later: custom matchers via `expect.extend` live there too.
</details>

### 3.10 What is `use` in a fixture, and who writes its code? ⬜
<details><summary>Answer</summary>

A **callback parameter** that Playwright passes *to* my fixture (I receive it, I don't pass it). Playwright writes its code; I only call it: `await use(value)` = "give this to the test, wait until the test ends". Code before = setup, after = teardown. ≈ Java `Consumer<T>.accept(value)`.
</details>

### 3.11 `baseURL` vs `goto('/auth/login')` vs `toHaveURL('/account')`: what's the difference? ❌
<details><summary>Answer</summary>

| | Meaning |
| --- | --- |
| `baseURL` (config) | Starting address of the site |
| `goto('/auth/login')` | Where I **send** the browser |
| `toHaveURL('/account')` | Checks where the tab **is now** (waits for the redirect) |

Only the **tab** (`page` fixture) has a current URL → `expect(page).toHaveURL(...)`, never `expect(loginPage)`.
</details>

### 3.12 To use `page` in a test that uses my fixtures, do I have to hand it over from my fixture? ❌
<details><summary>Answer</summary>

**No.** `page` is a **built-in** fixture; any test can ask for it: `{ page, loginPage, searchPage }`.
Within one test, `page` is created **once** and shared: my fixtures and the test all get the **same tab**. That's why `expect(page).toHaveURL()` sees the login that `loginPage` did.
</details>

### 3.13 The spec has no `new SearchPage`. Where does `searchPage` come from? 🟡
<details><summary>Answer</summary>

I import **`test`** (not `searchPage`) from my fixtures file. When the test asks for `{ searchPage }` **by name**, Playwright runs my fixture and **injects** the object = dependency injection.
</details>

### 3.14 What happens if a fixture never calls `use()`? 🟡 (Day 5: "value isn't passed", missed "test never starts")
<details><summary>Answer</summary>

`extend` **creates** the fixture; `use()` **hands the value to the test**. Without `use()` the test never receives it → it can't start → Playwright fails it with an error (or a timeout if the fixture hangs).
</details>

### 3.15 What is `storageState`, and why use it? ⬜
<details><summary>Answer</summary>

A JSON snapshot of the context's **cookies + localStorage** (on this site: the JWT). Log in **once** in a setup, save it, and every test's fresh context **starts** from it.
Why: faster, less flaky (the login page breaks only the login test), no account lockouts. Isolation is kept: each test still gets its own context.
The file holds a live token → `playwright/.auth/` goes in `.gitignore`.
</details>

### 3.16 How do you avoid parallel issues with storageState? ⬜
<details><summary>Answer</summary>

1. **Order**: a `setup` project + `dependencies: ['setup']` → setup runs once, the browser projects start only after it.
2. **Shared account**: shared-account tests only **read**; tests that change data (cart, password, logout) get **one account per worker**, or no storageState.
</details>

### 3.17 All tests are green after adding storageState. Does that prove it works? ❌
<details><summary>Answer</summary>

**No.** The tests still logged in through the UI themselves, so they'd pass without it. Proof = a test that **fails without** the feature: go straight to `/account` with no login → passes with storageState, redirected to login without it.
One-liner: *a green test only proves what it actually checks.*
</details>

### 3.18 Why can `goto('/account')` + `toHaveURL('/account')` pass even when NOT logged in? ⬜
<details><summary>Answer</summary>

In a single-page app the URL is `/account` first, then the app's code redirects to `/auth/login` a moment later. `toHaveURL` passes on the **first** match → false positive.
Fix: assert something only a logged-in user sees (the "My account" title). And prove it **both ways**: it must fail without storageState.
</details>

### 3.19 Without storageState the test still "sees" the login. Could the token just last longer? ❌
<details><summary>Answer</summary>

**No.** Without storageState the context starts **empty**: no cookies, no localStorage, no token. Token lifetime only matters if the browser has the token.
The opposite risk is real: an old `user.json` can hold an **expired** token → regenerate it in setup on every run.
</details>

### 3.20 With storageState on for all projects, how do you still test the real login? ⬜
<details><summary>Answer</summary>

Opt that spec out of the saved login: `test.use({ storageState: { cookies: [], origins: [] } });` → the test starts as a brand-new visitor and really exercises the login form. Otherwise it "logs in" on top of an existing login and proves nothing.
</details>

### 4.1 "Mocking is just asserting my own logic." True? 🟡 (good critical question)
<details><summary>Answer</summary>

Partly. The mock is the **input**; the **front end's behaviour** is under test (empty list → "no results", 500 → error banner).
Bad: mocking the happy path and asserting the same data (tautology); mocks drifting from the real API (contract drift).
Good: only edge cases you can't produce on demand + keep real API tests for the contract.
Interview line: *"Mocks test how the UI handles responses I can't produce on demand; real API tests keep the mocks honest."*
</details>

### 4.2 Setup fails: "Account locked, too many failed attempts". Which category, and what's the long-term fix? ⬜
<details><summary>Answer</summary>

**Environment / test data** (code unchanged). Where to look: the page snapshot in `error-context.md` / trace.
Short-term: switch demo user. Long-term: **dedicated test users** (per pipeline/worker, created via API), never shared accounts; avoid repeated failed logins in tests.
</details>

### 4.3 Setup passes, but tests start logged out. What do you check first? ❌ (spent a while on wrong guesses) (Day 5: ❌ again, forgot the moved setup file)
<details><summary>Answer</summary>

**Paths before theories.** Setup writes the file with `path.join(__dirname, ...)` = relative to the **setup file's folder**; the config reads relative to the **project root**. Moving `auth.setup.ts` into `tests/setup/` made it write to `tests/playwright/.auth/` → the tests loaded an **old** file.
Also: `.gitignore` `/playwright/.auth/` (leading `/`) = root only → the new location was **not ignored**. Use `playwright/.auth/`.
</details>

### 4.4 Name a negative login API test. 🟡
<details><summary>Answer</summary>

Wrong credentials → expect **401** and **no `access_token`**.
Catch: use a **non-existent email**, not the real user with a wrong password → failed attempts **lock** the shared account your other tests need.
</details>

### 4.5 Why is a CI report with traces risky on a public repo? ✅
<details><summary>Answer</summary>

Traces store request headers (Bearer token), cookies, localStorage and typed values (passwords from `fill()`); public-repo artifacts can be downloaded.
GitHub masks secrets as `***` **only in log text**, not inside `trace.zip`. Fixes: private repo, short `retention-days`, no trace on the login step.
</details>

## Day 5: mock interview

### 5.1 Walk me through how your framework handles authentication. ✅
<details><summary>Answer</summary>

*"A setup project runs `auth.setup.ts` once: it logs in through the UI and saves cookies and localStorage to a JSON file. The browser projects depend on it and load that file, so every test starts logged in, with its own fresh context. Login tests opt out, and the file is gitignored."*
Say it as two parts: the **setup file** logs in, the **specs** only load the state.
</details>

### 5.2 Tell me about the hardest bug you hit. 🟡 (too vague; said "browsers" = not proven)
<details><summary>Answer</summary>

*"The hardest part was CI. Tests passed locally but failed on GitHub Actions. First, a secret was named `BASE_URL` while the config read `BASEURL`. Env var names are case-sensitive, so I renamed it. Then the UI login timed out only on the runner. API tests passed, so it wasn't the code. Most likely the site's bot protection blocks runner IPs. I split the projects so CI runs the API suite, and the UI suite runs locally until I can confirm it via the trace. Lesson: CI-only failures are usually environment, so check config and evidence before changing tests."*
</details>

### 5.3 What do you automate at UI level vs API level? ✅
<details><summary>Answer</summary>

*"I follow the **test pyramid**. Most checks go at API level: data, business rules, error codes, persistence. They're fast and stable. UI tests cover the critical user flows end to end and what's displayed. Where a UI test needs setup, like login or test data, I do that via API."*
</details>

### 5.4 Setup passes, but tests run logged out. How do you debug it? 🟡 (evidence first ✅; "assert the token" doesn't catch it)
<details><summary>Answer</summary>

*"Setup passing means login works, so the issue is between saving and loading the state. I compare the path setup writes to with the path the config reads, and check that the file is fresh. In my case I'd moved the setup file and `__dirname` sent it to the wrong folder. To catch it next time, tests assert logged-in-only content, so they fail instead of passing silently."*
Command: `npx playwright show-report` (not `show-result`).
</details>

### 5.5 A test is flaky. What do you do? 🟡 ("retries usually work" = trap)
<details><summary>Answer</summary>

*"I reproduce it with `--repeat-each`, then read the trace. Usually it's timing, so I replace fixed waits with web-first assertions on real content, or it's shared test data between parallel tests. Retries are a safety net that flags flaky tests; they're not the fix."*
Can't fix it yet → `test.fixme` + ticket.
</details>

### 5.6 Why Playwright over Selenium? 🟡
<details><summary>Answer</summary>

*"Selenium can do most of it, but Playwright has it built in: auto-waiting, web-first assertions, its own runner, traces, parallel workers and API testing. So I write less plumbing and fewer manual waits, and one API covers Chromium, Firefox and WebKit."*
"Modern, the market wants it" is not a technical reason.
</details>

### 5.7 What is Playwright MCP? 🟡 (wording)
<details><summary>Answer</summary>

MCP = **Model Context Protocol**, an open protocol (by Anthropic) for connecting AI to tools. An **MCP server** exposes tools; the AI makes **tool calls**. The Playwright MCP gives the AI a real browser and reads the **accessibility tree** (small, meaningful, matches `getByRole`).
*"I'd use it to explore and draft tests faster, but I review the output like any PR, and make it fail once on purpose."*
</details>

## Keywords to fix (Day 5)

| I said | Say |
| --- | --- |
| feature (for functionality) | functionality / page |
| perProject, "spec that logs in" | setup project + `dependencies`, setup file |
| performance (for test speed) | test speed / run time |
| await (as the wait) | auto-waiting, web-first assertions |
| locatorStrategy, storageContext | `page.locator()` / `getByRole()`, `storageState` |
| data-set | `data-test` attribute + `getByTestId()` |
| show-result | `show-report` / `show-trace` |
| MCP = API call | protocol; the server exposes tools; the AI makes tool calls |

# Part 4: My project examples (interview stories)

Learn only these 3. Each one: **what happened → how I found it → fix → lesson**.

| # | Story | Category | Use it for |
| --- | --- | --- | --- |
| 1 | **Auth path bug.** I moved `auth.setup.ts` into `tests/setup/`. Setup passed, but tests ran logged out. `__dirname` made it write to `tests/playwright/.auth/`, while the config read `playwright/.auth/` → stale file. Fixed to `../../`. **Lesson:** check paths before theories. | Test bug | debugging, storageState, "hardest bug" |
| 2 | **False positive.** `goto('/account')` + `toHaveURL('/account')` passed even logged out (SPA redirects later). Asserted page content (`page-title` = "My account") and proved it fails without login. **Lesson:** a green test must be able to go red. | Test bug | assertions, flaky/false-positive tests |
| 3 | **CI blocked.** UI login timed out on GitHub runners (likely Cloudflare bot protection); the demo account also got locked from failed logins. Ran the API suite in CI as its own project, UI stays local. **Lesson:** dedicated test users, environment ≠ code bug. | Environment | CI/CD, triage, test data |

## Java / API → Playwright map

| Java / Selenium / RestAssured | Playwright + TS |
| --- | --- |
| `@BeforeEach` / `@AfterEach` | `test.beforeEach` / `test.afterEach`, or a **fixture** (code before/after `use()`) |
| `@BeforeAll` / `@BeforeSuite` | `test.beforeAll`, or a **setup project** (`dependencies`) |
| `WebDriverWait` + `ExpectedConditions` | **Auto-waiting** + web-first assertions (`await expect(loc).toBeVisible()`) |
| `driver.findElement(By.id(...))` | `page.getByRole/getByTestId(...)`: a **lazy locator**, found when used |
| Page Factory `@FindBy` | Locator fields in the POM constructor |
| TestNG `@DataProvider` | A `for` loop over an array that creates `test()`s |
| `pom.xml` | `package.json` (+ lock file) |
| `.properties` file | `.env` + `process.env` (dotenv) |
| Selenium Grid | Built-in **workers** (parallel), sharding in CI |
| RestAssured `given().when().then()` | `request.get/post(...)` + `expect(response.status())` |
| `response.jsonPath().get("x")` | `const { x } = await response.json()` |

Spare one-liners: secret named `BASE_URL` vs `BASEURL` (env var names are case-sensitive); `account-spec.ts` silently skipped (wrong file name pattern).
