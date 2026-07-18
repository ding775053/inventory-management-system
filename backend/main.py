from itertools import count

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# 建立 FastAPI 應用程式；title 會顯示在 /docs 的 API 文件頁面。
app = FastAPI(title="簡易庫存管理系統 API")

# 開發時 React 前端運行在另一個網址（localhost:5173）。
# CORS 允許瀏覽器中的前端向這個後端發送請求。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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


class Product(ProductCreate):
    """完整商品資料：在新增資料的基礎上，再加上後端產生的 id。"""

    id: int


class ProductUpdate(BaseModel):
    """修改商品時可更新的資料格式。SKU 與 id 不允許在此 API 修改。"""

    name: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)


# 這個 list 就是暫時的「資料庫」。程式重啟時會重新回到下列初始資料。
products: list[Product] = [
    Product(id=1, sku="NOTEBOOK-001", name="筆記本", price=50, quantity=20),
    Product(id=2, sku="PEN-001", name="原子筆", price=15, quantity=100),
]
next_product_id = count(start=3)


@app.get("/products", response_model=list[Product])
def get_products():
    """回傳目前所有商品。"""
    return products


@app.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate):
    """把前端送來的商品加入記憶體清單，並回傳新增後的完整商品。"""
    new_product = Product(id=next(next_product_id), **product.model_dump())
    products.append(new_product)
    return new_product


@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product_update: ProductUpdate):
    """依 id 修改商品名稱、價格與庫存數量；找不到商品時回傳 404。"""
    for product in products:
        if product.id == product_id:
            product.name = product_update.name
            product.price = product_update.price
            product.quantity = product_update.quantity
            return product

    raise HTTPException(status_code=404, detail="找不到此商品")


@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int):
    """依 id 刪除商品；找不到時回傳 404 錯誤。"""
    for index, product in enumerate(products):
        if product.id == product_id:
            products.pop(index)
            return

    raise HTTPException(status_code=404, detail="找不到此商品")
