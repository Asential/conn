const { ipcMain } = require('electron');

function setupIpcHandlers() {
  ipcMain.on('button-clicked', (event, data) => {
    console.log('Main process got:', data);
    event.reply('response', 'Hello from main process');
  });

  // Add more handlers here easily
  ipcMain.on('some-other-action', (event, data) => {
    console.log('Other action:', data);
    event.reply('other-response', 'Some response');
  });
}

module.exports = { setupIpcHandlers };