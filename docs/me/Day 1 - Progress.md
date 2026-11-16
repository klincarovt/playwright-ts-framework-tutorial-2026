# Day 1 - Progress

**Goal:** Install Playwright, codegen a login + search journey, run it headed and in UI mode.
**Then I can say:** "I set it up from scratch and know the project layout."

## Steps
- [x] 0. Node.js + npm installed in WSL (nvm, LTS)
- [x] 1. `npm init playwright@latest`; explain the project layout
- [x] 2. Run the example test (headless, `--headed`, `--ui`)
- [x] 3. Codegen a login + search journey and save it as a spec
- [x] 4. Run the recorded test headed + in UI mode; explain what you see

---

## 📘 Learn notes (come back here)

### Node.js, npm, npx
| Tool | What it is | Java equivalent |
| --- | --- | --- |
| Node.js | **Runtime**: executes JavaScript | JVM |
| npm | **Package manager**: installs dependencies | Maven |
| npx | **Package runner**: runs a package's CLI (`npx playwright test`) | — |

- npm and npx ship *with* Node and run *on* Node.
- TypeScript is **transpiled** to JS by Playwright on the fly. It does **not** type-check → `npx tsc --noEmit`.

### Project layout
| File / folder | Purpose | Commit? |
| --- | --- | --- |
| `package.json` | Manifest **you** edit: scripts + dependency **ranges** (`^1.65.0`) | ✅ |
| `package-lock.json` | Generated: **exact** versions of every dependency | ✅ |
| `node_modules/` | The installed packages | ❌ |
| `playwright.config.ts` | Test dir, projects (browsers), workers, retries, reporter | ✅ |
| `tests/*.spec.ts` | Spec (test) files | ✅ |
| `.github/workflows/playwright.yml` | CI pipeline (GitHub Actions) | ✅ |
| `playwright-report/`, `test-results/` | Run output: HTML report, traces | ❌ |

- No lock file → `npm install` picks newer versions → **version drift** ("works on my machine"). CI uses `npm ci`.

### Browser → Context → Page
```
Worker (a separate process)
└── Browser          ← launched once, reused by all tests in this worker (slow to start)
    ├── Context A    ← test 1: fresh cookies and storage (cheap)
    │   └── Page     ← the `page` fixture = one tab
    └── Context B    ← test 2: fresh again, nothing shared with test 1
        └── Page
```
- Say **"page"**, not "page object" (Page Object = the POM pattern, Day 3).
- Tests are grouped by spec file + `test.describe`, but each test is **independent**. Shared login = `storageState` (Day 3).

### Anatomy of a test
```ts
test('has title', async ({ page }) => {          // test + async arrow fn + page fixture
  await page.goto('https://playwright.dev/');    // await EVERY Playwright call
  await expect(page).toHaveTitle(/Playwright/);  // web-first assertion: auto-retries; /regex/ = contains
});
```

### Running tests
| Command | What it does |
| --- | --- |
| `npx playwright test` | All tests, headless, all browsers |
| `npx playwright test --headed --project=chromium` | Visible browser, Chromium only |
| `npx playwright test --ui-port=8080` | UI mode in the browser (use this on WSL) |
| `npx playwright show-report` | Open the HTML report (`Ctrl+C` to stop) |

### UI mode
```
┌───────────────┬────────────────────────────────────────────┐
│ TESTS         │  [ Action | Before | After ]   ← tabs      │
│ ▸ example...  │                                            │
│   ▶ has title │        snapshot of the page                │
│               │        at the selected step                │
├───────────────┤                                            │
│ ACTIONS       │                                            │
│  page.goto    │ ← click these                              │
│  expect...    │                                            │
│               ├────────────────────────────────────────────┤
│               │ Source | Log | Console | Network | ...     │
└───────────────┴────────────────────────────────────────────┘
```
- **Step** = one Playwright action or assertion (`page.goto`, `expect…`).
- 🎯 locator picker: hover an element in the snapshot to get a suggested locator.
- Every **step** (action or assertion) is recorded as a **DOM snapshot**, not a screenshot. You can inspect it.
- **Before** = page right before the step, **After** = right after.
- Better than a failure screenshot: you see **every step leading up** to the failure, so you find the *cause*, not just the end state.

### Codegen → real test
- Codegen records **actions + locators**. **You** write the assertions (the test's intent).
- After recording, **delete the noise**: exploring clicks, double-clicks, a `click()` before `fill()`, duplicate submits.
- `fill()` / `press()` auto-wait and focus by themselves, so no click is needed first (**actionability checks**).
- Bad locator: `locator('div').nth(3)`, because position-based locators break on any layout change. Prefer role, then `data-test`.
- Hardcoded DB IDs (`product-01M76…`) break when data is reset.

### Assertions = checks AND waits
- Click Login, then immediately click Home → **race condition**: the login never finished.
- Fix: assert right after login → `await expect(page).toHaveURL(/account/)`. It retries until true, so it **synchronizes** without sleeps.

| Generic (once, plain values) | Web-first (retries, locators/page) |
| --- | --- |
| `toBe`, `toEqual`, `toContain` | `toHaveText`, `toContainText`, `toBeVisible`, `toHaveURL` |

- `expect(locator).toBe('pliers')` ❌: a locator is *how to find* an element, not its text → use `toHaveText`.

### One test, many steps
- Each `test()` = fresh context → tests can't share pages or login. Splitting a journey into 3 tests = 3 blank pages.
- For readable sections, use **`await test.step('name', async () => {...})`** inside ONE test. Steps show up in UI mode and reports.
- `await` every `test.step` (and every Playwright call), or the steps race and the test ends early.

### Isolation, once more
- Context is per **test**, not per spec file. A new `test()` = blank page, even in the same file.
- **Order** is configurable (`fullyParallel`); **isolation** is always on.
- Like a fresh WebDriver session per `@Test`, but cheap: the browser stays and only the context is new.

### Action list in UI mode
```
▸ Before Hooks         ← fixtures set up: browser, context, page
▸ open the shop        ← your test.step (expand → goto)
▸ log in               ← expand → fill, click, toHaveURL
▸ search for pliers    ← expand → fill, press, toHaveText
▸ After Hooks          ← fixtures torn down (context closed)
```
- `test.step` turns a flat list into **named groups**, so a failure reads "failed in *log in*" in UI mode, the report and the CI trace.

### Debugging a failure
- `toHaveURL` failed: expected `/account`, received `/auth/login` → login didn't succeed.
- Same code passed before → something outside the code changed (flaky). Investigate: After snapshot, form error, Network status code.

### Gotchas I hit
- `Ctrl+Z` **pauses** a program (it keeps its port!), `Ctrl+C` **stops** it. `jobs` lists paused jobs, `kill %1` kills one.
- `-lts` ≠ `--lts`: one dash = short single-letter flags.
- Tests failed at `browserType.launch` → missing OS libraries, not a test bug → `npx playwright install-deps`.

---

## My notes
-

## Questions
-

## "I can now say…"
-
