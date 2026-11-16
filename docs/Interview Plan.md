# Playwright + TS + Agentic AI — Interview Quick Plan

Nov 10, 2026 · @JoJo

## Context for me

**Why I'm doing this:** to get interview-ready on Playwright + TypeScript, fast.

- **Where I am:** mid-senior QA automation engineer. I know testing, but I haven't used TypeScript or Playwright in about 2 years, so I'm rusty.
- **Tool:** Playwright (the WebSocket-based tool) in TypeScript.
- **How I learn:** record a journey with codegen, then refactor it into a real framework. Same for API. I write the code; AI only hints and reviews.
- **Focus:** only features used in real projects (Tier 1 first, then Tier 2).
- **End result:** a small hands-on repo plus a confident story: I've used Playwright and can adapt fast.
- **Next up:** Day 1, set up Playwright and codegen a first test.

## Plan: interview-ready in 5 days

The goal is to say honestly "I've worked hands-on with Playwright + TypeScript" and back it up with a small repo and clear answers. About 2 hours a day; you write the code, AI only hints and reviews.

| Day | Do | Then you can say |
| --- | --- | --- |
| 1 | Install, `npm init playwright@latest`, codegen a login + search journey, run it headed and in UI mode | "I set it up from scratch and know the project layout" |
| 2 | Rewrite the recording: role-based locators, web-first assertions, `baseURL` in config; debug one failure in the trace viewer | "I know why Playwright is less flaky, and how I debug" |
| 3 | Refactor into 2 page objects + 1 custom fixture; log in once with `storageState` | "I can design a maintainable framework" |
| 4 | 2 API tests with `request`, 1 hybrid test (API setup, UI check), 1 `page.route` mock; push and run in GitHub Actions | "I cover UI, API and CI" |
| 5 | Say your story, the transfer map and the cheat sheet out loud; try Playwright MCP once | "I adapt fast and use AI tools responsibly" |

## Your interview story

Adapt this to your own words and practise it until it sounds natural:

> "My core background is \[your stack, e.g. Java + API automation\]. I've worked hands-on with Playwright and TypeScript in my own framework: page objects with custom fixtures, login reused through storageState, API tests with the request fixture, and a GitHub Actions pipeline. The concepts carry over directly (POM, test design, CI), so the change is mostly syntax and Playwright's built-in waiting. I'd be productive in a Playwright codebase within days."

Why it works: it's honest, it points to proof (the repo), and it shows you know what transfers.

## Transfer map: what you know → Playwright

| You know | In Playwright + TS |
| --- | --- |
| Selenium WebDriver (HTTP per command) | Playwright (one persistent WebSocket) |
| Explicit waits, `WebDriverWait` | Auto-wait + web-first assertions |
| `By.id`, XPath | `getByRole`, `getByLabel`, `getByTestId` |
| Page Object Model, PageFactory | Page object classes injected by fixtures |
| TestNG/JUnit `@Before`/`@After` | Fixtures (`beforeEach` for simple cases) |
| REST Assured | `request` fixture (`APIRequestContext`) |
| Maven profiles, properties files | Config projects + `.env` |
| Allure/Extent reports, screenshots | HTML report, trace viewer, screenshot/video on failure |
| Java classes, interfaces, generics | Same ideas in TS, plus union types |
| Synchronous calls | `await` on every Playwright call |
| Selenium Grid, Jenkins | Workers + sharding, GitHub Actions |

## Playwright architecture

Your test code is a client. It talks to a Playwright server over one persistent WebSocket, and the server drives real browser engines. That single connection is why Playwright is faster and less chatty than Selenium's HTTP-per-command WebDriver.

&#91;embedded content: Playwright architecture · client, server, browser contexts\]

- **Browser** = the heavy process, started once per worker.
- **Context** = a clean, isolated session (cookies, storage). One per test.
- **Page** = a tab.
- **Test runner** = runs tests in parallel workers and injects fixtures.

## Features used in real projects

Learn Tier 1 cold; know Tier 2 well enough to handle it on the job. Everything else can wait.

