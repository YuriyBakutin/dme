import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { dirname, basename, join } from 'path'
import openExplorer from 'open-file-explorer'
import * as fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

let mainWindow

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const selectFolder = (params: {
  title: string,
  defaultPath: string,
  buttonLabel: string,
}) => {
  return dialog.showOpenDialogSync(
    mainWindow,
    {
      title: params.title,
      defaultPath: params.defaultPath,
      buttonLabel: params.buttonLabel,
      properties: ['openDirectory', 'dontAddToRecent'],
    }
  )
}

const getExistingFolder = (folderPath: string, folderStack: string[] = []) => {
  if (!folderPath) {
    return null
  }

  if (!fs.existsSync(folderPath)) {
    folderStack.unshift(basename(folderPath))
    return getExistingFolder(dirname(folderPath), folderStack)
  } else {
    return { folderPath, folderStack }
  }
}

// const makeRealFolderPath = (baseFolderPath: string) => {
//   // Если каких-то папок в baseFolderPath не существует, они будут созданы.
//   // Определяем, какие папки есть (folderPath),
//   // а какие нужно создать (folderStack)
//   const result = getExistingFolder(baseFolderPath)

//   if (!result) {
//     return
//   }

//   let { folderPath, folderStack } = result

//   // Создаём отсутствующие папки
//   folderStack.forEach(
//     (item) => {
//       folderPath = join(folderPath, item)
//       fs.mkdirSync(folderPath)
//     }
//   )
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('getFolderPath', (_, params) => {
    return selectFolder({
      title: params.title,
      defaultPath: params.folderPath,
      buttonLabel: 'Сохранять здесь',
    })
  })

  ipcMain.handle('openFolder', async (_, params: {
    folderPath: string,
  }) => {
    openExplorer(params.folderPath, (err) => {
      if (err) {
        throw err
      }
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
