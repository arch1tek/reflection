async function checkAndDownloadModel() {
    console.log('downloader enter')
    try {
      const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
  
      if (capabilities.available === 'after-download') {
        console.log('Model is downloading...');
        const session = await chrome.aiOriginTrial.languageModel.create({
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          },
        });
        console.log('Model downloaded and ready for use');
      } else if (capabilities.available === 'readily') {
        console.log('Model is already available');
      } else {
        console.log('Model is not available at the moment');
      }
    } catch (error) {
      console.error('Error downloading or checking the model:', error);
    }
  }

// Check if the model is ready
async function checkModelAvailability() {
  const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
  if (capabilities.available === 'readily') {
    return true;
  } else if (capabilities.available === 'after-download') {
    await checkAndDownloadModel();
    return true;
  } else {
    return false;
  }
}

// Store summaries of the pages visited
async function storeSummary(summary) {
  chrome.storage.local.get({ summaryDatabase: [] }, (data) => {
    const updatedDatabase = [...data.summaryDatabase, summary];
    chrome.storage.local.set({ summaryDatabase: updatedDatabase });
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  const modelReady = await checkModelAvailability();
  if (modelReady) {
    console.log("Model is ready to summarize pages.");
  } else {
    console.log("Model is not ready yet.");
  }
});
