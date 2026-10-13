# 🧪 API Test Plan — UPI Analyzer

Manual + Postman testing of the Express/MongoDB API in `server/`.

| File | What it is |
|---|---|
| `upi-analyzer.postman_collection.json` | **Regression suite:** 46 requests, 155 assertions in 9 folders. Runs in CI on every push. |
| `open-defects.postman_collection.json` | One request per open bug. Each asserts the *correct* behaviour, so it fails until the bug is fixed. |
| `local.postman_environment.json` | `baseUrl` and the dev JWT secret. |
| `test-cases.xlsx` | 48 manual test cases with expected vs actual results, a defect log and a live summary. |
| `BUG_REPORTS.md` | 9 bug reports with steps, expected/actual, severity, priority and suggested fix. |

## 1. Scope

**In scope:** `POST /auth/register`, `POST /auth/login`, `POST /transactions`, `GET /transactions` (filters, search),
`GET /transactions/summary`, `DELETE /transactions`, JWT authorization, error handling.

**Out of scope:** the React frontend (it has its own Vitest suite), load testing, browser compatibility.

## 2. Approach

1. **Exploratory testing first.** I read the routes, then probed them by hand with Postman and curl: wrong types, empty values, boundaries, odd dates, forged tokens.
2. **Test design techniques:**
   - **Equivalence partitioning:** valid / invalid email, Debit / Credit / unknown type.
   - **Boundary values:** 5,000 vs 5,001 rows, 2 MB body limit, 300-character description cut, 1-character password.
   - **Negative testing:** missing fields, wrong data types, malformed JSON.
   - **Security checks:** no token, forged JWT (built in a pre-request script with CryptoJS), NoSQL injection in login, regex injection in search, user enumeration, data isolation between two users.
3. **Automation:** every passing case became a Postman request with `pm.test` assertions. A collection-level test checks that no response leaks a stack trace. Requests chain through collection variables (token from login → next requests), and fresh emails are created on each run, so the suite can be run again and again.
4. **Defects** go into `BUG_REPORTS.md` and the `Defects` sheet, each with a request in `open-defects` for retesting.

## 3. Results (October 2026)

| | |
|---|---|
| Test cases executed | 48 |
| Passed | 39 |
| Failed | 9, all logged as defects |
| Defects | 9 (5 Major, 4 Minor); 2 cause HTTP 500 errors |

Strong areas: authentication, authorization, input limits and data isolation all held up, including against forged tokens and injection attempts.
Weak areas: input validation for data types and amounts (BUG-01, 02, 05, 06, 07).

## 4. Run it

**Postman app:** Import both collections and the environment. Start the API (`cd server && npm start`, needs MongoDB). Select the environment and click **Run collection**.

**Command line (Newman):**
```bash
cd api-tests
npm install
npm test               # regression suite (should be all green)
npm run defects        # open defects (fails until the bugs are fixed)
```

CI (`.github/workflows/api-tests.yml`) starts MongoDB 7 and the API, then runs the regression suite with Newman and uploads a JUnit report.

## 5. Entry / exit criteria

- **Entry:** API starts, database reachable, health check `GET /` returns 200.
- **Exit:** all regression requests pass; every failure has a bug ID; no open P1 bug before a release (BUG-02 is open, so it blocks a release).
