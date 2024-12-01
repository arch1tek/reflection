import { modelService } from './services/ModelService.js';
import { databaseService } from './services/DatabaseService.js';

class BackgroundController {
  constructor() {
    this.initializeMessageListeners();
    this.initializeExtension();
  }

  async initializeExtension() {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    const modelReady = await modelService.checkAndDownloadModel();
    if (modelReady) {
      console.log("Model is ready to summarize pages.");
    } else {
      console.log("Model is not ready yet.");
    }
  }

  initializeMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "processContent") {
        this.handleContentProcessing(message.data, sendResponse);
        return true; // Required for async response
      }
    });
  }

  async handleContentProcessing(data, sendResponse) {
    try {
      // Get summary from model
      const analysisResult = await modelService.summarizeContent(data.content);
      
      // Prepare data for storage
      const pageData = {
        title: data.title,
        url: data.url,
        timestamp: data.timestamp,
        ...analysisResult
      };

      // Store in database
      await databaseService.addPageSummary(pageData);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error processing content:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
}

// Initialize the background controller
new BackgroundController();
