import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    hmr: false,
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; img-src 'self' data: blob: http: https:; style-src 'self' 'unsafe-inline' http: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' http: https: blob:; worker-src 'self' blob:; connect-src 'self' ws: wss: http: https:; object-src 'none'; base-uri 'self'",
    },
    proxy: {
      // Proxy /api to PHP backend so session cookies work (same-origin requests)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
})
