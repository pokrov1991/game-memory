import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import VitePluginWebpCompress from 'vite-plugin-webp-compress'

const platformApi = process.env.VITE_PLATFORM_API || 'desktop'
const platformAdapterByApi: Record<string, string> = {
  desktop: 'desktopPlatform',
  local: 'localPlatform',
  steam: 'steamPlatform',
  yandex: 'yandexPlatform',
}
const platformAdapter = platformAdapterByApi[platformApi] || platformAdapterByApi.desktop

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'electron/out/main',
      rollupOptions: {
        input: path.resolve(__dirname, 'electron/main.ts'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'electron/out/preload',
      rollupOptions: {
        input: path.resolve(__dirname, 'electron/preload.ts'),
      },
    },
  },
  renderer: {
    root: '.',
    base: './',
    plugins: [
      react(),
      VitePluginWebpCompress(),
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
    server: {
      port: 8080,
    },
    build: {
      outDir: 'electron/out/renderer',
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      },
    },
  },
})
