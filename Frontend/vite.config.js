import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 📡 Proxy 설정
    proxy: {
      // '/api'로 시작하는 요청이 오면 -> 백엔드(192.168.90.113:8080)로 토스해라!
      '/api': {
        target: 'http://192.168.90.113:8080', // 백엔드 팀원 컴퓨터 주소
        changeOrigin: true, // 호스트 헤더를 백엔드에 맞춰 변경 (CORS 에러 방지 필수)
        secure: false,      // http(보안X) 통신도 허용
      }
    }
  }
})
