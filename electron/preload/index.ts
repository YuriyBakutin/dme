import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
// import { ExportProgress } from '../../node_modules/dexie-export-import/dist/export'

// Custom APIs for renderer
const api = {
  getFolderPath: (params: {
    title: string,
    folderPath: string,
  }) => ipcRenderer.invoke('getFolderPath', params),
  openFolder: (params: {
    folderPath: string,
  }) => ipcRenderer.invoke('openFolder', params),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
