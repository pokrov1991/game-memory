import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'
import VitePluginWebpCompress from 'vite-plugin-webp-compress'
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [react(), VitePluginWebpCompress()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.join(__dirname, 'dist/client'),
    rollupOptions: {
      input: {
        app: 'src/app/app.tsx',
        html: 'index.html',
      },
    },
  },
})
