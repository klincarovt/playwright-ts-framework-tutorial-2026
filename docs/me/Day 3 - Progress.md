# Day 3 - Progress

**Goal:** Turn the test into a small framework: page objects, a custom fixture, and log in once with `storageState`.
**Then I can say:** "I can design a maintainable framework."

## Steps
- [ ] 0. Move credentials out of the test: `.env` + `dotenv`, add `.env` to `.gitignore`
- [ ] 1. First page object: `LoginPage` (locators + `login()` method)
- [ ] 2. Second page object: `SearchPage` (search + results)
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

## "I can now say…"
-

## My notes
-

## Questions
-
