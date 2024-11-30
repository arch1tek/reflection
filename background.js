// Check and download the AI model if not readily available
async function checkAndDownloadModel() {
  console.log("Checking and downloading model...");
  try {
    const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();

    if (capabilities.available === "after-download") {
      console.log("Model is downloading...");
      const session = await chrome.aiOriginTrial.languageModel.create({
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });
      console.log("Model downloaded and ready for use");
    } else if (capabilities.available === "readily") {
      console.log("Model is already available");
    } else {
      console.log("Model is not available at the moment");
    }
  } catch (error) {
    console.error("Error downloading or checking the model:", error);
  }
}

// Check if the AI model is ready
async function checkModelAvailability() {
  const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
  if (capabilities.available === "readily") {
    return true;
  } else if (capabilities.available === "after-download") {
    await checkAndDownloadModel();
    return true;
  } else {
    return false;
  }
}

// Store summaries with title and category in local storage
async function storeSummary(summary) {
  chrome.storage.local.get({ summaryDatabase: [] }, (data) => {
    const updatedDatabase = [...data.summaryDatabase, summary];
    chrome.storage.local.set({ summaryDatabase: updatedDatabase }, () => {
      console.log("Summary stored successfully:", summary);
    });
  });
}

// Handle incoming messages from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "storeSummary") {
    storeSummary(message.data);
    sendResponse({ status: "success" });
  } else {
    sendResponse({ status: "unknown action" });
  }
});

// On extension installation, check if the model is ready
chrome.runtime.onInstalled.addListener(async () => {
  const modelReady = await checkModelAvailability();
  if (modelReady) {
    console.log("Model is ready for summarization and classification.");
  } else {
    console.log("Model is not ready yet.");
  }
});

// Clear stored data (optional, for debugging purposes)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.clear(() => {
    console.log("Cleared all stored summaries on startup.");
  });
});
