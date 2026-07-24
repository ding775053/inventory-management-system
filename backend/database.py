"""PostgreSQL 資料庫的連線設定。

這個檔案只處理「如何連到資料庫」；資料表、資料庫操作與 API 路由
分別放在 models.py、crud.py 與 routers/products.py，讓職責更清楚。
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# __file__ 是目前這個檔案的位置；因此可穩定讀取 backend/.env，不受啟動資料夾影響。
ENV_FILE = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_FILE)

# 連線字串由 .env 提供，避免將帳號與密碼直接寫在 Python 原始碼中。
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "找不到 DATABASE_URL。請將 backend/.env.example 複製為 backend/.env，並填入 PostgreSQL 密碼。"
    )

# pool_pre_ping=True 會在使用連線前確認連線仍有效，適合長時間運行的 API。
# psycopg2-binary 是 PostgreSQL 的 Python 驅動，供這個 postgresql+psycopg2 連線字串使用。
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Session 是每次讀寫資料庫時使用的工作區。main.py 會在每個 API 函式內建立它。
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """所有 SQLAlchemy 資料表模型的共同基底。"""
