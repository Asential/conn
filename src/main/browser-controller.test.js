describe('Browser Controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
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
        browserWSEndpoint: 'ws://127.0.0.1:9222'
      });
      expect(result).toContain('chatgpt');
      expect(result).toContain('deepseek');
    });
  });
});