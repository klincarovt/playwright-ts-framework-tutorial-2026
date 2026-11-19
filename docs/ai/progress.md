# Progress — Claude's mentor log

> **↩ RESUME HERE**
> - **All 5 days done (2026-11-19).** JoJo comes back for discussions + improvement. Start from `docs/me/Day 5 - Progress.md` → "Where to improve" (priority: 3 stories out loud, keywords, ❌ fundamentals, answer shape, hands-on tasks). Optional: repo walkthrough, Playwright MCP hands-on.
> - **NEXT SESSION FIRST (JoJo, 2026-11-19): Playwright MCP hands-on** (the only unticked README roadmap item). Claude explores the Toolshop site via the MCP browser and drafts a test → JoJo reviews it like a PR (reasoning first, keywords flagged), makes it fail once on purpose, then ticks the roadmap. Blocker from before: MCP's Chrome isn't installed → JoJo runs `npx playwright install chrome` first.
> - **JoJo's next plan (2026-11-19):** watch the 6h "Playwright Automation Testing With TypeScript" full course (1.5×, skim what we built, slow down on gaps: describe/hooks, tags/`--grep`, frames, tabs, dialogs, upload, `waitForResponse`, `toHaveScreenshot`, reporters, per-env config), then a **solo project on a different site** (saucedemo / automationexercise) rebuilt from memory + 2–3 course topics. He brings it back for a PR-style review → it becomes his 2nd interview story.
> - **Grading rule (JoJo, Day 5):** mark the **reasoning**; flag wrong keywords first (still wanted); missed specifics = notes, not the mark. Ask before changing Revision.md marks after a dispute.
> - **Revision.md marks pending:** recall Qs re-graded on reasoning in chat (3W.3 ✅, 3W.4 ✅, 3.14 ✅, 4.3 🟡) but the file still shows the earlier marks; JoJo didn't confirm the change.
> - **PDF:** `docs/revision-pdf.js` (Claude wrote it on request) → JoJo runs `node docs/revision-pdf.js` → `docs/me/Revision.pdf`. ✅ Works (2026-11-19), lint clean. Open: commit vs gitignore the PDF (JoJo decides); emoji rendering unchecked.
> - **(old) Next session plan (2026-11-18):** start with recall of the ❌ questions, then Day 5. Done.
> - **(old) Current:** Day 5/5 next (story, transfer map, cheat sheet out loud, Playwright MCP, short mock interview). Day 4 closed after JoJo added an `apiTest` project (his idea) + CI `--project=apiTest --no-deps`. CI green ✅ (2 passed). Claude applied (on request) gitignore `playwright/.auth/`, hybrid `test.use`, mock `searchTerm` wait, `testIgnore: /api\//` on chromium/webkit; JoJo to run `git rm --cached playwright/.auth/user.json` + full local run. Old notes below:
> - **(old) Day 4/5 · Step 5 (GitHub Actions).** Local suite fixed (auth path bug). **CI still red**: setup times out on `getByTestId('email')` on all retries → likely **Cloudflare bot check** for GitHub runners (`cf_clearance` cookie seen in user.json). Not yet confirmed: JoJo was downloading the CI report artifact (got `.zip.part`) to look at the trace. Next: confirm via trace → decide (accept + document, or skip UI in CI and run API tests only). Then Day 5.
> - **JoJo's decision (2026-11-18):** keeps `playwright/.auth/user.json` committed (removed the line from `.gitignore`; "will leave empty later and add to gitignore"). Warned once; don't re-argue, just remind at Day 5 cleanup. CI now runs `tests/api --project=chromium --no-deps`; API spec has `test.use` empty storageState. Local full suite: 15 passed.
> - **Fixed 2026-11-18 afternoon:** moving `auth.setup.ts` to `tests/setup/` made `path.join(__dirname,'../…')` write to `tests/playwright/.auth/` → tests loaded a stale root user.json → `account.spec` landed on Login. Fix `../../`; `.gitignore` → `playwright/.auth/` (unanchored) + `ci-report/`. Claude chased 2 wrong hypotheses first (account clash, setup false positive) → check paths/files first next time. Mock spec race (typed before page ready → 9 home products) → suggested `searchTerm` toHaveText before count (not confirmed).
> - **Open items (before/after the push):** `hybrid.spec.ts` has **no `test.use` empty storageState** (passes possibly via config login; told him 3×, dropped it); `playwright.yml` line `BASE_URL` = dead (config reads `BASEURL`); `.env` has `BaseURL` (mismatch, works via fallback); delete `example.spec.ts` + old `login-search.spec.ts`; remove `console.log(response)` in `tests/api/products.spec.ts`; firefox project commented out in config; `goToHomePage()` still clicks `nav-home` (mock spec works around it with `goto('')`). Unanswered check Qs: negative login API test; traces in a public CI artifact = secrets.
> - **Repo:** `github.com/klincarovt/playwright-ts-framework-tutorial-2026` (remote `origin`, branch `main`). CI secrets live in a GitHub **Environment named `.env`** → workflow has `environment: .env`.
> - **Re-ask unannounced:** recall Q3 (isolation) + Q4 (triage). Log every Q/term/decision in `docs/me/Revision.md` right away. JoJo said "you're wasting my time a bit" → keep it tight; he often pastes old output / forgets to save → check the file on disk first.
> - **Last session:** 2026-11-17/18 (Day 3 Steps 3–4, Day 4 Steps 1–5).
> - **Plan (JoJo has other interview prep too):** focus only on plan **Days 3–5**. Mini solo project + extra mock days dropped; practice cases optional (a few, if time). Keep sessions efficient: fewer detours, less tooling. Fold a short mock-interview round into Day 5.
> - **Practice backlog:** `docs/me/Practice Cases.md` (5 levels, ~30 cases) for solo work between sessions. JoJo wants repetition to make it stick for interviews. Review his solo cases at the start of sessions; hints at level 1 only.
> - **README.md** created (badges, features, roadmap, structure, how to run). Keep the roadmap ticks honest as days complete.
> - **⚠️ JoJo said "not sure if I'm learning".** Next session: start with a 5-min **no-notes recall** (await rule, POM vs test responsibilities, isolation, failure categories); have him write Step 3 code **before** any skeleton; insist on check questions (he often skips them). Ask what feels off.

