# 🚀 main.py — UPI Analyzer FastAPI backend, anni routes ikkade handle avutayi
from fastapi import FastAPI, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import pdfplumber
import io

from database import get_db, init_db  # 🗄️ DB functions
from auth import hash_password, verify_password, create_token  # 🔐 auth functions

# 🏗️ FastAPI app object create cheyyadam — idi main entry point
app = FastAPI(title="UPI Analyzer API", version="1.0.0")

# 🌐 CORS — Vercel frontend allow cheyyadam
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://upi-analyzer.vercel.app",
        "https://upi-analyzer-hmh61ku8j-krishna945-crtls-projects.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📋 Request body models — pydantic validation
class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

# 🏁 App startup lo DB initialize cheyyadam
@app.on_event("startup")
def startup():
    init_db()  # 🗄️ tables create cheyyadam
    print("🚀 UPI Analyzer backend started!")

# 🏠 Health check route — server running chustunnama
@app.get("/")
def root():
    return {"message": "UPI Analyzer API running! 💸", "status": "ok"}

# 📝 Register route — new user create cheyyadam
@app.post("/auth/register")
def register(req: RegisterRequest):
    conn   = get_db()
    cursor = conn.cursor()

    # 🔍 Email already exists check cheyyadam
    existing = cursor.execute(
        "SELECT id FROM users WHERE email = ?", (req.email,)
    ).fetchone()

    if existing:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please login."
        )

    # 🔒 Password hash cheyyadam — plain text store cheyykkaradu!
    hashed = hash_password(req.password)

    # 💾 DB lo insert cheyyadam
    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        (req.name, req.email, hashed)
    )
    conn.commit()

    # 🔍 Newly created user fetch cheyyadam
    user = cursor.execute(
        "SELECT * FROM users WHERE email = ?", (req.email,)
    ).fetchone()
    conn.close()

    # 🎫 Token create cheyyadam — auto login kosam
    token = create_token(user["id"], user["email"])

    # ✅ Success response
    return {
        "message": "Account created successfully!",
        "token":   token,
        "user": {
            "id":    user["id"],
            "name":  user["name"],
            "email": user["email"],
        }
    }

