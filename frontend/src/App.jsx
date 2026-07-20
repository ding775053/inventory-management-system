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
      <h1>簡易庫存管理系統</h1>
      <p className="intro">第一版：查看、新增與刪除商品</p>

      <section className="card">
        <h2>{editingId !== null ? '更新商品' : '新增商品'}</h2>
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
          <button type="submit">{editingId !== null ? '更新商品' : '新增商品'}</button>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="card">
        <h2>商品列表</h2>
        <label>
          搜尋 SKU 或商品名稱
          {/* onChange 會更新 state，React 因此立刻重新計算 filteredProducts。 */}
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="例如：PEN-001 或 原子筆"
          />
        </label>
        {isLoading ? (
          <p>載入中…</p>
        ) : (
          <table>
            <thead>
              <tr><th>SKU</th><th>商品名稱</th><th>價格</th><th>庫存數量</th><th>總價</th><th>狀態</th><th>操作</th></tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>⭐ {product.name}</td>
                  <td>NT$ {product.price}</td>
                  {/* quantity 小於 10 時加入 low-stock class，讓 CSS 將文字顯示為紅色。 */}
                  <td className={product.quantity < 10 ? 'low-stock' : ''}>{product.quantity}</td>
                  <td> NT$ {product.price * product.quantity} </td>
                  {/* 三元運算子會依庫存數量，在兩種狀態文字中選擇一個顯示。 */}
                  <td>{product.quantity < 10 ? '⚠️ 庫存不足' : '正常'}</td>
                  <td><button onClick={() => handleEdit(product)}>編輯</button>  
                      <button className="delete-button" onClick={() => handleDelete(product.id)}>刪除</button>
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
        )}
      </section>
    </main>
  )
}

export default App
