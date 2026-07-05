import { contextBridge, ipcRenderer } from 'electron'

const desktopApi = {
  platform: 'desktop',
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
}

contextBridge.exposeInMainWorld('desktopApi', desktopApi)

const steamApi = {
  isAvailable: () => ipcRenderer.invoke('steam:is-available') as Promise<boolean>,
  init: () => ipcRenderer.invoke('steam:init') as Promise<boolean>,
  getSteamId: () => ipcRenderer.invoke('steam:get-steam-id') as Promise<string | null>,
  getPersonaName: () => ipcRenderer.invoke('steam:get-persona-name') as Promise<string | null>,
  isOverlayAvailable: () => ipcRenderer.invoke('steam:is-overlay-available') as Promise<boolean>,
  openOverlay: (type?: string) => ipcRenderer.invoke('steam:open-overlay', type) as Promise<void>,
  unlockAchievement: (id: string) => ipcRenderer.invoke('steam:unlock-achievement', id) as Promise<void>,
  getAchievement: (id: string) => ipcRenderer.invoke('steam:get-achievement', id) as Promise<boolean>,
  setStat: (name: string, value: number) => ipcRenderer.invoke('steam:set-stat', name, value) as Promise<void>,
  getStat: (name: string) => ipcRenderer.invoke('steam:get-stat', name) as Promise<number>,
  storeStats: () => ipcRenderer.invoke('steam:store-stats') as Promise<void>,
  saveCloudFile: (name: string, data: string) => ipcRenderer.invoke('steam:save-cloud-file', name, data) as Promise<void>,
  readCloudFile: (name: string) => ipcRenderer.invoke('steam:read-cloud-file', name) as Promise<string | null>,
}

contextBridge.exposeInMainWorld('steamApi', steamApi)

export type DesktopApi = typeof desktopApi
export type SteamApi = typeof steamApi
