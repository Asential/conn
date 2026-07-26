const puppeteer = require('puppeteer');
const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');

const EDGE_ENDPOINT = 'ws://127.0.0.1:9222/devtools/browser';

let browser;
let tabs = {};

function findEdgeExecutable() {
  const candidates = [];

  if (process.platform === 'win32') {
    candidates.push(
      process.env.EDGE_EXECUTABLE,
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
    );
  } else if (process.platform === 'darwin') {
    candidates.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
  } else {
    candidates.push('microsoft-edge', 'microsoft-edge-stable', 'google-chrome');
  }

  for (const candidate of candidates.filter(Boolean)) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch (error) {
      // Ignore and try the next option.
    }
  }

  return null;
}

function logEdgeDebug(message, details) {
  console.log('[edge-debug]', message, details || '');
}

function getDedicatedEdgeProfileDir() {
  return path.join(os.tmpdir(), 'conn-edge-profile');
}

function isBrowserConnected(browserInstance) {
  if (!browserInstance) {
    return false;
  }

  if (typeof browserInstance.isConnected === 'function') {
    try {
      return browserInstance.isConnected();
    } catch (error) {
      return false;
    }
  }

  return true;
}

async function getEdgeDebugStatus() {
  if (isBrowserConnected(browser)) {
    logEdgeDebug('Using the existing Puppeteer-managed browser instance');
    return { isRunning: true, status: 'available', endpoint: EDGE_ENDPOINT };
  }

  logEdgeDebug('Checking Edge debug endpoint', { endpoint: EDGE_ENDPOINT });

  try {
    const tempBrowser = await puppeteer.connect({
      browserWSEndpoint: EDGE_ENDPOINT,
      timeout: 3000
    });

    await tempBrowser.disconnect();
    logEdgeDebug('Edge debug endpoint is available');
    return { isRunning: true, status: 'available', endpoint: EDGE_ENDPOINT };
  } catch (error) {
    logEdgeDebug('Edge debug endpoint is not available', { error: error.message });
    return {
      isRunning: false,
      status: 'not-running',
      endpoint: EDGE_ENDPOINT,
      error: error.message
    };
  }
}

async function launchEdgeDebugging() {
  logEdgeDebug('Launching Edge debugging flow');

  const currentStatus = await getEdgeDebugStatus();
  if (currentStatus.isRunning) {
    return { launched: false, status: 'already-running', ...currentStatus };
  }

  const edgeExecutable = findEdgeExecutable();
  logEdgeDebug('Found Edge executable', { edgeExecutable });
  if (!edgeExecutable) {
    throw new Error('Microsoft Edge executable not found');
  }

  const userDataDir = getDedicatedEdgeProfileDir();
  const launchArgs = [
    '--remote-debugging-port=9222',
    '--new-window',
    'about:blank',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`
  ];

  logEdgeDebug('Launching Edge with profile', { userDataDir, endpoint: EDGE_ENDPOINT, launchArgs });
  browser = await puppeteer.launch({
    executablePath: edgeExecutable,
    headless: false,
    args: launchArgs,
    defaultViewport: null
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const refreshedStatus = await getEdgeDebugStatus();
  logEdgeDebug('Refreshed Edge status after launch attempt', refreshedStatus);
  if (refreshedStatus.isRunning) {
    return { launched: true, status: 'launched', ...refreshedStatus };
  }

  return { launched: false, status: 'launch-failed', ...refreshedStatus };
}

async function connectToBrowser() {
  if (isBrowserConnected(browser)) {
    logEdgeDebug('Reusing existing Puppeteer browser instance');
  } else {
    const status = await getEdgeDebugStatus();
    if (!status.isRunning) {
      await launchEdgeDebugging();
    }
  }

  logEdgeDebug('Attempting to connect to browser', { endpoint: EDGE_ENDPOINT });

  if (!isBrowserConnected(browser)) {
    browser = await puppeteer.connect({
      browserWSEndpoint: EDGE_ENDPOINT
    });
  }

  const pages = await browser.pages();
  logEdgeDebug('Browser pages discovered', { count: pages.length });

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

  await page.bringToFront();

  return { success: true, prompt };
}

module.exports = {
  connectToBrowser,
  sendPromptToTab,
  launchEdgeDebugging,
  getEdgeDebugStatus,
  tabs: () => tabs
};