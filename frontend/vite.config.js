import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// 컨테이너 안에서 dev 서버를 돌릴 때만 필요한 보정.
// docker-compose.dev.yml이 이 값을 준다
const inContainer = process.env.DOCKER_DEV === 'true'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
      // 컨테이너 밖(브라우저)에서 접속할 수 있게 0.0.0.0에 바인딩한다
      host: true,
      ...(inContainer && {
        // 브라우저는 nginx(80)를 통해 페이지를 받으므로, 핫리로드용 WebSocket도
        // 5173이 아니라 80으로 열어야 한다. 안 그러면 화면은 뜨는데 반영이 안 된다
        hmr: { clientPort: 80 },
        // macOS 호스트의 파일 변경 알림이 리눅스 컨테이너까지 넘어오지 않는
        // 경우가 있어, 수정시각을 직접 훑는 방식으로 감시한다
        watch: { usePolling: true },
      }),
      // 호스트에서 npm run dev만 돌릴 때 쓴다.
      // 컨테이너로 띄울 때는 nginx가 같은 역할을 하므로 타지 않는다
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws:true
        }
      }
  }
})
