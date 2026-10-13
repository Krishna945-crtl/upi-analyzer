# 🐞 Bug Reports — UPI Analyzer API

Found during exploratory and Postman testing of the Express API (`server/`), October 2026.
Every bug has a request in `open-defects.postman_collection.json` that **fails today and passes once it is fixed**,
so retesting a fix is one command:

```bash
npx newman run open-defects.postman_collection.json -e local.postman_environment.json
```

**Environment:** Node 22 · Express 4.21 · Mongoose 8 · MongoDB 7 · Postman / Newman 6.2 · API on `http://localhost:8000`

| ID | Title | Severity | Priority | Status |
|---|---|---|---|---|
| BUG-01 | Register accepts a 1-character password | Major | P2 | Open |
| BUG-02 | Numeric password crashes the server (HTTP 500) | Major | P1 | Open |
| BUG-03 | No maximum length on name | Minor | P3 | Open |
| BUG-04 | Register rejects email with surrounding spaces, login accepts it | Minor | P3 | Open |
| BUG-05 | Negative amount silently saved as 0 | Major | P2 | Open |
| BUG-06 | Invalid date accepted; monthly totals stop matching the total | Major | P2 | Open |
| BUG-07 | Row with both debit and credit counted as spend and income | Minor | P3 | Open |
| BUG-08 | Token with a non-ObjectId user id crashes (HTTP 500) | Major | P2 | Open |
| BUG-09 | Lower-case `bearer` auth scheme rejected | Minor | P3 | Open |

Severity = impact on users/data. Priority = how soon to fix (P1 first). BUG-02 is P1 because any client can trigger a server error with one request.

---

### BUG-01 — Register accepts a 1-character password
- **Severity / Priority:** Major / P2 · **Test case:** TC-11
- **Steps:** `POST /auth/register` with `{"name":"A","email":"a1@test.com","password":"1"}`
- **Expected:** `422` with a message like "Password must be at least 8 characters."
- **Actual:** `201 Account created successfully!` — the account is created with password `1`.
- **Impact:** accounts with trivially guessable passwords; no password policy at all.
- **Suggested fix:** validate `typeof password === 'string' && password.length >= 8` in `routes/auth.js`.

### BUG-02 — Numeric password crashes the server (HTTP 500)
- **Severity / Priority:** Major / P1 · **Test case:** TC-12
- **Steps:** `POST /auth/register` with `{"name":"N","email":"num@test.com","password":123456}` (number, not string)
- **Expected:** `422` validation error.
- **Actual:** `500 {"detail":"Something went wrong on the server."}` — `bcrypt.hash()` throws on a non-string.
- **Impact:** unhandled exception path; a client mistake shows up as a server failure in monitoring.
- **Suggested fix:** reject non-string `name`, `email`, `password` with `422` before hashing.

### BUG-03 — No maximum length on name
- **Severity / Priority:** Minor / P3 · **Test case:** TC-13
- **Steps:** register with a 5,000-character `name`.
- **Expected:** `422` (e.g. max 60 characters).
- **Actual:** `201` — the full 5,000 characters are stored and returned in every login response.
- **Suggested fix:** limit `name` length (the transaction fields already have limits: description 300, category 40).

### BUG-04 — Register rejects email with surrounding spaces, login accepts it
- **Severity / Priority:** Minor / P3 · **Test case:** TC-14
- **Steps:** register with `" spaced@test.com "` (copy-pasted email with spaces).
- **Expected:** `201` — spaces trimmed, same as login, which already trims.
- **Actual:** `422 Please enter a valid email.` The regex runs on the untrimmed value.
- **Suggested fix:** `email = email.trim()` before the regex check.

### BUG-05 — Negative amount silently saved as 0
- **Severity / Priority:** Major / P2 · **Test case:** TC-33
- **Steps:** `POST /transactions` with `[{"date":"01/03/2026","description":"REFUND","debit":-500}]`, then `GET /transactions`.
- **Expected:** `422`, or the refund stored as a ₹500 credit.
- **Actual:** `201 1 transactions saved!` and the row comes back as `debit: 0, credit: 0, type: "Credit"`. The ₹500 disappears from every total without any warning.
- **Root cause:** `num()` in `routes/transactions.js` turns every value ≤ 0 into 0.
- **Suggested fix:** reject negative values with a row-level error, or map a negative debit to a positive credit.

### BUG-06 — Invalid date accepted; monthly totals stop matching the total
- **Severity / Priority:** Major / P2 · **Test case:** TC-34
- **Steps:** upload `[{"date":"hello","description":"X","debit":10}]`, then `GET /transactions/summary`.
- **Expected:** `422` for an unreadable date.
- **Actual:** `201`. The summary shows `totalSpent: 10` but `byMonth: []`, so the monthly chart no longer adds up to the total.
- **Suggested fix:** reject rows where `toMonth(date)` is `null`, or add an "Unknown month" bucket.

### BUG-07 — Row with both debit and credit counted as spend and income
- **Severity / Priority:** Minor / P3 · **Test case:** TC-35
- **Steps:** upload `[{"date":"01/03/2026","description":"WEIRD","debit":100,"credit":200}]`.
- **Expected:** `422` — a bank row is either a debit or a credit.
- **Actual:** `201`, `type: "Debit"`, and the summary adds 100 to spent **and** 200 to received.
- **Suggested fix:** reject rows where both are > 0.

### BUG-08 — Token with a non-ObjectId user id crashes (HTTP 500)
- **Severity / Priority:** Major / P2 · **Test case:** TC-25
- **Steps:** sign a JWT `{"sub":"not-an-object-id"}` with the server secret, then call `GET /transactions` and `GET /transactions/summary`.
- **Expected:** `401 Invalid or expired token.`
- **Actual:** `500` on both endpoints (Mongoose `CastError`).
- **Impact:** needs the secret to exploit, so the risk is low; but token payloads from old versions or other services would crash requests instead of logging the user out.
- **Suggested fix:** in `requireAuth`, check `mongoose.isValidObjectId(sub)` and return `401`.

### BUG-09 — Lower-case `bearer` auth scheme rejected
- **Severity / Priority:** Minor / P3 · **Test case:** TC-24
- **Steps:** `GET /transactions` with header `Authorization: bearer <valid token>`.
- **Expected:** `200` — HTTP auth schemes are case-insensitive (RFC 7235 §2.1).
- **Actual:** `401 Login required.`
- **Suggested fix:** compare `scheme.toLowerCase() === 'bearer'`.

---

### Observation (not logged as a bug)
- A name like `<script>alert(1)</script>` is stored as-is. React escapes it on screen, so it is not exploitable in this frontend; but any future HTML email or admin page would need to escape it. Recommend trimming/sanitising names on input.
