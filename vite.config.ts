import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // React Fast Refresh 및 JSX 변환 지원
    react(),
    // Tailwind CSS v4 Vite 플러그인
    tailwindcss(),
  ],
})
