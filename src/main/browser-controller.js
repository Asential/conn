const puppeteer = require('puppeteer');

let browser;
let tabs = {};

async function connectToBrowser() {
  browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://127.0.0.1:9222'
  });
  
  const pages = await browser.pages();
  
  // Map tabs by title/URL
  for (const page of pages) {
    const title = await page.title();
    const url = page.url();
    
    if (url.includes('chatgpt')) {
      tabs.chatgpt = page;
    } else if (url.includes('deepseek')) {
      tabs.deepseek = page;
    }
  }
  
  return Object.keys(tabs);
}

async function sendPromptToTab(tabName, prompt) {
  const page = tabs[tabName];
  if (!page) throw new Error(`Tab ${tabName} not found`);
  
  // Focus the tab
  await page.bringToFront();
  
  // Find input, type prompt, submit
  // (we'll fill this in once we inspect ChatGPT/Deepseek HTML)
  
  return { success: true };
}

module.exports = { connectToBrowser, sendPromptToTab, tabs: () => tabs };