const electron = require('electron')
const path = require('path')
const fs = require('fs')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 700,
    frame: false,
    autoHideMenuBar: true,
    title: app.getName(),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'browser.js'),
      nodeIntegration: false
    }
  })

  mainWindow.setResizable(false)
  mainWindow.loadURL('https://mobile.twitter.com/notifications')

  const page = mainWindow.webContents

  const menu = require('./menu')

  page.on('dom-ready', () => {
    const file = path.join(__dirname, 'browser.css')
    page.insertCSS(fs.readFileSync(file, 'utf8'))
    mainWindow.show()
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('activate', () => {
  mainWindow.show()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

