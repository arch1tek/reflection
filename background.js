import { modelService } from './services/ModelService.js';
import { databaseService } from './services/DatabaseService.js';
import { logger } from './services/LoggerService.js';

class BackgroundController {
  constructor() {
    logger.info('BackgroundController', 'Initializing background controller');
    this.initializeMessageListeners();
    this.initializeExtension();
  }

  async initializeExtension() {
    logger.debug('BackgroundController', 'Setting up side panel behavior');
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    const modelReady = await modelService.checkAndDownloadModel();
    logger.info('BackgroundController', 'Model initialization complete', { modelReady });
  }

  initializeMessageListeners() {
    logger.debug('BackgroundController', 'Setting up message listeners');
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      logger.debug('BackgroundController', 'Received message', { action: message.action });
      if (message.action === "processContent") {
        this.handleContentProcessing(message.data, sendResponse);
        return true;
      }
    });
  }

  async handleContentProcessing(data, sendResponse) {
    logger.debug('BackgroundController', 'Processing content', { url: data.url });
    try {
      const analysisResult = await modelService.summarizeContent(data.content);
      await databaseService.addPageSummary({
        title: data.title,
        url: data.url,
        timestamp: data.timestamp,
        ...analysisResult
      });
      logger.info('BackgroundController', 'Content processing completed successfully');
      sendResponse({ success: true });
    } catch (error) {
      logger.error('BackgroundController', 'Error processing content', error);
      sendResponse({ success: false, error: error.message });
    }
  }
}

// Initialize the background controller
new BackgroundController();
