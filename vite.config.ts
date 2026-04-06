import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        lms: path.resolve(__dirname, 'lms/index.html'),
        legacyLmsEntry: path.resolve(__dirname, 'src/LMSindex.html'),
      },
    },
  },
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
    port: 3000,
    historyApiFallback: true
  }
})

