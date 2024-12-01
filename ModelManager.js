class ModelManager {
    static async checkAndDownloadModel() {
      try {
        const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
        if (capabilities.available === "after-download") {
          console.log("Downloading AI model...");
          await chrome.aiOriginTrial.languageModel.create({
            monitor(monitor) {
              monitor.addEventListener("downloadprogress", (e) => {
                console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
              });
            },
          });
          console.log("Model downloaded successfully.");
        } else if (capabilities.available === "readily") {
          console.log("Model is already available.");
        } else {
          console.log("Model is not available.");
        }
      } catch (error) {
        console.error("Error during model download:", error.message);
      }
    }
  
    static async isModelReady() {
      const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
      return capabilities.available === "readily";
    }
  
    static async getSummaryAndCategory(title, content) {
      try {
        const session = await chrome.aiOriginTrial.languageModel.create();
        const prompt = `
          You are an assistant tasked with summarizing webpage content and classifying its topic. 
          Given the following webpage title and content, please summarize the content and classify it into a category 
          (e.g., technology, health, sports, finance, entertainment, etc.).
  
          Title: ${title}
          Content: ${content}
  
          Respond in JSON format:
          {
            "summary": "<Summary of the content>",
            "category": "<Category>"
          }
        `;
        const result = await session.prompt(prompt);
        console.log("Prompt result:", result);
  
        return ModelManager.extractJSON(result);
      } catch (error) {
        console.error("Error summarizing or classifying content:", error.message);
        return {
          summary: "Unable to summarize the content.",
          category: "Unknown",
        };
      }
    }
  
    static extractJSON(input) {
      try {
        const start = input.indexOf("{");
        const end = input.lastIndexOf("}");
        if (start !== -1 && end !== -1 && start < end) {
          return JSON.parse(input.substring(start, end + 1));
        }
        throw new Error("Invalid JSON format in AI response.");
      } catch (error) {
        console.error("Error parsing JSON:", error.message);
        return null;
      }
    }
  }
  
export default ModelManager;