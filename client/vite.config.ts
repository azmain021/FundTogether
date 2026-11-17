import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In development, /api requests are forwarded to the NestJS server.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
