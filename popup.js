// --- THIS IS THE CORRECT POPUP SCRIPT ---

// Grab the UI elements
const statusContainer = document.getElementById('status-container');
const statusText = document.getElementById('status-text');
const messageText = document.getElementById('message-text');

/**
 * Updates the popup's UI based on the analysis result.
 * @param {object} result - The analysis result object from storage.
 */
function updateUI(result) {
  // If no result is found (e.g., on a new tab page)
  if (!result) {
    statusText.textContent = 'No URL';
    messageText.textContent = 'Navigate to a website (http:// or https://) to analyze.';
    statusContainer.className = 'status-box status-no-url';
    return;
  }

  // A result was found, update the UI
  statusText.textContent = result.status;
  messageText.textContent = result.message;

  // Clear existing status classes
  statusContainer.className = 'status-box';

  switch (result.status) {
    case 'SAFE':
      statusContainer.classList.add('status-safe');
      break;
    case 'DANGEROUS':
      statusContainer.classList.add('status-dangerous');
      break;
    case 'ERROR':
      statusContainer.classList.add('status-error');
      break;
    case 'CHECKING':
      statusContainer.classList.add('status-checking');
      break;
    default:
      statusContainer.classList.add('status-no-url');
  }
}

// --- THIS IS THE FIX ---
// This function listens for real-time changes to storage.
// If background.js saves a new result, this will fire and update the UI.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.analysisResult) {
    // A new analysis result just came in!
    const newResult = changes.analysisResult.newValue;
    updateUI(newResult);
  }
});

// --- THIS RUNS WHEN THE POPUP FIRST OPENS ---
// Get the *current* result from storage immediately when the popup opens.
// This handles the case where the analysis finished *before* you clicked.
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('analysisResult', (data) => {
    updateUI(data.analysisResult);
  });
});

