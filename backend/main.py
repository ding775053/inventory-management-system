from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import crud
import models  # 匯入模型後，Base 才知道要建立哪一張資料表。
from database import Base, SessionLocal, engine
from routers.products import router as products_router


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


def initialize_database():
    """第一次啟動時建立資料表，並在空資料庫放入兩筆練習用商品。"""
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        crud.add_initial_products_if_empty(db)


# 匯入 main.py 並啟動 FastAPI 時，確保 products.db 和 products 資料表都已準備好。
initialize_database()

# 將商品路由掛到主應用程式；實際路徑由 routers/products.py 的 prefix 決定。
app.include_router(products_router)
