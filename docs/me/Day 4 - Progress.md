# Day 4 - Progress

**Goal:** Cover API and CI: API tests with `request`, a hybrid test, a network mock, and a GitHub Actions run.
**Then I can say:** "I cover UI, API and CI."

## Steps
- [ ] 1. API test #1: `request` fixture, GET products → check status, key fields
- [ ] 2. API test #2: POST login (get a token) or a negative case (401 / 404)
- [ ] 3. API client layer: one class per resource (e.g. `ProductsApi`), injected by a fixture
- [ ] 4. Hybrid test: create data via the API → check it in the UI → clean up via the API
- [ ] 5. Mock the backend with `page.route`: fake an error or an empty search result, check the UI handles it
- [ ] 6. Git repo + push to GitHub; run the GitHub Actions workflow; secrets in GitHub Secrets; download the report artifact

## Before you start
- The practice site has a REST API at `api.practicesoftwaretesting.com`. You saw `/products/search` and the Bearer token in the Day 2 trace.
- Java link: `request` fixture ≈ REST Assured; `page.route` ≈ WireMock, but inside the browser.
- Day 3's `storageState` and `.env` need to be done first. CI will need the same variables as secrets.

---

## 📘 Learn notes
*(filled in at wrap-up)*

## "I can now say…"
-

## My notes
-

## Questions
-
