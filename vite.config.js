import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/query': {
        target: 'https://ep-gentle-hall-amii66wb-pooler.c-5.us-east-1.aws.neon.tech',
        changeOrigin: true,
        rewrite: () => '/sql',
        headers: {
          'Neon-Connection-String': 'postgresql://neondb_owner:npg_lWzA8uLghEU0@ep-gentle-hall-amii66wb-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'
        }
      },
      '/api-ml': {
        target: 'https://api.mercadolibre.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-ml/, '')
      },
      '/bot': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bot/, '')
      }
    }
  }
})
