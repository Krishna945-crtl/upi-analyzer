# 💸 UPI Analyzer

A full stack web application to analyze your bank spending patterns using CSV statements.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI + Python |
| Database | SQLite |
| Charts | Recharts |
| Auth | JWT Tokens |
| Styling | Inline CSS + Theme System |

---

## ✨ Features

- 🔐 User Authentication — Register & Login with JWT
- 📂 CSV Upload — Upload your bank statement
- 📊 Spending Analytics — Category wise breakdown
- 📈 Charts — Pie, Line, Bar charts
- 🔍 Filters — Search, Category, Debit/Credit
- 🎨 Theme Switcher — Light (Cream) & Dark (Blackish Green)
- 🏦 Multi-bank Support — SBI, HDFC, ICICI, Axis, Union Bank

---

## 🛠️ Setup & Run

### Backend
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

## 📁 Project Structure