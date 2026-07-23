"""商品的資料庫操作。

路由只負責接收 HTTP 請求；這個檔案負責實際讀寫 SQLite，
讓同一套資料庫操作可以被其他地方重複使用。
"""

from sqlalchemy.orm import Session

import models
import schemas


def get_products(db: Session) -> list[models.Product]:
    """依 id 順序取得所有商品。"""
    return db.query(models.Product).order_by(models.Product.id).all()


def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    """新增商品、提交交易，並取得 SQLite 自動產生的 id。"""
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


def update_product(
    db: Session,
    product_id: int,
    product_update: schemas.ProductUpdate,
) -> models.Product | None:
    """修改指定商品；若 id 不存在，回傳 None 交給路由回應 404。"""
    product = db.get(models.Product, product_id)
    if product is None:
        return None

    product.name = product_update.name
    product.price = product_update.price
    product.quantity = product_update.quantity
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> bool:
    """刪除指定商品；成功回傳 True，找不到商品回傳 False。"""
    product = db.get(models.Product, product_id)
    if product is None:
        return False

    db.delete(product)
    db.commit()
    return True


def add_initial_products_if_empty(db: Session):
    """只在全新、空白的資料庫中加入兩筆練習用商品。"""
    if db.query(models.Product).count() == 0:
        db.add_all([
            models.Product(sku="NOTEBOOK-001", name="筆記本", price=50, quantity=20),
            models.Product(sku="PEN-001", name="原子筆", price=15, quantity=100),
        ])
        db.commit()
