class StorageManager {
    static async storeSummary(summary) {
      chrome.storage.local.get({ summaryDatabase: [] }, (data) => {
        const updatedDatabase = [...data.summaryDatabase, summary];
        chrome.storage.local.set({ summaryDatabase: updatedDatabase }, () => {
          console.log("Summary stored successfully:", summary);
        });
      });
    }
  
    static async clearStorage() {
      chrome.storage.local.clear(() => {
        console.log("Storage cleared.");
      });
    }
  }
  

export default StorageManager;