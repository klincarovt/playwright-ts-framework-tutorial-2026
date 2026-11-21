# Extras - Progress

**Goal (interview in 1–2 days):** look as appealing as possible to a Playwright interviewer. Turn this repo into a **framework** with a clean structure that I can rebuild quickly from memory.
**Then I can say:** "I can set up a Playwright framework from scratch: UI and API layers, fixtures, test data, environments, tags, reporting and CI."

## 🎯 Sprint (most important, in this order)

Order follows dependencies: each item uses the one before it.

| # | Item | What I build | Time | Status |
| --- | --- | --- | --- | --- |
| S1 | Config: reporters + screenshots | `reporter` array (`list` + `html`, `junit` on CI), `screenshot: 'only-on-failure'` | 15 min | ✅ |
| S2 | Cleanup | Old `tests/ui/login-search.spec.ts` kept as a reference but `test.skip` + comment (my choice); no `console.log` left | 5 min | ✅ |
| S3 | Environments (simple) | `.env.${ENV}` with `.env` as default; `.gitignore` → `.env*`; `API_URL` in `.env` instead of the hardcoded `API` const | 15 min | ✅ |
| S4 | API client layer | `api/AuthClient.ts`, `api/ProductsClient.ts`: one class per resource, wraps `request`, **no assertions** | 30 min | ✅ |
| S5 | Fixtures for API clients | Add the clients to `fixtures/fixtures.ts`; refactor the API + hybrid specs to use them | 30 min | ✅ |
| S6+S7 | Data + showcase spec | `data/products.json`; one spec: `describe` + `beforeEach`, `@smoke` tag, loop over the JSON, `waitForResponse` on search | 40 min | ✅ |
| S8 | npm scripts + CI | `test`, `test:smoke`, `test:api`, `report`; the workflow calls `npm run test:api` | 10 min | ✅ |
| S9 | README refresh | New layers in the structure + one architecture line (Claude does it) | 10 min | ✅ |

**Total ≈ 2 h 15 min.** Basics only, simple versions. The senior versions (typed env config, worker fixtures, factories, CI matrix, full rebuild) → `Solo Project - Senior Framework.md`.
**Format per item:** concept → I build it → review → **1–2 check questions + discussion** (interview style, logged in `Revision.md`).

**Optimizations vs. the first plan:**
- **Merged** the separate describe / tags / data-driven / `waitForResponse` tasks into **one showcase spec** (S7): less setup, and one file to show in an interview.
- **Folders** come with their first file (S4, S6), because git doesn't track empty folders.
- **Cleanup early** (S2), so old code doesn't confuse later refactors.
- **`waitForResponse` moved into the sprint**: it's the standard answer to "how do you fix a flaky test?", and it costs about 10 extra minutes.
- **The rebuild is structure only**, not a full re-code: that's what "quickly create a framework" needs in an interview.
- **CI and npm scripts together**: the workflow simply calls the script.

## 💤 Optional (after the interview, or for talk-level answers only)

| Topic | Talk-level answer for now |
| --- | --- |
| Frames (card 6) | `page.frameLocator(...)`, then normal locators inside |
| AI test creation (card 7) | MCP + Test Agents (planner, generator, healer); review everything |
| Multi-role auth | One setup per role → `admin.json` / `user.json`; a fixture opens a context per role |
| `mergeTests` / option fixtures | Combine fixture files; option fixtures = config values tests can override |
| Sharding matrix in CI | `--shard=1/3` across a matrix, then `merge-reports` |
| BDD (playwright-bdd) | Gherkin steps generated into Playwright tests; fixtures replace Cucumber's World |
| Mobile emulation | `devices['iPhone 13']` project: viewport, touch, user agent |
| HAR record/replay | `routeFromHAR`: replay recorded network traffic as mocks |
| Visual testing | Skipped on purpose (`toHaveScreenshot`) |

## Concept cards
(The detailed explanations used by the sprint items.)

---

## 1. `test.describe` + hooks
- **Problem:** related tests repeat the same first steps, and the report is one flat list.
- **Name:** `describe` *describes* a group of tests. Hooks *hook into* the run before or after tests.
- **How:** `beforeEach` / `afterEach` run around **every** test in the group. `beforeAll` / `afterAll` run **once** per worker (≈ JUnit `@BeforeAll`).
- **Task:** group the search tests in a `test.describe`, and move the shared start (home page) into `beforeEach`.
- **Check:** why is `beforeAll` a bad place to open a page you use in every test?
- **Interview line:** *"Hooks for simple shared steps, fixtures when it's reusable setup with teardown."*
- Docs: https://playwright.dev/docs/api/class-test#test-describe

## 2. Tags + `--grep`
- **Problem:** CI shouldn't always run everything. You want a fast smoke run and a full regression run.
- **Name:** a *tag* labels a test. `grep` = the Unix "search by pattern" command.
- **How:** add a tag to a test (`@smoke`), then filter with `--grep @smoke` or exclude with `--grep-invert`.
- **Task:** tag 2 tests `@smoke` and run only those.
- **Check:** how would CI run smoke tests on every push but the full suite nightly?
- **Interview line:** *"Tags let one suite serve smoke, regression and nightly runs."*
- Docs: https://playwright.dev/docs/test-annotations#tag-tests

