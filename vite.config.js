import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-ml': {
        target: 'https://api.mercadolibre.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-ml/, '')
      },
      '/api-neon': {
        target: 'https://ep-gentle-hall-amii66wb.us-east-1.aws.neon.tech',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-neon/, '')
      }
    }
  }
})
