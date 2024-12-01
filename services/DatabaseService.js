class DatabaseService {
    constructor() {
      this.DB_NAME = 'ReflectDB';
      this.DB_VERSION = 1;
      this.STORE_NAME = 'pageSummaries';
      this.dbInitialized = false;
      this.db = null;
    }
  
    async initDB() {
      if (this.dbInitialized && this.db) {
        return this.db;
      }
  
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
  
        request.onerror = () => {
          console.error('Error opening database:', request.error);
          reject(request.error);
        };
  
        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.dbInitialized = true;
          resolve(this.db);
        };
  
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Create the object store if it doesn't exist
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            console.log('Creating object store:', this.STORE_NAME);
            db.createObjectStore(this.STORE_NAME, { keyPath: 'date' });
          }
        };
      });
    }
  
    async addPageSummary(summary) {
      try {
        const db = await this.initDB();
        console.log("db: ", db);
        const today = new Date().toISOString().split('T')[0];
        
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([this.STORE_NAME], 'readwrite');
          console.log("transaction: ", transaction);
          const store = transaction.objectStore(this.STORE_NAME);
          console.log("store: ", store);
          transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
            reject(event.target.error);
          };
  
          // First, try to get existing entries for today
          const getRequest = store.get(today);
  
          getRequest.onsuccess = () => {
            const existingData = getRequest.result;
            const newData = {
              date: today,
              summaries: existingData ? 
                [...existingData.summaries, summary] : 
                [summary]
            };
  
            const putRequest = store.put(newData);
            putRequest.onsuccess = () => {
              console.log('Successfully stored summary');
              resolve();
            };
            putRequest.onerror = () => {
              console.error('Error storing summary:', putRequest.error);
              reject(putRequest.error);
            };
          };
  
          getRequest.onerror = (event) => {
            console.error('Error getting existing data:', event.target.error);
            reject(event.target.error);
          };
        });
      } catch (error) {
        console.error('Error in addPageSummary:', error);
        throw error;
      }
    }
  
    async getTodaysSummaries() {
      try {
        const db = await this.initDB();
        const today = new Date().toISOString().split('T')[0];
  
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([this.STORE_NAME], 'readonly');
          const store = transaction.objectStore(this.STORE_NAME);
          
          transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
            reject(event.target.error);
          };
  
          const request = store.get(today);
  
          request.onsuccess = () => {
            resolve(request.result?.summaries || []);
          };
          
          request.onerror = (event) => {
            console.error('Error getting summaries:', event.target.error);
            reject(event.target.error);
          };
        });
      } catch (error) {
        console.error('Error in getTodaysSummaries:', error);
        throw error;
      }
    }
  
    async clearAllData() {
      try {
        const db = await this.initDB();
        
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([this.STORE_NAME], 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          
          transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
            reject(event.target.error);
          };
  
          const request = store.clear();
  
          request.onsuccess = () => {
            console.log('Successfully cleared all data');
            resolve();
          };
          
          request.onerror = (event) => {
            console.error('Error clearing data:', event.target.error);
            reject(event.target.error);
          };
        });
      } catch (error) {
        console.error('Error in clearAllData:', error);
        throw error;
      }
    }
  }
  
  export const databaseService = new DatabaseService();