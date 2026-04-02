import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@admin': path.resolve(__dirname, './src/admin'),
      '@student': path.resolve(__dirname, './src/student'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
  server: {
    port: 3000
  }
})

