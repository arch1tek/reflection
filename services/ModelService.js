class ModelService {
  async checkAndDownloadModel() {
    console.log('Checking model availability...');
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
        return true;
      } else if (capabilities.available === 'readily') {
        console.log('Model is already available');
        return true;
      } else {
        console.log('Model is not available at the moment');
        return false;
      }
    } catch (error) {
      console.error('Error downloading or checking the model:', error);
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
      return this.extractJsonFromString(result);
    } catch (error) {
      console.error('Error summarizing content:', error);
      throw error;
    }
  }
}

export const modelService = new ModelService(); 