"""SQLite 資料庫的連線設定。

這個檔案只處理「如何連到資料庫」；商品資料表與 API 邏輯仍放在 main.py，
讓小型專案的結構維持簡單、容易閱讀。
"""

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# __file__ 是目前這個 database.py 的位置，因此資料庫檔會固定建立在 backend/。
DATABASE_PATH = Path(__file__).resolve().parent / "products.db"

# SQLite 使用本機檔案作為資料庫；as_posix() 可讓 SQLAlchemy 正確讀取 Windows 路徑。
DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"

# SQLite 搭配 FastAPI 時需要 check_same_thread=False，才能讓不同請求安全地使用連線。
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Session 是每次讀寫資料庫時使用的工作區。main.py 會在每個 API 函式內建立它。
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """所有 SQLAlchemy 資料表模型的共同基底。"""