Plan: [Interview Plan](../Interview%20Plan.md) · Changelog: [framework-changelog.md](./framework-changelog.md) · JoJo's notes: `docs/me/` (updated only at session wrap-up)

| Day | Goal | Status |
| --- | --- | --- |
| 1 | Setup, codegen login + search, run headed + UI mode | ✅ done (2026-11-12) |
| 2 | Role locators, web-first assertions, `baseURL`, trace viewer | ✅ done (2026-11-15) |
| 3 | 2 page objects + 1 custom fixture, `storageState` | ✅ done (2026-11-18) |
| 4 | 2 API tests, 1 hybrid, 1 `page.route` mock, GitHub Actions | ✅ done (2026-11-18), CI green (`apiTest`, 2 passed) |
| 5 | Story, transfer map, cheat sheet out loud; Playwright MCP | ✅ done (2026-11-19), MCP concept only |

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
| 3 | ✅ | (2026-11-17/18) Warm-up recall: Q2 POM ✅, Q1 await 🟡 (thought locators need await), Q3 isolation ❌ (again: test vs step), Q4 triage ❌. Created `docs/me/Revision.md` (definitions + questions + decision log) on request. Asked for why/name explanations + videos. `fixtures/fixtures.ts` done with BLANK hints (backticks in import, `extend(a, b ()=>{})` shape, empty `use()`). New spec `login-search-fixtures.spec.ts`: stray `log` auto-import; commented out `expect(loginPage).toHaveURL` → confused baseURL vs current URL; thought he must "return page from the fixture" (built-in, shared per test); missing closing `});` again. Run: passed. Check Qs (where does searchPage come from, no `use()`) skipped again. |
| 4 | ✅ | storageState. Said he'd never seen it ("can't write from nothing") → switched to snippets with blanks for new APIs. `auth.setup.ts` (used `path.join(__dirname…)` from docs), setup project `setupUser` + `dependencies` + `storageState` on all 3 browsers, `/playwright/.auth/` gitignored. Config had `BaseURL` (case) → fixed to `BASEURL`. `account.spec.ts`: named `account-spec.ts` first (never runs); used `loginPage.goToPage()` → failed (read Expected/Received ✅). Then `goto('/account')` + `toHaveURL` passed **without** storageState (SPA redirects later → false positive). Hypotheses: "token lasts longer" (no: context empty), "/account reachable anyway" (no). Added `page-title` contains "My account" → fails without, passes with ✅. Asked Claude to do the title renames. Pushed (incl. auth.setup.ts; not user.json). |
| 2 | ✅ | `pages/SearchPage.ts`: fields navigateHome, searchInput, searchTerm, searchCompleted, productNames (chained from the field); `goToHomePage()`, `searchProductByName()`. Missed `await` in the test again (4th time) → said awaits are annoying → agreed to set up ESLint `no-floating-promises`. Mixed up locator vs expect placement (fixed: getBy… in POM, expect in test). Bugs: test id `productName` vs `product-name`; missing closing `});`. Keeps commented-out old code "to see the journey" → suggested commits + remove before the Day 4 push. Run: 1 passed. |

