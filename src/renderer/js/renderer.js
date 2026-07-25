console.log('renderer.js loaded');

document.getElementById('btn').addEventListener('click', () => {
  console.log('Button clicked');
});

document.getElementById('btn').addEventListener('click', () => {
  window.electron.send('button-clicked', 'some data');
});

window.electron.receive('response', (data) => {
  console.log('Got response:', data);
});