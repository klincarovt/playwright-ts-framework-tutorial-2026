# Progress — Claude's mentor log

> **↩ RESUME HERE**
> - **Current:** Day 3/5 · Step 3: custom fixture (`test.extend`). ESLint done; first commit **pushed** to GitHub.
> - **Repo:** `github.com/klincarovt/playwright-ts-framework-tutorial-2026` (remote `origin`, branch `main`). Pushed from **Windows git** (WSL git has no credentials yet → `gh auth login` or the Windows credential helper). Check WSL `git status` for CRLF noise.
> - **CI:** the workflow ran on push and is expected to fail (no `.env` in CI) → GitHub Secrets on Day 4. Ask JoJo what the Actions tab shows.
> - **Watch on Day 3:** re-test isolation (the context-per-test weak spot) when introducing storageState; Claude can't read `.env` (sandbox), so ask JoJo to confirm the variable names instead.
> - **Last session:** 2026-11-16 (Day 3 Steps 0–2, ESLint, git init + first push). Wrap-up done.
> - **Practice backlog:** `docs/me/Practice Cases.md` (5 levels, ~30 cases) for solo work between sessions. JoJo wants repetition to make it stick for interviews. Review his solo cases at the start of sessions; hints at level 1 only.
> - **README.md** created (badges, features, roadmap, structure, how to run). Keep the roadmap ticks honest as days complete.
> - **⚠️ JoJo said "not sure if I'm learning".** Next session: start with a 5-min **no-notes recall** (await rule, POM vs test responsibilities, isolation, failure categories); have him write Step 3 code **before** any skeleton; insist on check questions (he often skips them). Ask what feels off.

Plan: [Interview Plan](../Interview%20Plan.md) · Changelog: [framework-changelog.md](./framework-changelog.md) · JoJo's notes: `docs/me/` (updated only at session wrap-up)

| Day | Goal | Status |
| --- | --- | --- |
| 1 | Setup, codegen login + search, run headed + UI mode | ✅ done (2026-11-12) |
| 2 | Role locators, web-first assertions, `baseURL`, trace viewer | ✅ done (2026-11-15) |
| 3 | 2 page objects + 1 custom fixture, `storageState` | 🟡 in progress |
| 4 | 2 API tests, 1 hybrid, 1 `page.route` mock, GitHub Actions | ⬜ |
| 5 | Story, transfer map, cheat sheet out loud; Playwright MCP | ⬜ |

