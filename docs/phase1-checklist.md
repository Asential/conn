# Phase 1 Implementation Checklist

## Current status (based on the existing code)

### Core browser connection
- [x] Add a Puppeteer connection to the Edge remote debugging endpoint at ws://127.0.0.1:9222.
- [x] Return a basic success/error response from the main process through IPC.
- [ ] Ensure Edge can be started automatically with remote debugging enabled if it is not already running.
- [ ] Make the debugging endpoint configurable instead of hard-coded.

### Tab discovery
- [x] Discover open browser pages from the connected browser instance.
- [x] Detect tabs that appear to be ChatGPT or DeepSeek from the page URL.
- [ ] Make tab detection more robust by checking page title, URL, and page content.
- [ ] Handle tab changes dynamically when tabs are opened/closed after the initial connection.

### Model / target selection
- [x] Expose discovered tabs to the renderer.
- [x] Render available targets as selectable UI buttons.
- [ ] Rename the UI labels from generic tab names to actual model/provider names when possible.
- [ ] Show richer metadata such as provider, URL, and status.

### Prompt sending
- [x] Wire the UI to send a prompt through IPC to the main process.
- [x] Provide a basic handler structure for sending prompts to a target tab.
- [ ] Implement real prompt injection into the ChatGPT/DeepSeek input fields.
- [ ] Implement actual response capture from the target page.
- [ ] Handle unsupported pages or missing input fields gracefully.

### Error handling and UX
- [x] Return connection/send errors from the main process to the renderer.
- [x] Display connection errors in the UI status area.
- [ ] Add loading states while connecting or sending prompts.
- [ ] Add empty-state messaging when no supported tabs are detected.
- [ ] Add retry logic for temporary connection failures.

### Testing and reliability
- [ ] Add tests for browser connection success/failure.
- [ ] Add tests for IPC handler responses.
- [ ] Add tests for UI rendering of discovered targets.
- [ ] Add tests for error paths when no browser or no tab is available.

## Recommended next implementation steps
1. Verify and launch Edge with remote debugging enabled.
2. Inspect the actual ChatGPT/DeepSeek DOM and implement selectors for prompt input and response output.
3. Replace the placeholder send logic with real automation.
4. Add tests and improve error handling.
