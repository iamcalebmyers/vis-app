import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// During `npm run dev`, Vite serves the frontend but doesn't run the
// serverless functions under api/. Proxy /api/* to the production
// Vercel deployment so search + geo data work locally without needing
// `vercel dev`. Override via VITE_API_PROXY env var to point elsewhere.
const API_PROXY = process.env.VITE_API_PROXY || 'https://vis-app-seven.vercel.app'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: API_PROXY,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
