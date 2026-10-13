# 💸 UPI Analyzer

A full stack web application to analyze your bank spending patterns using CSV statements.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend (MERN) | Node.js + Express.js |
| Database (MERN) | MongoDB + Mongoose (aggregation pipelines for summaries) |
| Backend (original) | FastAPI + Python + SQLite |
| Charts | Recharts |
| Auth | JWT Tokens |
| Styling | Inline CSS + Theme System |
| DevOps | Docker (Alpine Linux images), docker-compose, nginx, GitHub Actions CI |
| Testing | Vitest + React Testing Library (frontend), node:test + Supertest (API) |

---

## ✨ Features

- 🔐 User Authentication — Register & Login with JWT
- ☁️ Saved Statements — each user's transactions stored in MongoDB, reloaded on next login
- 📊 Server-side Summary — `/transactions/summary` totals, category and monthly spend using MongoDB aggregation
- 📂 CSV Upload — Upload your bank statement
- 📊 Spending Analytics — Category wise breakdown
- 📈 Charts — Pie, Line, Bar charts
- 🔍 Filters — Search, Category, Debit/Credit
- 🎨 Theme Switcher — Light (Cream) & Dark (Blackish Green)
- 🏦 Multi-bank Support — SBI, HDFC, ICICI, Axis, Union Bank

---

## 🛠️ Setup & Run

### Everything with Docker (one command)
```bash
docker compose up --build
```
- Web app: http://localhost:5173 (React build served by nginx)
- API: http://localhost:8000 (Express on Node 22 Alpine, runs as a non-root user)
- MongoDB 7 with a named volume, so data survives restarts

GitHub Actions builds all three containers on every push, registers a test user through the API and checks nginx serves the app.

### Frontend tests
```bash
cd frontend
npm install
npm test        # 15 tests: CSV parsing, categories, login flow, protected routes, session storage
```

### Backend — Express + MongoDB (MERN)
```bash
cd server
npm install
cp .env.example .env      # put your MongoDB Atlas URI + JWT secret
npm run dev               # http://localhost:8000
npm test                  # 12 tests, uses an in-memory MongoDB
```

To point the frontend at it, create `frontend/.env` with `VITE_API_URL=http://localhost:8000`.

| Method | Route | What it does |
|---|---|---|
| POST | `/auth/register` | create account, returns JWT |
| POST | `/auth/login` | login, returns JWT |
| POST | `/transactions` | save a parsed statement (replaces the old one) |
| GET | `/transactions?category=&type=&q=` | list with filters + safe text search |
| GET | `/transactions/summary` | totals, spend by category, spend by month |
| DELETE | `/transactions` | clear my data |

### Backend — FastAPI (original)
```bash
cd backend
pip install fastapi uvicorn python-jose bcrypt pdfplumber email-validator
python -m uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```


Open `http://localhost:5173` in browser!

---

## 🧪 API Testing (Postman)

The Express API has a full Postman test suite in [`api-tests/`](api-tests/):

- **48 test cases**: positive, negative, boundary and security, documented in [`test-cases.xlsx`](api-tests/test-cases.xlsx) with expected vs actual results.
- **Postman regression collection**: 46 requests, 155 assertions, run by **Newman in GitHub Actions** against a real MongoDB on every push.
- Covers the JWT login flow, forged tokens, NoSQL and regex injection, upload limits (5,000 rows, 2 MB), filters and summary maths, and data isolation between users.
- **9 defects found and logged** in [`BUG_REPORTS.md`](api-tests/BUG_REPORTS.md), including 2 server crashes (HTTP 500). Each has a retest request in `open-defects.postman_collection.json`.

```bash
cd api-tests && npm install && npm test
```

---

## 📁 Project Structure