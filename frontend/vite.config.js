import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 使用這份設定來知道要如何處理 React 的 JSX 檔案。
export default defineConfig({
  plugins: [react()],
})
