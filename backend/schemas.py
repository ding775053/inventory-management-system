"""Pydantic Schema（API 的資料格式與驗證規則）。"""

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    """前端新增商品時送來的資料格式。"""

    sku: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)


class ProductResponse(ProductCreate):
    """API 回傳的完整商品資料，包含由資料庫產生的 id。"""

    # 允許 Pydantic 將 SQLAlchemy Product 物件轉成 JSON 回應。
    model_config = ConfigDict(from_attributes=True)
    id: int


class ProductUpdate(BaseModel):
    """修改商品時可更新的資料格式。SKU 與 id 不允許在此 API 修改。"""

    name: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)
