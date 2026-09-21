import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 로컬 개발 시 /api 요청을 백엔드로 전달 (배포 환경에서는 nginx가 같은 역할을 한다)
  server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws:true
        }
      }
  }
})
