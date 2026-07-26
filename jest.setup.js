jest.mock('puppeteer', () => ({
  connect: jest.fn()
}));