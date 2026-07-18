# 簡易庫存管理系統

這是一個給初學者練習的全端 Web App。前端用 React 顯示畫面，後端用 FastAPI 提供 API；商品資料暫時儲存在 Python 記憶體，因此後端重啟後資料會回到預設值。

## 專案結構

```text
inventory-manager/
├── backend/                 # Python / FastAPI 後端
│   ├── main.py              # API 與記憶體資料
│   └── requirements.txt     # Python 套件清單
└── frontend/                # React 前端
    ├── src/
    │   ├── App.jsx          # 主要畫面與互動邏輯
    │   ├── main.jsx         # React 的進入點
    │   └── index.css        # 畫面樣式
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 先決條件

- 安裝 Python 3.10 或以上：在終端機輸入 `python --version` 確認。
- 安裝 Node.js 18 或以上（會一併提供 npm）：輸入 `node --version` 確認。

## 第一次啟動：後端

開啟第一個 PowerShell 視窗，切到此專案的 `backend` 資料夾：

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

看到 `Uvicorn running on http://127.0.0.1:8000` 就代表後端成功啟動。可開啟 http://127.0.0.1:8000/docs 查看 FastAPI 自動產生的 API 文件。

> 若 PowerShell 阻擋啟用虛擬環境，可在該 PowerShell 視窗先執行：`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`，再重新執行啟用指令。

## 第一次啟動：前端

保持後端視窗運行，另開第二個 PowerShell 視窗，切到專案的 `frontend` 資料夾：

```powershell
cd frontend
npm install
npm run dev
```

終端機會顯示網址，通常是 http://localhost:5173 。在瀏覽器打開它即可使用系統。

## 日後啟動

已安裝過套件後，只需各開一個終端機：

```powershell
# 視窗一：backend
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

```powershell
# 視窗二：frontend
cd frontend
npm run dev
```

## API 一覽

| 方法 | 路徑 | 用途 |
| --- | --- | --- |
| `GET` | `/products` | 取得所有商品 |
| `POST` | `/products` | 新增商品 |
| `DELETE` | `/products/{product_id}` | 刪除指定商品 |

## 本版刻意尚未加入的功能

資料庫、登入、修改商品、搜尋與庫存扣減都先不加入。先理解「前端透過 API 對後端請求資料」這條主線後，再逐步擴充會更容易。