| Tier | Feature | Real-life use |
| --- | --- | --- |
| 1 | Locators: `getByRole`, `getByLabel`, `getByText`, `getByTestId`, `.filter()`, chaining | Every interaction; stable against UI changes |
| 1 | Web-first assertions: `toBeVisible`, `toHaveText`, `toHaveURL`, `toHaveCount` | Every check; they auto-retry |
| 1 | Auto-waiting | No sleeps or explicit waits |
| 1 | Codegen | First drafts and finding locators |
| 1 | Trace viewer, UI mode, `--debug` | Debugging local and CI failures |
| 1 | `playwright.config.ts`: `baseURL`, projects, retries, reporters, trace/screenshot/video | One place to control every run |
| 1 | POM + custom fixtures | The backbone of every framework |
| 1 | `storageState` + setup project | Log in once, reuse the session |
| 1 | `request` fixture | API tests and fast test data setup |
| 2 | Popups/new tabs: `waitForEvent('popup')` | Payment pages, OAuth logins, "open in new tab" links |
| 2 | Iframes: `frameLocator` | Payment widgets, embedded editors, chat widgets |
| 2 | Upload/download: `setInputFiles`, `waitForEvent('download')` | Documents, CSV exports, reports |
| 2 | Dialogs: `page.on('dialog')` | Confirm and delete prompts |
| 2 | Network: `page.route`, `waitForResponse` | Mock errors/empty states; sync on API calls |
| 2 | Workers, tags + `--grep`, sharding | Fast CI, smoke vs regression |
| 2 | `.env` + `baseURL` per environment | Same tests on dev, staging, prod |

Skip for now: fake clock, aria snapshots, visual comparisons, component testing, newest 1.6x features.

## Web automation strategy

Five rules cover most real frameworks.

1. **Layers:** tests → page objects → fixtures → config. Tests never create page objects themselves.
2. **Locators:** role or label first, test ID second, CSS last. No XPath.
3. **No sleeps:** rely on auto-wait and web-first assertions.
4. **Log in once:** save `storageState`, reuse it in every test.
5. **Independent tests:** own data, own context, any order. Then parallel runs just work.

## API automation strategy

API tests are fast and stable, so most business rules get checked here.

1. **Client layer:** one class per resource (`UsersApi`), injected by a fixture.
2. **Check:** status code, key fields, schema, and negative cases (400, 401, 404).
3. **Hybrid:** create data via API, check it in the UI, delete it via API.
4. **Mock:** `page.route` fakes backend errors or empty states for UI tests.

## Common practices

| Practice | In short |
| --- | --- |
| Test pyramid | Many API tests, few UI tests |
| Tags | `@smoke` on every PR, full regression nightly |
| Retries | 2 in CI, 0 locally; a retry pass = flaky, fix it |
| Evidence | Trace, screenshot and video kept on failure |
| CI | GitHub Actions, browsers in parallel, report uploaded |
| Secrets | In GitHub Secrets, never in code |

## Agentic AI with Playwright

Your interview line: **AI drafts and fixes tests; I decide what to test and review everything.**

- **Playwright MCP:** lets an AI agent (like Claude) control a real browser.
- **Test agents:** Planner writes a test plan, Generator writes the tests, Healer fixes broken ones. Set up with `npx playwright init-agents --loop=claude`.
- **Guardrail:** review every AI test like a pull request. A "healed" test can hide a real bug.

## Interview cheat sheet

For each answer, name the concept first, then give a repo example.

| Question | Short answer |
| --- | --- |
| Why Playwright over Selenium? | One WebSocket instead of HTTP per command, auto-waiting, browser contexts, built-in runner, trace viewer and API testing |
| Browser vs context vs page? | Browser = process; context = isolated session (cookies, storage), cheap, one per test; page = tab |
| How does it reduce flakiness? | Actionability checks before actions, retrying web-first assertions, strict locators, test isolation |
| Fixtures vs `beforeEach`? | Fixtures are composable, lazy, typed and scoped (test/worker); `beforeEach` duplicates setup |
| How is your framework structured? | Specs → page objects → custom fixtures → API clients/utils → config per env; SRP, DI, POM |
| How do you handle login? | Setup project saves `storageState` per role; tests reuse it; API login for speed |
| A test is flaky. What do you do? | Reproduce, open the trace, classify the root cause, fix it; quarantine with a tag meanwhile; never just add retries |
| API vs UI: where do you test what? | Business rules and negative cases via API; UI only for critical journeys; API for setup and teardown |
| How do you mock the backend? | `page.route` / `routeFromHAR` for errors, empty states, slow responses |
| How do you make CI fast? | Parallel workers, sharding across jobs, `@smoke` on PRs, full run nightly, cached dependencies |
| How do you debug a CI failure? | Download the trace artifact, step through DOM, network and console in trace viewer |
| How do you use AI in testing? | Playwright MCP + test agents to explore, draft and heal; every output reviewed like a PR; risk-based scope stays mine |

**Sources**

