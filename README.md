<div align="center">

# 🎭 Playwright + TypeScript Framework

**A hands-on end-to-end test framework for the [Toolshop](https://practicesoftwaretesting.com) demo app, built step by step in 2026.**

[![Playwright Tests](https://github.com/klincarovt/playwright-ts-framework-tutorial-2026/actions/workflows/playwright.yml/badge.svg)](https://github.com/klincarovt/playwright-ts-framework-tutorial-2026/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.65-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=nodedotjs&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

</div>

---

## ✨ What's inside

| | Feature | Why it matters |
| --- | --- | --- |
| 🧱 | **Page Object Model**: `LoginPage`, `SearchPage` | Locators live in one place; tests read like user steps |
| 💉 | **Custom fixtures** (`test.extend`) | Page objects are injected into tests; no `new LoginPage(page)` everywhere |
| 🔑 | **Log in once** with `storageState` (setup project) | Every test starts logged in, still in its own fresh context |
| 🌐 | **API tests** with the `request` fixture | Fast checks of search and login endpoints |
| 🔀 | **Hybrid test**: API login → UI check | Skips slow UI login steps; faster and more stable |
| 🎭 | **Network mocking** with `page.route` | Tests the UI's reaction to an empty result list |
| 🗂️ | **Projects** by purpose: `setupUser`, `apiTest`, `chromium`, `webkit` | API tests run without a browser login; UI tests depend on setup |
| 🎯 | **Resilient locators**: `getByRole`, `getByLabel`, `getByTestId` | Tests follow what the user sees, not fragile CSS |
| ⏳ | **Web-first assertions** + auto-waiting | No sleeps; assertions retry until the page is ready |
| 🪜 | **`test.step`** blocks | Readable reports and traces: you see *which step* failed |
| 🌍 | **Environment config** via `.env` + `BASEURL` | Same suite on any environment, no code changes |
| 🔐 | **No secrets in code** | Credentials come from `.env` locally and GitHub Secrets in CI |
| 🧹 | **ESLint `no-floating-promises`** | A missing `await` can't slip through |
| 🔍 | **Trace viewer** debugging | DOM snapshots, network and console for every step |
| 🚀 | **GitHub Actions** workflow | Runs the API suite on push/PR to `main`; secrets from a GitHub Environment |

## 🗺️ Roadmap

- [x] Project setup, codegen → clean spec with web-first assertions
- [x] `baseURL` from env, role/label/test-id locators, trace viewer
- [x] `.env` secrets, page objects, ESLint
- [x] Custom fixtures (`test.extend`) injecting page objects
- [x] Log in once with `storageState` (setup project)
- [x] API tests with the `request` fixture (API client layer: todo)
- [x] Hybrid test: API login → UI check
- [x] Network mocking with `page.route`
- [x] CI with GitHub Secrets and report artifacts (API suite; the demo site blocks UI runs on GitHub runners)
- [ ] Playwright MCP: AI-drafted tests, human-reviewed

## 📁 Project structure

```
├── pages/                    # Page objects: locators + actions
│   ├── LoginPage.ts
│   └── SearchPage.ts
├── fixtures/fixtures.ts      # test.extend: injects page objects, re-exports expect
├── tests/
│   ├── setup/auth.setup.ts   # logs in once, saves playwright/.auth/user.json
│   ├── ui/                   # UI journeys (login, search, my account)
│   ├── api/                  # request-fixture tests (search, login)
│   ├── hybrid/               # API login → UI check
│   └── mock/                 # page.route mocked responses
├── playwright/.auth/         # saved login state (generated, gitignored)
├── docs/                     # Learning journey
│   ├── Interview Plan.md     #   the 5-day plan
│   ├── revision-pdf.js       #   exports docs/me/Revision.md to PDF
│   ├── me/                   #   day-by-day notes + Revision.md
│   └── ai/                   #   mentor log + framework changelog
├── .github/workflows/        # CI pipeline
├── playwright.config.ts      # baseURL, browsers, reporters, tracing
├── eslint.config.mjs         # lint rules
└── tsconfig.json             # TypeScript settings
```

## 🚀 Getting started

**Prerequisites:** Node.js LTS (via [nvm](https://github.com/nvm-sh/nvm)) and git.

```bash
# 1. Clone and install
git clone https://github.com/klincarovt/playwright-ts-framework-tutorial-2026.git
cd playwright-ts-framework-tutorial-2026
npm ci
npx playwright install --with-deps

# 2. Create a .env file in the project root (it's gitignored)
BASEURL=https://practicesoftwaretesting.com
USER_EMAIL=<demo customer email>
USER_PASSWORD=<demo customer password>
```

The demo accounts are listed in the [Toolshop project README](https://github.com/testsmith-io/practice-software-testing).

## 🧪 Running tests

| Command | What it does |
| --- | --- |
| `npx playwright test` | Run everything: setup, API, then UI on Chromium + WebKit |
| `npx playwright test --project=chromium` | UI on Chromium only (setup runs first) |
| `npx playwright test tests/api --project=apiTest --no-deps` | API suite only, no browser login (what CI runs) |
| `npx playwright test --headed` | Watch the browser |
| `npx playwright test --ui` | Interactive UI mode (on WSL: `--ui-port=8080`) |
| `npx playwright test --trace on` | Record a full trace |
| `npx playwright show-report` | Open the HTML report (traces inside) |
| `npm run lint` | ESLint: catches missing `await`s |
| `node docs/revision-pdf.js` | Export my revision notes to PDF (Playwright `page.pdf()`) |

> **CI note:** the public demo site blocks UI logins from GitHub runners (likely bot protection), so CI runs the API suite and the UI suite runs locally.

## 🧭 Design principles

1. **Layers:** tests → page objects → (fixtures) → config. Tests describe *what*, page objects know *how*.
2. **Locators:** role or label first, test ID second, CSS last. Never position-based.
3. **No sleeps:** auto-wait + web-first assertions. Assertions double as synchronization.
4. **Independent tests:** every test gets a fresh browser context; tests can run in any order and in parallel.
5. **Assertions live in tests**, so page objects stay reusable for positive and negative cases.
6. **Log in once, set up via API:** UI tests start from saved state; specs that need a logged-out start opt out.
7. **A green test must be able to go red:** assert real content (not just the URL), and prove it fails without the precondition.

## 📚 The learning journey

This repo is also a learning log. I'm a QA automation engineer with a Java/Selenium background, ramping up on Playwright + TypeScript.
Follow along in [`docs/`](./docs): day-by-day notes, mistakes and fixes, and a changelog explaining *why* each piece was added.
Interview revision (definitions, questions, decisions, my project stories): [`docs/me/Revision.md`](./docs/me/Revision.md).

---

<div align="center">

Built with 🎭 Playwright · 🟦 TypeScript · ☕ and a lot of `await`

</div>
