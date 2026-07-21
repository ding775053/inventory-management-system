# 簡易庫存管理系統

這是練習用的庫存管理系統。前端用React顯示畫面，後端用FastAPI，商品資料儲存使用SQLite。

功能:修改商品、搜尋、低庫存警告。

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

## 前端 API 網址設定（Vite）

本機開發時，Vite 會自動讀取 `frontend/.env.development`。檔案中的 `VITE_API_URL` 指向本機 FastAPI：

```text
VITE_API_URL=http://127.0.0.1:8000
```

`App.jsx` 透過 `import.meta.env.VITE_API_URL` 取得這個值，因此不需要把 API 網址寫死在程式中。修改 `.env.development` 後，請重新啟動 `npm run dev`。

部署到 Cloudflare Pages 時，不要建立 `.env.production`。請在 Cloudflare 的 Pages 專案中前往 **Settings > Environment variables**，新增：

```text
VITE_API_URL=https://你的後端網域
```

儲存後重新部署。請填入可從瀏覽器公開連線的後端 HTTPS 網址；因為 `VITE_` 開頭的變數會提供給前端程式，請勿在這類變數中存放密碼或 API 金鑰。

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

## 本版尚未加入的功能

登入。
