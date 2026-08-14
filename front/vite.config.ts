import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/invoices': 'http://localhost:3200',
      '/products': 'http://localhost:3200',
    },
  },
})