### Concepts covered
- `.env` + dotenv; `.env.example`; secrets in history → rotate; GitHub Secrets in CI
- git vs GitHub; `init.defaultBranch`; branch exists only after the first commit
- `webServer` config = start your own app (not needed for a remote site)
- POM in TS: parameter properties, readonly locator fields, lazy locators in the constructor, no async constructor; assertions in tests; no BasePage (YAGNI, composition)
- `process.env.X` is `string | undefined` → `!` (quick) vs guard (fail fast)

---

## Day 4

### Step log
| Step | Result | Notes |
| --- | --- | --- |
| 1 | ✅ | `tests/api/products.spec.ts`: GET `/products/search?q=pliers`, status 200, `data.length`. Used `console.log(response)` to explore headers (good). Off-by-one `> 1` vs "at least one" → he questioned it (correct). Noticed: API test runs once per browser (wasted). |
| 2 | ✅ | POST `/users/login` → `access_token` truthy. Setup failed in between: "Invalid email or password" (env, went away), later "Account locked" → switched demo user. Read the snapshot via error-context. `.env` has `BaseURL` (case mismatch, 3rd time). Negative-test check Q skipped. |
| 3 | ✅ | `tests/hybrid/hybrid.spec.ts`: `request.fetch` POST login → `addInitScript` sets localStorage `auth-token` → `/account` title. Missing `);` once. Several runs with stale/unsaved file and identical pasted output. **Never added `test.use` empty storageState** → result not proven. Firefox project commented out. |
| 4 | ✅ | Pushed back: "mock is stupid, asserting my own logic" → discussed (mock = input, UI reaction under test; tautology + contract drift risks; load/chaos tests for server resilience). `tests/mock/mock.spec.ts`: `page.route` → `{ data: [] }` → `toHaveCount(0)`. Timeout because the test started on a blank page (`goToHomePage` clicks a nav link; my snippet's fault) → he fixed it with `page.goto('')` in the spec. Proof runs skipped. |
| 5 | 🟡 | Secrets: first one secret/Environment named `.env` → GitHub **Environment** (renamed to `env`) with `USER_EMAIL`/`USER_PASSWORD` + `environment: env` in the job. Fixed empty `${{}}`. CI run: setup `fill(email)` timeout ×3 (retries) → environment (likely Cloudflare). Locally: account.spec failing → root cause auth path after moving setup (see resume). Pushed back on "token in git" ("public page", "CI needs it") → explained account ≠ site, CI regenerates it. Cleared the token himself, then deleted the stray folder. |

### Concepts covered
- `request` fixture (≈ REST Assured), GET/POST, `data` JSON body, `response.status()/json()`, destructuring
- Hybrid: API for setup, UI for the check; `page.addInitScript` runs before the app's scripts
- `page.route` + `route.fulfill`; when mocks are useful vs tautologies; contract drift
- Shared demo accounts lock → dedicated test users
- GitHub Actions workflow, runner, repository secrets vs environment secrets, `env:` per step, `??` doesn't catch `''`

---

## Day 5

### Step log
| Step | Result | Notes |
| --- | --- | --- |
| Recall | 🟡 | Disputed Q1 marks ("steps share, tests don't" was right) → new rule: grade reasoning, flag keywords, specifics as notes. Forgot the auth path bug details. |
| Story | 🟡 | Timeline-style intro; mock described as "server down" (it's empty results); picked hybrid as the "problem" (it's a design decision). No CI mention. Strong: POM/fixture reasoning, "next" ideas (auth fixture, per-env config, projects by test type). |
| Transfer map | 🟡 | Rusty on Selenium (API background). DataProvider → said storageState (❌); Grid unknown. Map + RestAssured rows in Revision Part 4. |
| Cheat sheet | 🟡 | "Modern/market" as the Playwright reason; CI-only: skipped "get the trace first", then agreed. Said "browsers are the issue" for CI (not proven). |
| MCP | 🟡 | Concept only. Called MCP "an API call"; accepted protocol / tool-call wording. Skipped the accessibility-tree question. |
| Mock interview | 🟡 | Auth ✅, UI vs API ✅ (test pyramid), hardest bug vague, logged-out fix = "assert the token" (wrong layer), flaky = "retries usually work" (trap). |

### Concepts covered
- Test pyramid; hybrid as the senior answer to UI vs API
- Flaky process: `--repeat-each`, trace, root cause, `test.fixme`
- Workers + sharding replace Grid; a data-driven loop replaces DataProvider
- MCP: protocol, server, tools, accessibility tree, review AI output
- `page.pdf()` / `setContent` / `addScriptTag` (PDF export script)
