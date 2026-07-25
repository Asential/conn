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

  ipcMain.on("send-prompt", (event, data) => {
    console.log("Received prompt:", data.prompt);
    event.reply('send-prompt-response', 'Some response');
  });
}

module.exports = { setupIpcHandlers };