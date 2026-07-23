import { useEffect, useState } from 'react'

// Vite 會讀取 .env.development 中以 VITE_ 開頭的變數，讓不同環境使用不同 API 網址。
const API_URL = import.meta.env.VITE_API_URL

const emptyForm = { sku: '', name: '', price: '', quantity: '' }

function App() {
  // products: 商品清單；form: 使用者正在輸入的表單內容。
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  // 使用者每次輸入時，依 SKU 或商品名稱立即產生要顯示的新商品清單。
  const normalizedSearchKeyword = searchKeyword.trim().toLowerCase()
  const filteredProducts = products.filter((product) => (
    product.sku.toLowerCase().includes(normalizedSearchKeyword)
    || product.name.toLowerCase().includes(normalizedSearchKeyword)
  ))

  // 統計卡片直接從目前商品清單計算，因此新增、更新或刪除後會自動更新數字。
  const lowStockCount = products.filter((product) => product.quantity < 10).length
  const totalInventoryValue = products.reduce(
    (total, product) => total + (product.price * product.quantity),
    0,
  )

  // 元件第一次顯示時，從後端載入商品列表。
  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/products`)
      if (!response.ok) throw new Error('無法取得商品資料')

      const data = await response.json()
      setProducts(data)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 每次輸入欄位變動時，只更新對應欄位的 state。
  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  function handleEdit(product) {
    setEditingId(product.id)

    setForm({
      sku: product.sku,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    })

    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault() // 避免表單送出後整個頁面重新整理。
    setMessage('')

    const productToSave = {
      name: form.name.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    }

    try {
      const isEditing = editingId !== null
      const response = await fetch(
        isEditing ? `${API_URL}/products/${editingId}` : `${API_URL}/products`,
        {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? productToSave : { ...productToSave, sku: form.sku.trim() }),
        },
      )
      if (!response.ok) throw new Error(isEditing ? '更新失敗，請確認所有欄位都正確填寫' : '新增失敗，請確認所有欄位都正確填寫')

      const savedProduct = await response.json()
      if (isEditing) {
        // map 會以後端回傳的更新資料，取代列表中相同 id 的商品。
        setProducts(products.map((product) => product.id === savedProduct.id ? savedProduct : product))
      } else {
        // 不必再重新載入全部資料，直接把後端回傳的新商品加到畫面上。
        setProducts([...products, savedProduct])
      }
      setForm(emptyForm)
      setEditingId(null)
      setMessage(isEditing ? '商品已更新' : '商品已新增')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleDelete(productId) {
    const confirmed = window.confirm('確定要刪除這個商品嗎？')
    if (!confirmed) return

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('刪除失敗')

      // filter 會建立一份不含已刪除商品的新陣列，React 因此會更新畫面。
      setProducts(products.filter((product) => product.id !== productId))
      setMessage('商品已刪除')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <main className="page-container">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">INVENTORY CONTROL</p>
          <h1>簡易庫存管理系統</h1>
          <p className="intro">即時掌握商品、庫存與價值</p>
        </div>
        <div className="header-badge">管理後台</div>
      </header>

      <section className="search-panel" aria-label="搜尋商品">
        {/* 內嵌 SVG 是純 React 寫法，不需要額外安裝圖示套件。 */}
        <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          type="search"
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
          placeholder="搜尋 SKU 或商品名稱，例如：WATER-001"
          aria-label="搜尋 SKU 或商品名稱"
        />
      </section>

      <section className="stats-grid" aria-label="庫存統計">
        <article className="stat-card stat-card-blue">
          <div><p>商品總數</p><strong>{products.length}</strong><span>項商品</span></div>
          <span className="stat-icon">▦</span>
        </article>
        <article className="stat-card stat-card-amber">
          <div><p>低庫存商品</p><strong>{lowStockCount}</strong><span>項需留意</span></div>
          <span className="stat-icon">!</span>
        </article>
        <article className="stat-card stat-card-green">
          <div><p>總庫存價值</p><strong>NT$ {totalInventoryValue.toLocaleString()}</strong><span>價格 × 庫存</span></div>
          <span className="stat-icon">$</span>
        </article>
      </section>

      <section className="card product-editor">
        <div className="section-heading">
          <div>
            <p className="section-kicker">PRODUCT FORM</p>
            <h2>{editingId !== null ? '更新商品' : '新增商品'}</h2>
          </div>
        </div>
        <form className="product-form" onSubmit={handleSubmit}>
          <label>
            SKU
            <input name="sku" value={form.sku} onChange={handleChange} required disabled={editingId !== null} />
          </label>
          <label>
            商品名稱
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            價格
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
          </label>
          <label>
            庫存數量
            <input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={handleChange} required />
          </label>
          <button className="primary-button" type="submit">
            {editingId !== null ? '儲存更新' : '新增商品'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="card product-table-card">
        <div className="section-heading table-heading">
          <div>
            <p className="section-kicker">PRODUCT LIST</p>
            <h2>商品列表</h2>
          </div>
          <span className="result-count">顯示 {filteredProducts.length} 項</span>
        </div>
        {isLoading ? (
          <p className="loading-text">載入中…</p>
        ) : (
          <div className="table-wrapper">
            <table>
            <thead>
              <tr><th>SKU</th><th>商品名稱</th><th>價格</th><th>庫存數量</th><th>總價</th><th>狀態</th><th>操作</th></tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td className="product-name">{product.name}</td>
                  <td>NT$ {product.price}</td>
                  {/* quantity 小於 10 時加入 low-stock class，讓 CSS 將文字顯示為紅色。 */}
                  <td className={product.quantity < 10 ? 'low-stock' : ''}>{product.quantity}</td>
                  <td>NT$ {(product.price * product.quantity).toLocaleString()}</td>
                  {/* 三元運算子會依庫存數量，在兩種狀態文字中選擇一個顯示。 */}
                  <td><span className={product.quantity < 10 ? 'status status-warning' : 'status status-normal'}>{product.quantity < 10 ? '⚠️ 庫存不足' : '正常'}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-button" type="button" onClick={() => handleEdit(product)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" /><path d="m13 8 3 3" /></svg>
                        編輯
                      </button>
                      <button className="delete-button" type="button" onClick={() => handleDelete(product.id)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13" /></svg>
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7">
                    {searchKeyword.trim() ? '找不到符合的商品' : '目前沒有商品'}
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
