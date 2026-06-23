/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLATFORM_API?: 'yandex' | 'local'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
