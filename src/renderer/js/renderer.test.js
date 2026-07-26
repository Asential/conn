/**
 * @jest-environment jsdom
 */

describe('Renderer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="connect-btn"></div>
      <div id="send"></div>
      <div id="prompt"></div>
      <div id="messages"></div>
      <div id="status"></div>
      <div id="models"></div>
    `;

    window.electron = {
      invoke: jest.fn()
    };
  });

  it('should have required DOM elements', () => {
    expect(document.getElementById('connect-btn')).toBeTruthy();
    expect(document.getElementById('send')).toBeTruthy();
    expect(document.getElementById('prompt')).toBeTruthy();
  });
});