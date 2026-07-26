const { ipcMain } = require('electron');
const { connectToBrowser, sendPromptToTab, tabs } = require('./browser-controller');

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

  ipcMain.handle('connect-browser', async () => {
    try {
      const availableTabs = await connectToBrowser();
      return { success: true, tabs: availableTabs };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('send-prompt', async (event, { tab, prompt }) => {
    try {
      const response = await sendPromptToTab(tab, prompt);
      return { success: true, response };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { setupIpcHandlers };