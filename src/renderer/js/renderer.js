let currentModel = null;
let availableModels = [];

const connectBtn = document.getElementById('connect-btn');
const launchEdgeBtn = document.getElementById('launch-edge-btn');
const sendBtn = document.getElementById('send');
const promptInput = document.getElementById('prompt');
const messagesDiv = document.getElementById('messages');
const statusDiv = document.getElementById('status');
const modelsDiv = document.getElementById('models');

async function refreshEdgeStatus() {
  statusDiv.textContent = 'Checking Edge debug status...';
  const result = await window.electron.invoke('get-edge-status');

  if (result.success) {
    if (result.isRunning) {
      statusDiv.textContent = 'Edge remote debugging is available.';
    } else if (result.status === 'already-running') {
      statusDiv.textContent = 'Edge is already running. Using the existing browser instance.';
    } else {
      statusDiv.textContent = `Edge remote debugging is not ready (${result.status}).`;
    }
  } else {
    statusDiv.textContent = `Edge status error: ${result.error}`;
  }
}

launchEdgeBtn.addEventListener('click', async () => {
  launchEdgeBtn.disabled = true;
  statusDiv.textContent = 'Launching Edge with remote debugging...';

  const result = await window.electron.invoke('launch-edge-debug');

  if (result.success) {
    if (result.status === 'already-running') {
      statusDiv.textContent = 'Edge is already running. Using the existing browser instance.';
    } else if (result.launched) {
      statusDiv.textContent = 'Edge launched with remote debugging enabled.';
    } else {
      statusDiv.textContent = 'Edge launch did not complete successfully.';
    }
  } else {
    statusDiv.textContent = `Error: ${result.error}`;
  }

  await refreshEdgeStatus();
  launchEdgeBtn.disabled = false;
});

connectBtn.addEventListener('click', async () => {
  const result = await window.electron.invoke('connect-browser');
  
  if (result.success) {
    availableModels = result.tabs;
    statusDiv.textContent = `Connected: ${result.tabs.join(', ')}`;
    renderModels();
  } else {
    statusDiv.textContent = `Error: ${result.error}`;
  }
});

function renderModels() {
  modelsDiv.innerHTML = '';
  availableModels.forEach(model => {
    const btn = document.createElement('button');
    btn.className = `model-btn ${model === currentModel ? 'active' : ''}`;
    btn.textContent = model;
    btn.addEventListener('click', () => selectModel(model));
    modelsDiv.appendChild(btn);
  });
}

function selectModel(model) {
  currentModel = model;
  renderModels();
  messagesDiv.innerHTML = '';
}

sendBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt || !currentModel) return;

  addMessage('user', prompt);
  promptInput.value = '';

  const result = await window.electron.invoke('send-prompt', { tab: currentModel, prompt });
  
  if (result.success) {
    addMessage(currentModel, result.response.response || 'No response');
  } else {
    addMessage('error', result.error);
  }
});

function addMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = `message ${sender === 'user' ? 'user' : ''}`;
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

refreshEdgeStatus();