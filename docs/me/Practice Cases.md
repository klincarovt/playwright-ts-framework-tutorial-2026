# Practice Cases

Write these **on my own**, after the sessions, with no skeletons and no AI. Then ask Claude to review them like a PR.
Goal: by the interview, each skill has been used **several times** on my own.

**How:** one case → write → run → `npm run lint` → commit → tick it. Stuck for more than 15 minutes? Ask for a hint (level 1 only).

---

## Level 1: locators + web-first assertions (Days 1–2)
- [ ] Home page shows at least 1 product card, each with a name and a price
- [ ] Search "hammer" → the search term shows "hammer" and every result name contains "Hammer"
- [ ] Search "xyz123" → an empty state / "no results" message is shown
- [ ] Open a product → the detail page shows the same name and price as the card
- [ ] Filter by category (e.g. Hand Tools) → only products from that category are shown
- [ ] Sort by price (low → high) → the first product is the cheapest of the first few

## Level 2: page objects (Day 3)
- [ ] `ProductPage` page object: name, price, quantity, Add to cart
- [ ] Add a product to the cart → cart badge shows 1
- [ ] Change the quantity to 3 → add to cart → the cart shows quantity 3
- [ ] Remove an item from the cart → the cart is empty
- [ ] **Negative login:** wrong password → error message visible, URL stays on login (reuses `LoginPage`!)
- [ ] **Negative login:** empty email → validation message
- [ ] `NavBar` component object (composition) used by 2 page objects

## Level 3: fixtures + storageState (Day 3)
- [ ] Every test above uses page objects from a **fixture** (no `new XPage(page)` in tests)
- [ ] 3 tests that start **already logged in** via `storageState`
- [ ] A test that must **not** be logged in (override `storageState` to empty)

## Level 4: API + hybrid + mocking (Day 4)
- [ ] API: GET products → status 200, the list is not empty, each item has `id`, `name`, `price`
- [ ] API: GET a product by id → the correct name
- [ ] API: GET a non-existent id → 404
- [ ] API: login → returns a token; wrong password → 401
- [ ] Hybrid: get a product via the API → open it in the UI → same name and price
- [ ] Mock: `page.route` the search API → return `[]` → the UI shows the empty state
- [ ] Mock: return a 500 → the UI shows an error (or log what it does)

## Level 5: real-project polish
- [ ] Tag smoke tests `@smoke` and run only them with `--grep @smoke`
- [ ] Data-driven: one test, 3 search terms (loop over an array)
- [ ] Fail-fast guard: a clear error when `USER_EMAIL` is missing from `.env`
- [ ] Commit a `.env.example`

---

## Interview drill (say out loud, no notes)
For every case I finish, answer: **what did I test, which locator strategy, which assertion, and what could make it flaky?**
