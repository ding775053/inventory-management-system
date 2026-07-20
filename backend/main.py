from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base, SessionLocal, engine


# 建立 FastAPI 應用程式；title 會顯示在 /docs 的 API 文件頁面。
app = FastAPI(title="簡易庫存管理系統 API")

# 開發時 React 前端運行在另一個網址（localhost:5173）。
# CORS 允許瀏覽器中的前端向這個後端發送請求。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
                   "https://inventory-management-system-3vh.pages.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProductCreate(BaseModel):
    """前端新增商品時送來的資料格式。"""

    sku: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)


class ProductTable(Base):
    """products 資料表的 SQLAlchemy 模型，欄位會儲存在 SQLite 檔案中。"""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sku: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)


class Product(ProductCreate):
    """完整商品資料：在新增資料的基礎上，再加上後端產生的 id。"""

    # 允許 Pydantic 直接把 ProductTable 物件轉換成 API 回應 JSON。
    model_config = ConfigDict(from_attributes=True)
    id: int


class ProductUpdate(BaseModel):
    """修改商品時可更新的資料格式。SKU 與 id 不允許在此 API 修改。"""

    name: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)


def initialize_database():
    """第一次啟動時建立資料表，並在空資料庫放入兩筆練習用商品。"""
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        # 只有資料表完全沒有商品時才加入範例資料，之後重啟不會重複新增。
        if db.query(ProductTable).count() == 0:
            db.add_all([
                ProductTable(sku="Water-001", name="水", price=50, quantity=20),
                ProductTable(sku="SHIBA-001", name="柴柴", price=1000000, quantity=1),
                ProductTable(sku="Nissan-001", name="Tiida", price=188000, quantity=3),                
            ])
            db.commit()


# 匯入 main.py 並啟動 FastAPI 時，確保 products.db 和 products 資料表都已準備好。
initialize_database()


@app.get("/products", response_model=list[Product])
def get_products():
    """回傳目前所有商品。"""
    with SessionLocal() as db:
        return db.query(ProductTable).order_by(ProductTable.id).all()


@app.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate):
    """把前端送來的商品寫入 SQLite，並回傳新增後含 id 的完整商品。"""
    with SessionLocal() as db:
        new_product = ProductTable(**product.model_dump())
        db.add(new_product)
        db.commit()
        db.refresh(new_product)  # 取得 SQLite 自動產生的 id。
        return new_product


@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product_update: ProductUpdate):
    """依 id 修改商品名稱、價格與庫存數量；找不到商品時回傳 404。"""
    with SessionLocal() as db:
        product = db.get(ProductTable, product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="找不到此商品")

        product.name = product_update.name
        product.price = product_update.price
        product.quantity = product_update.quantity
        db.commit()
        db.refresh(product)
        return product


@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int):
    """依 id 刪除商品；找不到時回傳 404 錯誤。"""
    with SessionLocal() as db:
        product = db.get(ProductTable, product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="找不到此商品")

        db.delete(product)
        db.commit()

