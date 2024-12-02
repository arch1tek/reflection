import { logger } from './LoggerService.js';

class ModelService {
  async checkAndDownloadModel() {
    logger.info('ModelService', 'Checking model availability');
    try {
      const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
  
      if (capabilities.available === 'after-download') {
        logger.info('ModelService', 'Model download required');
        const session = await chrome.aiOriginTrial.languageModel.create({
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              logger.debug('ModelService', `Download progress: ${e.loaded}/${e.total} bytes`);
            });
          },
        });
        logger.info('ModelService', 'Model downloaded successfully');
        return true;
      } else if (capabilities.available === 'readily') {
        logger.info('ModelService', 'Model already available');
        return true;
      } else {
        logger.warn('ModelService', 'Model not available');
        return false;
      }
    } catch (error) {
      logger.error('ModelService', 'Error checking/downloading model', error);
      return false;
    }
  }

  extractJsonFromString(str) {
    try {
      const firstBracket = str.indexOf('{');
      const lastBracket = str.lastIndexOf('}');
      
      if (firstBracket === -1 || lastBracket === -1) {
        throw new Error('No JSON object found in string');
      }

      const jsonStr = str.substring(firstBracket, lastBracket + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error extracting JSON:', error);
      throw error;
    }
  }

  async summarizeContent(content) {
    logger.debug('ModelService', 'Starting content summarization', { contentLength: content.length });
    try {
      const session = await chrome.aiOriginTrial.languageModel.create();
      const prompt = `
        Analyze the following content and provide:
        1. A brief summary (max 200 words)
        2. A general category (e.g., Technology, Science, Business, etc.)
        3. A specific topic within that category
        
        Content: ${content}
        
        Format your response as JSON like this:
        {
          "summary": "your summary here",
          "category": "main category",
          "topic": "specific topic"
        }
      `;
      
      const result = await session.prompt(prompt);
      logger.info('ModelService', 'Content summarization completed');
      return this.extractJsonFromString(result);
    } catch (error) {
      logger.error('ModelService', 'Error summarizing content', error);
      throw error;
    }
  }
}

export const modelService = new ModelService(); 