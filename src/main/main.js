const { app, BrowserWindow } = require('electron');
const path = require('path');
const { setupIpcHandlers } = require('./ipc-handlers');

let mainWindow;

app.on('ready', () => {
  setupIpcHandlers();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.webContents.openDevTools();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});