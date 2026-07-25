const promptInput = document.getElementById('prompt-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const responsesDiv = document.getElementById('responses');

sendBtn.addEventListener('click', () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  responsesDiv.innerHTML = '';
  window.electron.send('send-prompt', { prompt });
});

clearBtn.addEventListener('click', () => {
  promptInput.value = '';
  promptInput.focus();
});

window.electron.receive('response', (data) => {
  const item = document.createElement('div');
  item.className = 'response-item';
  item.innerHTML = `
    <div class="response-label">${data.model}</div>
    <div class="response-text">${data.response}</div>
  `;
  responsesDiv.appendChild(item);
});