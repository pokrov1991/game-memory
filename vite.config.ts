import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path'
import dotenv from 'dotenv'
import VitePluginWebpCompress from 'vite-plugin-webp-compress'
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    https: true
  },
  plugins: [react(), VitePluginWebpCompress(), basicSsl()],
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
