# Day 3 - Progress

**Goal:** Turn the test into a small framework: page objects, a custom fixture, and log in once with `storageState`.
**Then I can say:** "I can design a maintainable framework."

## Steps
- [x] 0. Move credentials out of the test: `.env` + `dotenv`, add `.env` to `.gitignore`
- [x] 1. First page object: `LoginPage` (locators + `login()` method)
- [x] 2. Second page object: `SearchPage` (search + results)
- [x] Extra: ESLint `no-floating-promises`, git init, first push to GitHub
- [ ] 3. Custom fixture: `test.extend` injects the page objects into tests
- [ ] 4. Setup project: log in once, save `storageState` to a file
- [ ] 5. Tests reuse `storageState` (no UI login per test); explain the framework layers

## Before you start
- Open Claude Code in this folder. It picks up from `docs/ai/progress.md` automatically.
- Re-read the Day 1 note on **isolation** (one test = one context). `storageState` is how you share login *without* breaking isolation.
- Java link: page object = a POM class; fixture ≈ dependency injection (like `@Before` + constructor injection, but lazy and composable).

---

## 📘 Learn notes

### Git: what I set up
**git** = the version-control **tool** on my machine. **GitHub** = the **website** that hosts repos online (Day 4). Don't mix them up.

| Command | What it does |
| --- | --- |
| `sudo apt install git` | Install git (once per machine) |
| `git config --global user.name "…"` / `user.email "…"` | Who I am in commits (once per machine) |
| `git config --global init.defaultBranch main` | New repos start on `main`, not `master` (only affects repos created **after** this) |
| `git init` | Turn the folder into a repo (creates `.git/`) |
| `git branch -m main` | Rename the current branch (I was on `master`) |
| `git status` | What's changed / untracked / staged. **Always read it before committing** |
| `git add .` | Stage everything that isn't ignored |
| `git commit -m "message"` | Save a snapshot with a message |
| `git log --oneline` | List my commits (= my learning journey) |
| `git diff HEAD~1 -- <file>` | What changed in a file since the last commit |

- No output from a git command = success.
- `git branch` shows nothing before the first commit; a branch only really exists after a commit.
- VS Code **Timeline** (Explorer panel) shows every commit of a file, side by side.
- Old code doesn't need to stay commented out: **git keeps the history**. Commit after each step with a clear message.

### .gitignore + secrets
| Ignored | Why |
| --- | --- |
| `node_modules/` | Rebuilt by `npm ci` from the lock file |
| `test-results/`, `playwright-report/` | Generated run output |
| `.env` | **Secrets** (passwords, URLs) |

- Add `.env` to `.gitignore` early. One `git add .` can stage it by accident.
- Once a secret is **committed**, it's in the history even if the file is deleted later. Once **pushed** → **rotate** it (change the password).
- `.env` = `NAME=value` lines; `dotenv` loads it in `playwright.config.ts`; in CI → GitHub Secrets.
- "injected env (3) … (0)" = the main process loads 3 vars, the worker inherits them (0 new).

> **Interview:** "Secrets live in a gitignored `.env` locally and in GitHub Secrets in CI. If a secret is ever committed, deleting it isn't enough: it's in the history, so I rotate it."

### Page objects (POM)
```ts
export class LoginPage {
    readonly emailInput: Locator;                       // locators = readonly fields
    constructor(private readonly page: Page) {          // TS shortcut: declares + assigns this.page
        this.emailInput = page.getByLabel('email');     // no await: locators are lazy
    }
    async performUserLogin(email: string, password: string) {   // credentials passed IN
        await this.emailInput.fill(email);              // await every action
    }
}
```
| Goes in the page object | Goes in the test |
| --- | --- |
| `getBy…` locators, actions (`login`, `search`) | `expect(...)` assertions, which user/data |

- `const loginPage = new LoginPage(page);` borrows the test's `page` (same isolated context).
- **No BasePage** yet: Playwright already auto-waits, so it'd be empty. Use composition (NavBar component) + fixtures. Add one only when real duplication appears (YAGNI).
- Constructors can't be `async` → never `goto` in a constructor.
- Plural names for multi-element locators: `productNames`.
- The field name is mine (camelCase); the test-id string must match the HTML exactly (`product-name`).
- `process.env.X!`: `!` silences `string | undefined` (no runtime check).

### The await rule
- Calling **anything `async`** (Playwright's or **my own** methods) → `await` it.
- No await: `new X()`, `const loc = page.getBy…`.
- **ESLint catches it:** `npm run lint` → `57:5 error … no-floating-promises` (line 57, column 5). Silent = clean.

### Tooling added
| File | Purpose |
| --- | --- |
| `tsconfig.json` | TypeScript settings (strict, commonjs, esModuleInterop) |
| `eslint.config.mjs` | ESLint with one rule: `no-floating-promises` |
| `package.json` script | `"lint": "eslint ."` |

- `npm audit` warning: moderate, dev-only, fix = breaking downgrade → **don't** `--force`. Judge: dev vs runtime, reachable?, fix risk.
- Stack traces: the **first** `file:line:col` points at my code (`eslint.config.mjs:15:3` → a stray `npm` in the file).

### GitHub push
- `git remote add origin <url>` → `git push -u origin main` (`-u` links the branch once).
- "src refspec main does not match any" = **no commits yet**.
- GitHub rejects passwords → token via `gh auth login` (WSL) or Git Credential Manager (Windows git).
- Identity (`user.name`/`email`) = a label on commits. Authentication (token) = permission to push.
- Repo name ≠ folder name. Only the remote URL links them.

## "I can now say…"
- "I build page objects with locator fields and intent-level methods, keep assertions in tests, and enforce `await` with ESLint."

## My notes
-

## Questions
-
