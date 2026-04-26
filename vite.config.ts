import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 서버 사이드에서만 환경 변수 로드 (클라이언트 번들에 포함되지 않음)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        // Notion API: CORS 우회 + 토큰 서버 측 주입
        '/api/notion': {
          target: 'https://api.notion.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/notion/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.NOTION_TOKEN}`)
              proxyReq.setHeader('Notion-Version', '2022-06-28')
            })
          },
        },
        // OpenAI API: CORS 우회 + API 키 서버 측 주입
        '/api/openai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/openai/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.OPENAI_API_KEY}`)
            })
          },
        },
      },
    },
  }
})
