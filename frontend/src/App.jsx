import { useEffect, useState } from 'react'

// 開發時 FastAPI 運行的位置。所有商品操作都會呼叫這個 API。
const API_URL = 'http://127.0.0.1:8000'

const emptyForm = { sku: '', name: '', price: '', quantity: '' }

function App() {
  // products: 商品清單；form: 使用者正在輸入的表單內容。
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)

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
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    })

    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault() // 避免表單送出後整個頁面重新整理。
    setMessage('')

    const productToCreate = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    }

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToCreate),
      })
      if (!response.ok) throw new Error('新增失敗，請確認所有欄位都正確填寫')

      const newProduct = await response.json()
      // 不必再重新載入全部資料，直接把後端回傳的新商品加到畫面上。
      setProducts([...products, newProduct])
      setForm(emptyForm)
      setMessage('商品已新增')
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
        <h2>新增商品</h2>
        <form className="product-form" onSubmit={handleSubmit}>
          <label>
            SKU
            <input name="sku" value={form.sku} onChange={handleChange} required />
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
          <button type="submit">新增商品</button>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="card">
        <h2>商品列表</h2>
        {isLoading ? (
          <p>載入中…</p>
        ) : (
          <table>
            <thead>
              <tr><th>SKU</th><th>商品名稱</th><th>價格</th><th>庫存數量</th><th>總價</th><th>操作</th></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>⭐ {product.name}</td>
                  <td>NT$ {product.price}</td>
                  <td>{product.quantity}</td>
                  <td> NT$ {product.price * product.quantity} </td>
                  <td><button onClick={() => handleEdit(product)}>編輯</button>  
                      <button className="delete-button" onClick={() => handleDelete(product.id)}>刪除</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="5">目前沒有商品</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

export default App
