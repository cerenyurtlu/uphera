import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: {
      overlay: false  // Hata overlay'ini kapat
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Backend rotaları `/api` önekiyle tanımlı, bu yüzden rewrite kaldırıldı
      }
    }
  }
}) 