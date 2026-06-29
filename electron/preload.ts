import { contextBridge } from 'electron'

const desktopApi = {
  platform: 'desktop',
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
}

contextBridge.exposeInMainWorld('desktopApi', desktopApi)

export type DesktopApi = typeof desktopApi
