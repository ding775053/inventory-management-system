"""商品 API 路由。

這個檔案保留 HTTP 路徑、驗證與錯誤回應；實際資料庫操作交由 crud.py。
"""

from fastapi import APIRouter, HTTPException, status

import crud
import schemas
from database import SessionLocal


# prefix 讓以下所有路由都以 /products 開頭，API 網址和重構前完全相同。
router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[schemas.ProductResponse])
def get_products():
    """回傳目前所有商品。"""
    with SessionLocal() as db:
        return crud.get_products(db)


@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate):
    """把前端送來的商品寫入 SQLite，並回傳新增後含 id 的完整商品。"""
    with SessionLocal() as db:
        return crud.create_product(db, product)


@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, product_update: schemas.ProductUpdate):
    """依 id 修改商品名稱、價格與庫存數量；找不到商品時回傳 404。"""
    with SessionLocal() as db:
        product = crud.update_product(db, product_id, product_update)
        if product is None:
            raise HTTPException(status_code=404, detail="找不到此商品")
        return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int):
    """依 id 刪除商品；找不到時回傳 404 錯誤。"""
    with SessionLocal() as db:
        if not crud.delete_product(db, product_id):
            raise HTTPException(status_code=404, detail="找不到此商品")
