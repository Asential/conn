jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn()
  }
}));
jest.mock('./browser-controller', () => ({
  connectToBrowser: jest.fn(),
  sendPromptToTab: jest.fn()
}));

const { setupIpcHandlers } = require('./ipc-handlers');
const { ipcMain } = require('electron');

describe('IPC Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupIpcHandlers();
  });

  it('should register connect-browser handler', () => {
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'connect-browser',
      expect.any(Function)
    );
  });

  it('should register send-prompt handler', () => {
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'send-prompt',
      expect.any(Function)
    );
  });
});