# 🔐 Login route — existing user authenticate cheyyadam
@app.post("/auth/login")
def login(req: LoginRequest):
    conn   = get_db()
    cursor = conn.cursor()

    # 🔍 Email tho user fetch cheyyadam
    user = cursor.execute(
        "SELECT * FROM users WHERE email = ?", (req.email,)
    ).fetchone()
    conn.close()

    # ❌ User not found
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # ❌ Wrong password check
    if not verify_password(req.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # 🎫 Valid credentials — token create cheyyadam
    token = create_token(user["id"], user["email"])

    # ✅ Success response
    return {
        "message": "Login successful!",
        "token":   token,
        "user": {
            "id":    user["id"],
            "name":  user["name"],
            "email": user["email"],
        }
    }

# 👥 All users list — testing kosam only! production lo remove cheyyi
@app.get("/users")
def get_users():
    conn  = get_db()
    users = conn.execute(
        "SELECT id, name, email, created FROM users"  # 🔒 password exclude cheyyadam!
    ).fetchall()
    conn.close()
    return {"users": [dict(u) for u in users]}

# 📄 PDF parse route — Union Bank format support
@app.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files accepted!")

    contents = await file.read()
    transactions = []
    row_id = 0

    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()

                for table in tables:
                    if not table or len(table) < 2:
                        continue

                    for row in table:
                        if not row or len(row) < 4:
                            continue

                        # 🔍 All cells string ga convert cheyyadam
                        cells = [str(c).strip() if c else '' for c in row]

                        # 📅 Date column detect — DD-MM-YYYY format
                        import re
                        date_val = ''
                        desc_val = 'Unknown'
                        amount_val = ''

                        for cell in cells:
                            # 📅 Date pattern check — DD-MM-YYYY or DD/MM/YYYY
                            if re.match(r'\d{2}[-/]\d{2}[-/]\d{4}', cell):
                                date_val = cell
                            # 💰 Amount pattern — number tho (Dr) or (Cr) untundi
                            elif re.search(r'\d+\.\d+\s*\((?:Dr|Cr)\)', cell):
                                amount_val = cell
                            # 📝 Description — UPIAB/ or UPIAR/ tho start avutundi
                            elif len(cell) > 10 and any(k in cell.upper() for k in ['UPI', 'NEFT', 'IMPS', 'ATM', 'RTGS']):
                                desc_val = cell

                        if not date_val or not amount_val:
                            continue  # 🔍 Valid transaction row ledu

                        # 💰 Amount parse — Dr ante debit, Cr ante credit
                        amount_match = re.search(r'([\d,]+\.?\d*)\s*\((Dr|Cr)\)', amount_val)
                        if not amount_match:
                            continue

                        amount = float(amount_match.group(1).replace(',', ''))
                        txn_type = amount_match.group(2)

                        debit  = amount if txn_type == 'Dr' else 0.0
                        credit = amount if txn_type == 'Cr' else 0.0

                        transactions.append({
                            'id':          row_id,
                            'date':        date_val,
                            'description': desc_val,
                            'debit':       debit,
                            'credit':      credit,
                            'category':    'Others',
                            'type':        'Debit' if debit > 0 else 'Credit',
                        })
                        row_id += 1

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF parse failed: {str(e)}")

    if not transactions:
        raise HTTPException(
            status_code=400,
            detail="No transactions found in PDF. Try CSV format instead!"
        )

    return {
        "message":      f"{len(transactions)} transactions extracted!",
        "transactions": transactions
    }
    
    # 📖 File bytes read cheyyadam
    contents = await file.read()

    transactions = []
    row_id = 0

    try:
        # 📄 pdfplumber tho PDF open cheyyadam
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                # 📋 Tables extract cheyyadam — bank statements lo tables untayi
                tables = page.extract_tables()

                for table in tables:
                    if not table:
                        continue

                    # 🔍 Header row detect cheyyadam
                    header = [str(h).strip().lower() if h else '' for h in table[0]]

                    # 🔍 Column index find cheyyadam
                    date_idx   = next((i for i, h in enumerate(header) if 'date' in h), None)
                    desc_idx   = next((i for i, h in enumerate(header) if any(k in h for k in ['desc', 'narration', 'particular', 'details', 'remarks'])), None)
                    debit_idx  = next((i for i, h in enumerate(header) if any(k in h for k in ['debit', 'dr', 'withdrawal'])), None)
                    credit_idx = next((i for i, h in enumerate(header) if any(k in h for k in ['credit', 'cr', 'deposit'])), None)

                    if date_idx is None or debit_idx is None:
                        continue  # 🔍 Valid table ledu — skip cheyyadam

                    # 🔄 Data rows process cheyyadam — header skip
                    for row in table[1:]:
                        if not row or all(cell is None or str(cell).strip() == '' for cell in row):
                            continue  # 🔍 Empty row skip

                        # 💰 Amount parse helper function
                        def get_amount(idx):
                            if idx is None or idx >= len(row):
                                return 0.0
                            val = str(row[idx] or '').replace(',', '').strip()
                            try:
                                return float(val) if val else 0.0
                            except:
                                return 0.0

                        debit  = get_amount(debit_idx)
                        credit = get_amount(credit_idx)
                        date   = str(row[date_idx] or '').strip() if date_idx < len(row) else ''
                        desc   = str(row[desc_idx] or 'Unknown').strip() if desc_idx is not None and desc_idx < len(row) else 'Unknown'

                        if not date:
                            continue  # 🔍 Date ledu ante skip cheyyadam

                        transactions.append({
                            'id':          row_id,
                            'date':        date,
                            'description': desc,
                            'debit':       debit,
                            'credit':      credit,
                            'category':    'Others',  # 🏷️ Frontend lo detect avutundi
                            'type':        'Debit' if debit > 0 else 'Credit',
                        })
                        row_id += 1

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PDF parse failed: {str(e)}"
        )

    # ❌ Transactions em ledu aithe error
    if not transactions:
        raise HTTPException(
            status_code=400,
            detail="No transactions found in PDF. Try CSV format instead!"
        )

    # ✅ Parsed transactions return cheyyadam
    return {
        "message":      f"{len(transactions)} transactions extracted!",
        "transactions": transactions
    }