- [Playwright 1.65 release notes summary (TestMu AI)](https://www.testmuai.com/blog/playwright-1-65-release/)
- [Playwright 1.64 release: WebMCP (TestDino)](https://testdino.com/blog/playwright-1-64-release)
- [Playwright 1.63 release: test locks (TestDino)](https://testdino.com/blog/playwright-1-63-release)
- [Playwright Test Agents (Steve Kinney)](https://stevekinney.com/courses/self-testing-ai-agents/playwright-test-agents)
- [Playwright Test Agents guide (TestDino)](https://testdino.com/blog/playwright-test-agents/)

## Context for AI

Copy everything in the block below into a new chat to continue with any AI assistant.

```markdown
# ROLE
Senior QA Automation mentor + interview coach. Concise by default; go deeper only when asked.

# LEARNER
Mid-senior QA Automation Engineer. Knows testing concepts and automation in general (skip testing theory), but used TypeScript and Playwright about 2 years ago and is rusty: treat as near-beginner (quick refreshers, not full basics).
Preparing for interviews on a short timeline. Learns with AI assistance.
Mixes up terms sometimes (e.g. "WebSocket" when meaning Playwright): flag wording issues before correcting.

# GOAL (priority order)
1. Understand Playwright + TypeScript features used in real projects.
2. Explain them confidently in interviews, with correct terminology.
3. Build ONE GitHub repo (Playwright + TS framework, GitHub Actions CI, MCP) and explain every design decision in it.

# TARGET
Interview-ready, not mastery: honestly say "I've worked hands-on with Playwright + TS" and adapt fast. Proof = a small repo + clear answers.

# METHOD: 5 days, ~2 h/day, codegen first then refactor
Day 1. Setup (npm init playwright@latest), codegen login + search, run headed + UI mode. TS refreshers as needed (import, async/await, arrow functions).
Day 2. Rewrite the recording: role-based locators, web-first assertions, baseURL in config; debug one failure in the trace viewer.
Day 3. Refactor into 2 page objects + 1 custom fixture; storageState login reuse.
Day 4. 2 API tests with request, 1 hybrid test (API setup, UI check), 1 page.route mock; run in GitHub Actions.
Day 5. Interview drill: my story, transfer map (Java/Selenium/REST Assured -> Playwright), cheat sheet out loud; try Playwright MCP once.

# SCOPE
Tier 1 (must know): locators (getByRole/Label/Text/TestId, filter, chaining), web-first assertions, auto-wait, codegen, trace viewer/UI mode/--debug, config, POM + fixtures, storageState, request fixture.
Tier 2 (real-life): popups, iframes, upload/download, dialogs, network mocking/waiting, parallel/tags/sharding, env config.
Skip unless asked: fake clock, aria snapshots, visual comparisons, component testing, newest release features.

# LEARNING MODE (most important rule)
I must LEARN, not copy. Do NOT write the framework or full solutions for me.
- Default: I write the code. You give the task, the concept and the goal.
- Hint ladder when I'm stuck, one level at a time:
  1) a guiding question or concept
  2) which Playwright API/feature to use
  3) a partial snippet with gaps for me to fill
  4) a full snippet ONLY if I say "show me", one small piece at a time
- Review my code like a senior in a PR: what's wrong, why, which principle. Let me fix it myself.
- Boilerplate (config, CI YAML) only when I ask, then explain every line and ask me to explain one part back.
- Don't move to the next step until I can explain what I built in my own words.

# HOW TO TEACH
- Rusty in TS + Playwright: give a 1-2 line refresher for each syntax or API the first time it appears, and name the concept (e.g. "async/await", "interface", "fixture"). Skip what I clearly remember.
- Keep tasks small: one new concept at a time.
- One step at a time. Header: "Day N/5". Wait for "next".
- Per step: key points -> real project example -> a coding task for me (I write it; you hint and review) -> 1 interview question + model answer -> 1 check question, then wait.
- Explain every design decision with: SOLID / pattern name, trade-offs, flakiness risk, CI-readiness.
- Wrong or unclear answer: first check if it's wording; if it's a real gap, correct briefly and log it as a weak spot.
- Push for exact terms (name the feature/pattern/principle first).
- Off-topic question: answer it, then say where we paused.
- Compare like with like (tool vs tool, protocol vs protocol).

# PROGRESS (update at end of session if asked)
- Current: Day 1/5 not started.
- Weak spots: tool vs protocol terminology (Playwright vs WebSocket).

# SESSION END (only when asked)
Summarize: steps done, weak spots, next step, and an updated PROGRESS block to paste back here.
```