## Weak spots (all days)
- Tool vs protocol terminology (Playwright vs WebSocket)
- Category words: called Node.js a "library" (it's a **runtime**); "packet" manager (it's a **package** manager); "translated" (it's **transpiled**)
- package.json vs package-lock.json (swapped them; lock file = reproducibility)
- Test isolation: expected state to carry between tests (split one journey into 3 tests); thought context was per spec file → it's per **test**. Re-check on Day 3 (storageState).
- Generic vs web-first assertions (`toBe` on a locator)
- Flakiness answers: thinks retries are a fix (they hide flakiness); "await" ≠ the replacement for sleeps (assertions are)
- Failure triage categories (test / app / environment): taught, not yet recalled
- **`await` on his own async methods**: forgot it 3× on Day 3 → drill
- Takes hint placeholders literally (`process.env._`); exact names matter (`BASEURL` vs `BASE_URL`)
- Direction of dependencies: said "Node uses npm/npx" (npm/npx run *on* Node)

---

## Day 1

### Step log
| Step | Result | Notes |
| --- | --- | --- |
| 0 | ✅ | Node v26.13.1, npm v11.20.0 via nvm (2026-11-12). Check question answered after wording fixes. |
| 1 | ✅ | Layout explained. Got 3–7 right. **Swapped** package.json ↔ lock file (fixed). Check Q (delete lock file): said "won't build"; real answer is version drift. |
| 2 | ✅ | First run failed 6/6 at `browserType.launch` (missing OS libs). Fixed with `npx playwright install-deps`. Re-run: 6 passed (7.1s), 6 workers. `--headed` ✅ 2/2 (chromium). `--ui` exits silently → workaround `--ui-port=8080` works. ✅ Explored steps/Before/After; explained browser→context→page (said "page object" → flagged); called spec files "feature files" (wording). |
| 3 | ✅ | Recorded login+search (`tests/login-search.spec.ts`). Mistakes along the way: no assertions, recording noise, split into 3 tests expecting shared state (isolation gap), race after login click, `toBe` on a locator. Final: 1 test + 3 `test.step`, `toHaveURL` + `toHaveText`. Leftovers for Day 2: full URL in `toHaveURL`, click before fill (l.19), redundant visibility checks (l.23–24). Negative-login spec was deleted. Check Qs answered: `div.nth(3)` ✅; isolation 🟡 → said "different browser", then "context per spec" → corrected to **per test**. |
| 4 | ✅ | UI mode on WSL via `--ui-port`. One flaky run: `toHaveURL` got `/auth/login` (login didn't complete); user looked at the snapshot but didn't name the root cause. Described action list: spec → test, Before/After Hooks + steps. Learned Ctrl+Z vs Ctrl+C (4 paused jobs). |

### Concepts covered (drill on Day 5)
- Node.js = runtime (≈ JVM), npm = package manager (≈ Maven), npx = package runner (part of npm, = `npm exec`)
- nvm for Node versions; LTS in real projects
- CLI flags: `--long` vs `-s` short (`-lts` = `-l -t -s`)
- Browser binaries (`playwright install`) vs OS libs (`install-deps`); CI uses `--with-deps`
- An error at `browserType.launch` = environment problem, not a test bug
- package.json = manifest with ranges (≈ pom.xml); lock file = exact versions of the whole tree, generated, committed; `npm ci` in CI
- node_modules, playwright-report, test-results are gitignored
- Config: `fullyParallel`, `workers`/`retries` switch on `process.env.CI`; `testDir`; `show-report`
- TS is transpiled on the fly by Playwright's runner; no type-check → `npx tsc --noEmit` in CI
- Codegen = actions + locators; human writes assertions; delete recording noise
- Actionability checks: `fill`/`press` auto-wait + focus (no click first)
- Assertions as synchronization (race after login click → `toHaveURL`)
- Generic (`toBe`) vs web-first (`toHaveText`) assertions; locator ≠ text
- Test isolation per context; `test.step` for readable sections inside one test; `await` every step

---

## Day 2

### Step log
| Step | Result | Notes |
| --- | --- | --- |
| 1 | ✅ | `baseURL: process.env.BASE_URL ?? '<practice site>'`; relative `goto`/`toHaveURL`; Day 1 leftovers cleaned. Detours: `node_modules/.bin` empty (npm install ran during MCP setup?) → fixed with `npm ci`; removed the Sign-in click → 30s timeout on `email` (diagnosed from the error); account locked after repeated failures → switched to customer2. Still uses `goto('/account')` (redirect trick) instead of `/auth/login`. Gap fills taken literally (`process.env._`, `process.env_`). Ran with `BASEURL=` (no underscore) → silently used the fallback. |

| 2 | ✅ | `testIdAttribute: 'data-test'`; getByLabel (email), getByTestId (password, search), getByRole (Login). Now `goto('/auth/login')` directly. Kept `process.env.BASEURL` (not BASE_URL). Step 1 "open the shop" is now redundant (left as is). Check Q (role vs test id) **not answered**: gave the model answer → drill on Day 5. Didn't paste the run result. |

| 3 | ✅ | Added result checks via chaining (`search_completed` → `product-name`). Spotted on his own that `/^product-/` also matches inner elements (good). Errors: `.count` without `()`, `count()` not awaited inside `expect` → "Received: Promise {}". Explained await inside (generic) vs outside (web-first). Check Q (A `textContent()`+`toBe` vs B `toHaveText`) answered by Claude → drill on Day 5. |

| 4 | ✅ | Broke test (`zpliers`), ran `--trace on`, opened via `show-report`. Read the error (expected/received; noticed nothing until shown the "14 ×" retries). Explored Network tab on his own: search API 200/145ms. Root cause stated with a template ("test bug"). Pasted a live JWT → taught that traces contain secrets. |

| 5 | ✅ | Interview answers. Q1: said "Playwright WebSocket" (tool vs protocol again!), framed async vs blocking as the reason; then got auto-wait, retries (14×), fresh context; said "await instead of sleep" (corrected → assert on the expected state). Q2: CI artifact → HTML report ✅, failed filter ✅; vague on trace panels; forgot the 3 failure categories; said he'd **add retries** (corrected: never hide flakiness). Model answers given. |

### Concepts covered
- Trace viewer: `--trace on` locally, `on-first-retry` in CI; open via HTML report on WSL
- Failure triage: test bug / app bug / environment; evidence = expected vs received, snapshot, network
- Bearer token (JWT) in API calls → storageState (Day 3), API auth (Day 4); traces/reports contain secrets
- Web-first (await outside, retries) vs generic on a browser value (await inside, single snapshot); `count()` is a snapshot → wait first
- Locator chaining (scope to a container); regex test IDs; avoid CSS classes
- Locator priority: role > label > test id > CSS; trade-off role (user-facing) vs test id (stable with translations/duplicates)
- `baseURL` + relative paths; leading `/` = from domain root
- Env var + `??` fallback (≈ Maven profile property); `.env` + dotenv later (Day 3), GitHub Secrets in CI
- Why `await`: every action is a browser round trip → Promise; Java is blocking, JS isn't. Locators are lazy (no await)
- Dynamic waits = web-first assertions (`toHaveURL`), not sleeps / `waitForNavigation`
- `npm ci` to repair `node_modules`
- Shared test accounts get locked → dedicated users, `storageState`, API-created users

---

## Day 3

### Step log
| Step | Result | Notes |
| --- | --- | --- |
| 0 | ✅ | Installed git (called it "github" twice → flagged git vs GitHub), `git init`, `init.defaultBranch main` + `git branch -m main`. `.env` (BASEURL, USER_EMAIL, USER_PASSWORD) + dotenv (uncommented config lines 7–9; first pasted the `webServer` block by mistake) + `.env` in `.gitignore`. Run: 1 passed, "injected env (3)/(0)" = main vs worker process. `git status` clean of `.env`/node_modules. Check Q: said ordering doesn't matter as long as it isn't committed (correct) → added history/rotation nuance. |
| 1 | ✅ | `pages/LoginPage.ts`: readonly locator fields, `goToPage()`, `performUserLogin(email, password)`. Iterations: `goto` in the constructor, `import { process } from 'dotenv'`, not exported, env read inside the POM, generic `clickButton(name)`, duplicate `private page` field + param property; **missing `await` on his own async methods 3× (in POM and test)**; `new LoginPage()` without page; stray `await expect`. Asked good design Qs: BasePage? (→ no, YAGNI/composition), locator fields needed?, assertions in tests? (yes). Run: 1 passed. Pressed Ctrl+Z again (paused job). |
| 2 | ✅ | `pages/SearchPage.ts`: fields navigateHome, searchInput, searchTerm, searchCompleted, productNames (chained from the field); `goToHomePage()`, `searchProductByName()`. Missed `await` in the test again (4th time) → said awaits are annoying → agreed to set up ESLint `no-floating-promises`. Mixed up locator vs expect placement (fixed: getBy… in POM, expect in test). Bugs: test id `productName` vs `product-name`; missing closing `});`. Keeps commented-out old code "to see the journey" → suggested commits + remove before the Day 4 push. Run: 1 passed. |

### Concepts covered
- `.env` + dotenv; `.env.example`; secrets in history → rotate; GitHub Secrets in CI
- git vs GitHub; `init.defaultBranch`; branch exists only after the first commit
- `webServer` config = start your own app (not needed for a remote site)
- POM in TS: parameter properties, readonly locator fields, lazy locators in the constructor, no async constructor; assertions in tests; no BasePage (YAGNI, composition)
- `process.env.X` is `string | undefined` → `!` (quick) vs guard (fail fast)
