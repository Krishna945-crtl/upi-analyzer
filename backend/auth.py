# 🔐 auth.py — JWT tokens + password hashing, bcrypt direct use chestunnamu
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, status

# 🗝️ JWT config
SECRET_KEY = "upi_analyzer_secret_kittu_2024"
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 24  # ⏰ 24 gantalu valid

# 🔑 Plain password → hashed — register lo use chestam
def hash_password(password: str) -> str:
    # 🔒 72 bytes limit fix — encode cheyyadam
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

# ✅ Login lo password verify cheyyadam
def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        plain.encode('utf-8'),
        hashed.encode('utf-8')
    )

# 🎫 JWT token create cheyyadam
def create_token(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {
        "sub":   str(user_id),
        "email": email,
        "exp":   expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# 🔍 Token verify cheyyadam — protected routes lo
def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please login again."
        )