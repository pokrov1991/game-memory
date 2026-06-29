/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLATFORM_API?: 'yandex' | 'local' | 'desktop'
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  desktopApi?: {
    platform: 'desktop'
    versions: {
      electron: string
      chrome: string
      node: string
    }
  }
}
