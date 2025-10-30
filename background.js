// This script runs when a user navigates to a new page.

// Listen for when the user switches to a different tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  // activeInfo contains { tabId, windowId }
  handleTabActivation(activeInfo.tabId);
});

// Listen for when a tab is updated (e.g., new URL loaded)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We only care about when the loading is complete
  if (changeInfo.status === 'complete') {
    handleTabUpdate(tabId, tab.url);
  }
});

/**
 * Handles tab activation.
 * @param {number} tabId The ID of the activated tab.
 */
async function handleTabActivation(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url) {
      return; // No URL, e.g., new tab page
    }
    handleTabUpdate(tabId, tab.url);
  } catch (e) {
    console.log("Tab error (onActivated), likely closed.", e);
  }
}

/**
 * Handles tab URL updates.
 * @param {number} tabId The ID of the tab.
 *S @param {string} url The new URL of the tab.
 */
function handleTabUpdate(tabId, url) {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    // This is a valid page, analyze it
    analyzeUrl(url);
  } else {
    // This is a browser-internal page (e.g., chrome://extensions)
    // Clear the storage so the popup doesn't show old data
    chrome.storage.local.set({ analysisResult: null });
  }
}

/**
 * Sends the URL to the backend server for analysis.
 * @param {string} url The URL of the active tab.
 */
async function analyzeUrl(url) {
  const serverUrl =  'https://mindguard-server.onrender.com/check-url';
  
  // Save a "checking" state so the popup knows
  chrome.storage.local.set({
    analysisResult: {
      status: 'CHECKING',
      message: 'Analyzing the current page...',
    },
  });

  try {
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    
    // Save the final result for the popup to read
    chrome.storage.local.set({ analysisResult: result });

  } catch (error) {
    console.error('MindGuard Error:', error.message);
    // Store an error state for the popup
    chrome.storage.local.set({
      analysisResult: {
        status: 'ERROR',
        message: 'Could not connect to the MindGuard server. Is it running?',
      },
    });
  }
}

