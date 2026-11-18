# Day 4 - Progress

**Goal:** Cover API and CI: API tests with `request`, a hybrid test, a network mock, and a GitHub Actions run.
**Then I can say:** "I cover UI, API and CI."

## Steps
- [x] 1. API test #1: `request` fixture, GET products → check status, results
- [x] 2. API test #2: POST login → get a token
- [ ] 3. API client layer (`ProductsApi` class + fixture): *skipped for now, optional*
- [x] 4. Hybrid test: log in via the API → token into the browser → check `/account` in the UI
- [x] 5. Mock the backend with `page.route`: fake an empty search result, check the UI shows no products
- [ ] 6. GitHub Actions with secrets: *runs, but red: setup can't see the login form on GitHub's servers (likely Cloudflare). Check the trace next.*

## Before you start
- The practice site has a REST API at `api.practicesoftwaretesting.com`. You saw `/products/search` and the Bearer token in the Day 2 trace.
- Java link: `request` fixture ≈ REST Assured; `page.route` ≈ WireMock, but inside the browser.

---

## 📘 Learn notes

### 3 kinds of tests I wrote today
```
API test:     test → request ───────────────────► API          (fast, no browser)
Hybrid test:  request → API (login)  +  page → UI (check)       (fast setup, real UI check)
Mock test:    page → UI → API call ──► page.route answers with fake JSON
```

| Test | File | Tool | What it proves |
| --- | --- | --- | --- |
| Product search API | `tests/api/products.spec.ts` | `request.get` | Search returns 200 + results |
| Login API | `tests/api/products.spec.ts` | `request.post` | Correct login returns a token |
| Hybrid | `tests/hybrid/hybrid.spec.ts` | `request` + `page.addInitScript` | A token from the API logs the UI in |
| Mock | `tests/mock/mock.spec.ts` | `page.route` + `route.fulfill` | Empty result → UI shows no products |

### API test in 4 lines
```ts
const response = await request.get(`${API}/products/search?q=pliers`);
expect(response.status()).toBe(200);
const body = await response.json();
expect(body.data.length).toBeGreaterThan(0);
```
- GET = read, POST = send data (`data: { ... }` = JSON body)
- `toBe` is fine here: the status is already a value, not a locator

### Hybrid: key line
```ts
await page.addInitScript((token) => {
  window.localStorage.setItem('auth-token', token);
}, access_token);
```
Runs in the browser **before** the app's own code → the app starts already logged in.

### Mocks: when they're worth it
| ✅ Good | ❌ Bad |
| --- | --- |
| Edge cases you can't produce on demand: empty list, 500 error, slow API | Mock the happy path and assert the same data (tests nothing) |
| Checking the UI's **reaction** | Mocks that drift from the real API (contract drift) |

Server resilience (outages, load) = load/chaos testing, not mocks. Never "test" by breaking a shared or public server.

### GitHub Actions
```
push → GitHub runner (fresh Linux) → npm ci → install browsers → npx playwright test → upload report
```
| Laptop | CI |
| --- | --- |
| `.env` file | GitHub Secrets (mine: Environment `.env` → `environment: .env` in the job) |

- `env:` on the step passes the secrets: `USER_EMAIL: ${{ secrets.USER_EMAIL }}`
- YAML: indentation matters (spaces, no tabs)
- `??` falls back only on `undefined`/`null`, **not** on an empty string `''`

### Things that went wrong (and what they were)
| Problem | Category | Fix |
| --- | --- | --- |
| "Invalid email or password" in setup | Environment | Went away by itself (shared demo site) |
| "Account locked, too many failed attempts" | Environment / test data | Switched demo user → real fix: dedicated test users |
| Mock test timed out on `nav-home` | Test bug | The test started on a blank page → `page.goto('')` first |
| Same output pasted again | Me 🙂 | Save (Ctrl+S) + check which terminal |
| Mock: `Received: 9` products | Test bug (race) | Typed before the page was ready → wait for `search-term` first |
| `account.spec` lands on Login, setup passes | Test bug (path) | Moved setup to `tests/setup/` → `../` wrote the file to the wrong folder → `../../` |
| CI: `waiting for getByTestId('email')` ×3 retries | Environment | Same on every retry = not flaky. Probably Cloudflare bot check on GitHub's servers (check the trace) |

### Paths: `__dirname` vs root
```
path.join(__dirname, '../../playwright/.auth/user.json')
tests/setup/ → ../ → tests/ → ../ → <root>/playwright/.auth/user.json ✅
```
- `__dirname` = the folder of **this file** → moving the file changes the result
- Config paths (`storageState: 'playwright/...'`) = from the **project root**

### .gitignore: leading `/`
| Line | Matches |
| --- | --- |
| `/playwright/.auth/` | Only at the root |
| `playwright/.auth/` | In any folder ✅ |

### Why `user.json` never goes to git
- It holds a live **login token** = logged in as that user (site public ≠ account public)
- CI doesn't need it: `setupUser` creates it fresh on every run
- Deleting it locally is safe: the next test run regenerates it; `git pull` never touches ignored files

## "I can now say…"
- "I test business logic through the API with Playwright's `request` fixture: fast, no browser."
- "Hybrid tests set up state through the API and check only the user-facing part in the UI."
- "I mock with `page.route` only for UI edge cases, and keep real API tests so mocks don't drift."
- "CI runs on every push in GitHub Actions; credentials come from GitHub Secrets, never from the repo."

## My notes
- Mocks felt like "asserting my own logic". The answer: the mock is the input, the UI's handling is what's tested.

## Open todos
- CI: open the trace from the downloaded report (`ci-report/`) → what page does the runner get?
- `mock.spec.ts`: add `await expect(searchPage.searchTerm).toHaveText('pliers');` before `toHaveCount(0)`
- `hybrid.spec.ts`: add `test.use({ storageState: { cookies: [], origins: [] } })` so it really proves the API login
- `playwright.yml`: delete the unused `BASE_URL` line · `.env`: `BaseURL` → `BASEURL`
- Delete `example.spec.ts` and the old `login-search.spec.ts`; remove `console.log` in the API spec
- Check questions: a negative login API test? Why are traces in a public CI artifact risky?
