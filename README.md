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
| 🎯 | **Resilient locators**: `getByRole`, `getByLabel`, `getByTestId` | Tests follow what the user sees, not fragile CSS |
| ⏳ | **Web-first assertions** + auto-waiting | No sleeps; assertions retry until the page is ready |
| 🪜 | **`test.step`** blocks | Readable reports and traces: you see *which step* failed |
| 🌍 | **Environment config** via `.env` + `BASEURL` | Same suite on any environment, no code changes |
| 🔐 | **No secrets in code** | Credentials come from `.env` locally and GitHub Secrets in CI |
| 🧹 | **ESLint `no-floating-promises`** | A missing `await` can't slip through |
| 🔍 | **Trace viewer** debugging | DOM snapshots, network and console for every step |
| 🚀 | **GitHub Actions** workflow | Runs on every push and pull request |

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
├── tests/                    # Specs: user journeys + assertions
│   └── login-search.spec.ts
├── docs/                     # Learning journey
│   ├── Interview Plan.md     #   the 5-day plan
│   ├── me/                   #   day-by-day notes
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
| `npx playwright test` | Run all tests, headless, all browsers |
| `npx playwright test --project=chromium` | Chromium only |
| `npx playwright test --headed` | Watch the browser |
| `npx playwright test --ui` | Interactive UI mode (on WSL: `--ui-port=8080`) |
| `npx playwright test --trace on` | Record a full trace |
| `npx playwright show-report` | Open the HTML report (traces inside) |
| `npm run lint` | ESLint: catches missing `await`s |

## 🧭 Design principles

1. **Layers:** tests → page objects → (fixtures) → config. Tests describe *what*, page objects know *how*.
2. **Locators:** role or label first, test ID second, CSS last. Never position-based.
3. **No sleeps:** auto-wait + web-first assertions. Assertions double as synchronization.
4. **Independent tests:** every test gets a fresh browser context; tests can run in any order and in parallel.
5. **Assertions live in tests**, so page objects stay reusable for positive and negative cases.

## 📚 The learning journey

This repo is also a learning log. I'm a QA automation engineer with a Java/Selenium background, ramping up on Playwright + TypeScript.
Follow along in [`docs/`](./docs): day-by-day notes, mistakes and fixes, and a changelog explaining *why* each piece was added.

---

<div align="center">

Built with 🎭 Playwright · 🟦 TypeScript · ☕ and a lot of `await`

</div>
