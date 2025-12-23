import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://jewellarystore.onrender.com', // Your Backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
})