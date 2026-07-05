import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import dotenv from 'dotenv'
import VitePluginWebpCompress from 'vite-plugin-webp-compress'

dotenv.config()

const platformApi = process.env.VITE_PLATFORM_API || 'local'
const platformAdapterByApi: Record<string, string> = {
  desktop: 'desktopPlatform',
  local: 'localPlatform',
  steam: 'steamPlatform',
  yandex: 'yandexPlatform',
}
const platformAdapter = platformAdapterByApi[platformApi] || platformAdapterByApi.local

export default defineConfig({
  base: './',

  server: {
    port: 8080,
    https: true,
  },

  plugins: [
    react(),
    VitePluginWebpCompress(),
    basicSsl(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@platform-adapter': path.resolve(
        __dirname,
        `./src/shared/services/platform/adapters/${platformAdapter}.ts`
      ),
    },
  },

  build: {
    outDir: 'dist',
  },
})
