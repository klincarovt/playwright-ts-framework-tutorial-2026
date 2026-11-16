# Day 2 - Progress

**Goal:** Rewrite the recording properly: `baseURL` in config, role-based locators, web-first assertions. Debug one failure in the trace viewer.
**Then I can say:** "I know why Playwright is less flaky, and how I debug."

## Steps
- [x] 1. `baseURL` in config; relative URLs in tests; clean up the Day 1 leftovers
- [x] 2. Locators: `getByRole` / `getByLabel` / `getByTestId` instead of raw CSS
- [x] 3. Web-first assertions: pick the right matcher for each check
- [x] 4. Break the test on purpose and debug it in the trace viewer
- [x] 5. Explain: why is Playwright less flaky? How do I debug a failure?

---

## 📘 Learn notes

### Locators: which one to use
| Priority | Locator | Finds by | Example |
| --- | --- | --- | --- |
| 1 | `getByRole` | What the user sees: role + name | `getByRole('button', { name: 'Login' })` |
| 2 | `getByLabel` | A form field's label | `getByLabel('Email address')` |
| 3 | `getByTestId` | A test attribute | `getByTestId('email')` |
| last | `locator('css')` | Raw CSS | `locator('[data-test="email"]')` |

- **Role / label** = tests what the user sees. Survives HTML changes, catches accessibility bugs (a button losing its label fails the test).
- **Test ID** = better when the text changes often or isn't unique: translations, marketing copy, ten identical "Delete" buttons. A stable contract with developers.
- **Never** position-based CSS (`div.nth(3)`) or XPath.
- This site uses `data-test`, not the default `data-testid` → config: `testIdAttribute: 'data-test'`.
- Codegen picks test IDs first when they exist. That's not wrong.
- `getByLabel('email')` matches case-insensitively on part of the text. Use `{ exact: true }` for strict.

> **Interview:** "Role and label first because they test what the user sees; test IDs when the text is unstable or ambiguous. Never position-based CSS or XPath."

### baseURL + environments
```ts
baseURL: process.env.BASEURL ?? 'https://practicesoftwaretesting.com',
```
- `process.env.X` = one environment variable (like a Java `Map` lookup). `??` = "or else" (only when undefined/null).
- Run another env: `BASEURL=https://staging... npx playwright test`. The name must match **exactly**.
- `goto('/auth/login')` → baseURL + path. A leading `/` = from the domain root.
- Later: a `.env` file + `dotenv` (gitignored); in CI → GitHub Secrets.

### Why await?
- Every action = a round trip to the browser → returns a **Promise** → `await` waits for it. Java is blocking, JS isn't.
- **Locators are lazy** → no await. **Actions + assertions** → await.

| | Pass to `expect` | `await` goes |
| --- | --- | --- |
| Web-first (`toBeVisible`, `toHaveText`) | a **locator**: it retries | **outside**: `await expect(locator).toHaveText('x')` |
| Generic (`toBe`, `toBeGreaterThan`) | a **value**: checks once | **inside**: `expect(await locator.count()).toBeGreaterThan(1)` |

- `Received: Promise {}` → you forgot `await` inside. `Received: [Function]` → you forgot the `()`.

### Assertions
| Check | Matcher |
| --- | --- |
| Shown | `toBeVisible()` |
| Exact / contains text | `toHaveText()` / `toContainText()` |
| Number of elements | `toHaveCount(n)` |
| URL / title | `toHaveURL()` / `toHaveTitle()` |
| Opposite | `.not.toBeVisible()` |

- "At least one": `await expect(items.first()).toBeVisible()`. `count()` is a single snapshot, so wait first.
- **Chaining:** `page.getByTestId('search_completed').getByTestId('product-name')` searches *inside* the parent.
- Regex: `/^product-/` = starts with. But it also matched inner elements (`product-name`), so be precise.

### Debugging a failure (trace viewer)
- Record: `npx playwright test --trace on`. Open on WSL: `npx playwright show-report` → test → Trace.
- Look at: **error** (expected vs received), **snapshot** (what the page showed), **Network** (API status/time).
- "14 × locator resolved… unexpected value" = the assertion **retried** for 5s.
- Classify: **test bug** (zpliers) / **app bug** / **environment** (OS libs, locked account).
- ⚠️ Traces contain tokens and passwords → keep CI artifacts private.

### Other gotchas
- `npx playwright` "not found" → `node_modules/.bin` broken → `npm ci`.
- Repeated failed logins → **account locked**. Real fix: dedicated users, `storageState`, API-created users.
- UI mode: save the spec → ▶ again (or 👁 watch). Config change → restart UI mode.

### Interview answers
> **Why less flaky?** "Playwright builds the waiting in: actions auto-wait for the element to be visible, stable and enabled; web-first assertions retry (I saw `toHaveText` re-check 14 times); each test gets a fresh browser context. Instead of sleeps, I assert on the state I'm waiting for. In Selenium you add explicit waits yourself."

> **Debug a CI failure?** "Download the trace from the CI artifacts, open it in the trace viewer, check the error, the DOM snapshots and the network. Classify it: test bug, app bug or environment. Fix the root cause. Never add sleeps or retries to hide it; a pass on retry means flaky."

## "I can now say…"
- "I know why Playwright is less flaky, and how I debug a failure with the trace viewer."

## My notes
-

## Questions
-
