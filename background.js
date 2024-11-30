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
  
  // Initialize the model download check when the extension starts
checkAndDownloadModel();
  