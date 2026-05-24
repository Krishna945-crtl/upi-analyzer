import sqlite3
import os

# 📁 DB file path — backend folder lo eh untundi upi_analyzer.db
DB_PATH = os.path.join(os.path.dirname(__file__), "upi_analyzer.db")

# 🔌 DB connection teesukodaniki — every request ki fresh connection
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # 🗂️ dict style access — row['name'] easy ga
    return conn

# 🏗️ Tables create cheyyadam — app first start ainapudu run avutundi
def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 👤 Users table — register chesina users ikkade store avutaru
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT    NOT NULL,
            email    TEXT    UNIQUE NOT NULL,  -- duplicate emails block chestundi
            password TEXT    NOT NULL,         -- hashed password store avutundi
            created  TEXT    DEFAULT (datetime('now'))
        )
    ''')

    conn.commit()  # 💾 changes save cheyyadam
    conn.close()   # 🔒 connection close cheyyadam
    print("✅ Database initialized — tables ready!")