class StorageManager {
    static async storeSummary(summary) {
      const today = new Date().toISOString().split('T')[0];
      
      // Get current storage state
      const data = await this.getData();
      
      // Add summary to current day's data
      if (!data.dailySummaries) data.dailySummaries = {};
      if (!data.currentDay) data.currentDay = today;
      if (!data.summaryDatabase) data.summaryDatabase = [];

      // If day changed, aggregate previous day's data
      if (data.currentDay !== today) {
        await this.aggregatePreviousDay(data);
        data.currentDay = today;
        data.summaryDatabase = []; // Clear current summaries
      }

      // Add new summary
      data.summaryDatabase.push(summary);
      
      // Store updated data
      await this.setData(data);
      console.log("Summary stored successfully:", summary);
    }
  
    static async aggregatePreviousDay(data) {
      if (data.summaryDatabase.length === 0) return;

      const dailySummary = await DailySummaryService.aggregateDailySummary(
        data.summaryDatabase
      );

      data.dailySummaries[data.currentDay] = dailySummary;
      
      // Remove old daily summaries beyond retention period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - DailySummaryService.RETENTION_DAYS);
      
      Object.keys(data.dailySummaries).forEach(date => {
        if (new Date(date) < cutoffDate) {
          delete data.dailySummaries[date];
        }
      });
    }
  
    static async getData() {
      return new Promise(resolve => {
        chrome.storage.local.get(null, resolve);
      });
    }
  
    static async setData(data) {
      return new Promise(resolve => {
        chrome.storage.local.set(data, resolve);
      });
    }
  
    static async clearStorage() {
      return new Promise(resolve => {
        chrome.storage.local.clear(resolve);
      });
    }
  }
  

export default StorageManager;