import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import {
  getAchievement,
  getLeaderboard,
  getLeaderboardEntries,
  getPersonaName,
  getStat,
  getSteamId,
  enableSteamOverlayForElectron,
  initSteam,
  isOverlayAvailable,
  isSteamAvailable,
  openOverlay,
  readCloudFile,
  saveCloudFile,
  setLeaderboardScore,
  setStat,
  storeStats,
  unlockAchievement,
} from './steam'

const isDev = Boolean(process.env.ELECTRON_RENDERER_URL)

enableSteamOverlayForElectron()

ipcMain.handle('steam:is-available', () => isSteamAvailable())
ipcMain.handle('steam:init', () => initSteam())
ipcMain.handle('steam:get-steam-id', () => getSteamId())
ipcMain.handle('steam:get-persona-name', () => getPersonaName())
ipcMain.handle('steam:is-overlay-available', () => isOverlayAvailable())
ipcMain.handle('steam:open-overlay', (_event, type?: string) => openOverlay(type))
ipcMain.handle('steam:unlock-achievement', (_event, id: string) => unlockAchievement(id))
ipcMain.handle('steam:get-achievement', (_event, id: string) => getAchievement(id))
ipcMain.handle('steam:set-stat', (_event, name: string, value: number) => setStat(name, value))
ipcMain.handle('steam:get-stat', (_event, name: string) => getStat(name))
ipcMain.handle('steam:store-stats', () => storeStats())
ipcMain.handle('steam:save-cloud-file', (_event, name: string, data: string) => saveCloudFile(name, data))
ipcMain.handle('steam:read-cloud-file', (_event, name: string) => readCloudFile(name))
ipcMain.handle('steam:get-leaderboard', (_event, leaderboardName: string) => getLeaderboard(leaderboardName))
ipcMain.handle('steam:set-leaderboard-score', (_event, leaderboardName: string, score: number, extraData?: string) => setLeaderboardScore(leaderboardName, score, extraData))
ipcMain.handle('steam:get-leaderboard-entries', (_event, leaderboardName: string, options) => getLeaderboardEntries(leaderboardName, options))
ipcMain.handle('app:quit', () => app.quit())

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    show: false,
    autoHideMenuBar: true,
    fullscreenable: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return

    if (input.key === 'F11') {
      event.preventDefault()
      mainWindow.setFullScreen(!mainWindow.isFullScreen())
      return
    }

    if (process.env.VITE_PLATFORM_API === 'steam' && input.key === 'Tab' && input.shift) {
      event.preventDefault()
      openOverlay('friends')
    }
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    return
  }

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
