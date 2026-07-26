jest.mock('puppeteer', () => ({
  connect: jest.fn(),
  launch: jest.fn()
}));

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
  spawn: jest.fn()
}));

describe('Browser Controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('launchEdgeDebugging', () => {
    it('should report already-running when Edge debugging is already available', async () => {
      const puppeteer = require('puppeteer');
      const { launchEdgeDebugging } = require('./browser-controller');

      puppeteer.connect.mockResolvedValue({
        disconnect: jest.fn().mockResolvedValue(undefined)
      });

      const result = await launchEdgeDebugging();

      expect(result).toEqual({
        launched: false,
        status: 'available',
        isRunning: true,
        endpoint: 'ws://127.0.0.1:9222/devtools/browser'
      });
    });

    it('should launch a new Edge process when the debug endpoint is not available', async () => {
      const puppeteer = require('puppeteer');
      const childProcess = require('child_process');
      const { launchEdgeDebugging } = require('./browser-controller');

      puppeteer.connect
        .mockRejectedValueOnce(new Error('not ready'))
        .mockResolvedValueOnce({
          disconnect: jest.fn().mockResolvedValue(undefined)
        });
      childProcess.execFileSync.mockReturnValue('msedge');
      const browserInstance = {
        isConnected: jest.fn().mockReturnValue(true),
        pages: jest.fn().mockResolvedValue([]),
        disconnect: jest.fn().mockResolvedValue(undefined)
      };
      puppeteer.launch.mockResolvedValue(browserInstance);

      const result = await launchEdgeDebugging();

      expect(puppeteer.launch).toHaveBeenCalled();
      expect(result.status).toBe('available');
    });
  });

  describe('connectToBrowser', () => {
    it('should connect to browser and return available tabs', async () => {
      const puppeteer = require('puppeteer');
      const { connectToBrowser } = require('./browser-controller');

      const mockPage1 = {
        title: jest.fn().mockResolvedValue('ChatGPT'),
        url: jest.fn().mockReturnValue('https://chatgpt.openai.com')
      };
      
      const mockPage2 = {
        title: jest.fn().mockResolvedValue('DeepSeek'),
        url: jest.fn().mockReturnValue('https://chat.deepseek.com')
      };

      const mockBrowser = {
        pages: jest.fn().mockResolvedValue([mockPage1, mockPage2])
      };

      puppeteer.connect.mockResolvedValue(mockBrowser);

      const result = await connectToBrowser();

      expect(puppeteer.connect).toHaveBeenCalledWith({
        browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser'
      });
      expect(result).toContain('chatgpt');
      expect(result).toContain('deepseek');
    });
  });
});