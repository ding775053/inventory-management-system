"""SQLAlchemy 資料表模型。

這裡描述「資料庫裡的商品長什麼樣子」，並不處理 API 請求或回應格式。
"""

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Product(Base):
    """對應 SQLite 中 products 資料表的一筆商品資料。"""

    # __tablename__ 決定 SQLite 中的資料表名稱。
    __tablename__ = "products"

    # mapped_column 定義每個欄位的資料型別與規則。
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sku: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