## 3. `waitForResponse`
- **Problem:** the test asserts before the API answered, so it's flaky. You also want to check what the API returned.
- **Name:** *wait for* a network *response* that matches a URL.
- **How:** start waiting **before** the click, then click, then await the response. The order matters.
- **Task:** in a search test, wait for the `/products/search` response and assert its status is 200 before checking the UI.
- **Check:** why must you start waiting **before** clicking, not after?
- **Interview line:** *"I sync on the real API call instead of sleeping, and can assert on it too."*
- Docs: https://playwright.dev/docs/api/class-page#page-wait-for-response

## 4. Config per environment
- **Problem:** the same suite must run against dev, staging, and so on, without code changes.
- **Name:** *environment* = where the app runs (dev / staging / prod).
- **How:** one `.env.<name>` file per environment, picked by a variable such as `ENV=staging` when you run.
- **Task:** load `.env.${ENV}` in `playwright.config.ts`, with a default when `ENV` isn't set.
- **Check:** how do you choose the environment in CI?
- **Interview line:** *"One suite, many environments: the URL and users come from env files or CI secrets."*
- Docs: https://playwright.dev/docs/test-parameterize#passing-environment-variables

## 5. Data-driven loop
- **Problem:** the same test with different data (≈ TestNG `@DataProvider`).
- **Name:** *data-driven* = the data decides how many tests there are.
- **How:** a `for` loop over an array that creates one `test()` per item. Each one needs a **unique title**.
- **Task:** search for 3 products, one test each. Bonus: load the data from a JSON file.
- **Check:** what happens if two generated tests have the same title?
- **Interview line:** *"Playwright has no DataProvider; a loop generates one named test per data row."*
- Docs: https://playwright.dev/docs/test-parameterize

## 6. Frames (low priority)
- **Problem:** an element inside an `<iframe>` (payment widget, embedded editor) isn't found by `page.getBy…`.
- **Name:** an iframe is a page *framed* inside another page.
- **How:** `page.frameLocator('iframe-selector')`, then normal locators inside it.
- **Task:** Toolshop has no iframe → practice on https://the-internet.herokuapp.com/iframe
- **Check:** why doesn't `page.getByText()` find text inside an iframe?
- Docs: https://playwright.dev/docs/frames

## 7. AI test creation (agentic)
- **Problem:** writing the first draft of a test (exploring the page, finding locators) is slow. AI can do the draft; I decide what to test and review it.
- **Names:**
  - **MCP** = Model Context Protocol. The Playwright MCP server gives the AI a real browser (it reads the accessibility tree).
  - **Agentic** = the AI works in a loop by itself: it acts, looks at the result and decides the next step.
  - **Test Agents** = Playwright's built-in agents:
    - **planner**: explores the app and writes a test plan in Markdown
    - **generator**: turns the plan into spec files
    - **healer**: runs failing tests and tries to fix them
- **How:**
  - a) MCP: Claude drives the browser and drafts a test.
  - b) Agents: `npx playwright init-agents --loop=claude` adds the agent definitions, then plan → generate → heal.
- **Task:** generate one test each way for Toolshop, then **review it like a PR**: locators, assertions, does it test anything? Make it fail once on purpose.
- **Prereq:** `npx playwright install chrome` (MCP's browser).
- **Check:** the healer made a red test green. Is that good news? What do you check?
- **Interview line:** *"AI agents draft and heal tests; I decide what to test, review every change, and make sure a 'healed' test didn't just hide a real bug."*
- Docs: https://playwright.dev/docs/test-agents · https://playwright.dev/docs/getting-started-mcp

---

## 📘 Learn notes

| Topic | One-liner | 📍 |
| --- | --- | --- |
| Reporters | 3 readers: `list` = person live, `html` = person debugging, `junit` XML = the CI tool | `playwright.config.ts:30-32` |
| Paths | No leading `/` in a path: it's the disk root (`EACCES mkdir '/test-results'`) | `playwright.config.ts:31` |
| Old test | `test.skip` + reason, not commented out: stays type-checked, shows as skipped | `tests/ui/login-search.spec.ts:5-6` |
| Environments | `ENV=staging` → `.env.staging`; `.gitignore` `.env*`. Senior: typed config + fail-fast | `playwright.config.ts:10-14` |
| Silent fallback | `process.env.X \|\| 'default'` hides typos → senior frameworks fail fast | `playwright.config.ts` baseURL |
| API clients | "POM for the API": endpoints in one place, return the response, no assertions → negative tests possible | `api/*.ts` |
| Client fixtures | Built from `request`, not `page` → API tests launch no browser | `fixtures/fixtures.ts` |
| `waitForResponse` | Start waiting **before** the action; sync on fresh data, clear 500 errors | `tests/ui/search.spec.ts:12-14` |
| Data-driven | `for...of` over JSON → one uniquely named `test()` per row (≈ DataProvider) | `tests/ui/search.spec.ts:10-11` |
| Tags + scripts | `@smoke` + `npm run test:smoke`; dependencies (setup) run automatically | `package.json` |
| Flaky mock | Evidence → rule out (URL, service worker) → time-box → `fixme`, never delete the assertion | `tests/mock/mock.spec.ts` |

## Status

- Sprint S1–S9 ✅, committed, CI green (2026-11-21).
- Next: my solo project from `Solo Project - Senior Framework.md` (interview-first edition): **starter kit S1–S8 → 3-hour mock test task on saucedemo → review**, then the full framework. Stuck? → `Solo Project - Deep Dive.md` (same section numbers, patterns + model answers).

## Questions
-
