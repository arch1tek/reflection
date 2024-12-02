import { logger } from './LoggerService.js';

class DatabaseService {
    constructor() {
      this.DB_NAME = 'ReflectDB2';
      this.DB_VERSION = 1;
      this.STORES = {
        pageSummaries: 'pageSummaries',
        dailySummaries: 'dailySummaries',
        monthlySummaries: 'monthlySummaries'
      };
      this.dbInitialized = false;
      this.db = null;
      logger.info('DatabaseService', 'Initialized database service');
    }
  
    async initDB() {
      logger.debug('DatabaseService', 'Initializing database connection');
      if (this.dbInitialized && this.db) {
        logger.debug('DatabaseService', 'Using existing database connection');
        return this.db;
      }
  
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
  
        request.onerror = () => {
          logger.error('DatabaseService', 'Failed to open database', request.error);
          reject(request.error);
        };
  
        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.dbInitialized = true;
          logger.info('DatabaseService', 'Database connection established successfully');
          resolve(this.db);
        };
  
        request.onupgradeneeded = (event) => {
          logger.info('DatabaseService', 'Database upgrade needed', { version: this.DB_VERSION });
          const db = event.target.result;
          
          // Create stores if they don't exist
          Object.entries(this.STORES).forEach(([name, storeName]) => {
            if (!db.objectStoreNames.contains(storeName)) {
              logger.debug('DatabaseService', `Creating object store: ${storeName}`);
              db.createObjectStore(storeName, { keyPath: storeName === this.STORES.monthlySummaries ? 'monthYear' : 'date' });
            }
          });
        };
      });
    }
  
    async addPageSummary(summary) {
      logger.debug('DatabaseService', 'Adding page summary', { summary });
      try {
        const db = await this.initDB();
        const today = new Date().toISOString().split('T')[0];
        
        await this._addToStore(this.STORES.pageSummaries, today, summary);
        await this.updateDailySummary();
        await this.updateMonthlySummary();
        logger.info('DatabaseService', 'Successfully added page summary and updated summaries');
      } catch (error) {
        logger.error('DatabaseService', 'Failed to add page summary', error);
        throw error;
      }
    }
  
    async _addToStore(storeName, key, data) {
      return new Promise((resolve, reject) => {
        const db = this.db;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
  
        const getRequest = store.get(key);
  
        getRequest.onsuccess = () => {
          const existingData = getRequest.result;
          const newData = {
            [storeName === this.STORES.monthlySummaries ? 'monthYear' : 'date']: key,
            summaries: existingData ? 
              [...existingData.summaries, data] : 
              [data]
          };
  
          const putRequest = store.put(newData);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        };
      });
    }
  
    async updateDailySummary() {
      const today = new Date().toISOString().split('T')[0];
      const pageSummaries = await this.getTodaysSummaries();
      
      if (!pageSummaries.length) return;
  
      const dailySummary = {
        date: today,
        totalPages: pageSummaries.length,
        categories: this._aggregateCategories(pageSummaries),
        topTopics: this._getTopTopics(pageSummaries),
        timeDistribution: this._getTimeDistribution(pageSummaries)
      };
  
      await this._updateStore(this.STORES.dailySummaries, today, dailySummary);
    }
  
    async updateMonthlySummary() {
      const date = new Date();
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dailySummaries = await this._getMonthDailySummaries(monthYear);
  
      if (!dailySummaries.length) return;
  
      const monthlySummary = {
        monthYear,
        totalPages: dailySummaries.reduce((acc, day) => acc + day.totalPages, 0),
        categories: this._aggregateMonthlyCategories(dailySummaries),
        topTopics: this._aggregateMonthlyTopics(dailySummaries),
        dailyAverages: this._calculateDailyAverages(dailySummaries)
      };
  
      await this._updateStore(this.STORES.monthlySummaries, monthYear, monthlySummary);
    }
  
    async getDailySummary(date = new Date().toISOString().split('T')[0]) {
      return this._getFromStore(this.STORES.dailySummaries, date);
    }
  
    async getMonthlySummary(monthYear = this._getCurrentMonthYear()) {
      return this._getFromStore(this.STORES.monthlySummaries, monthYear);
    }
  
    async _getFromStore(storeName, key) {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
  
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  
    _getCurrentMonthYear() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  
    _aggregateCategories(summaries) {
      return summaries.reduce((acc, summary) => {
        acc[summary.category] = (acc[summary.category] || 0) + 1;
        return acc;
      }, {});
    }
  
    _getTopTopics(summaries) {
      const topicCount = summaries.reduce((acc, summary) => {
        acc[summary.topic] = (acc[summary.topic] || 0) + 1;
        return acc;
      }, {});
  
      return Object.entries(topicCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));
    }
  
    _getTimeDistribution(summaries) {
      return summaries.reduce((acc, summary) => {
        const hour = new Date(summary.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});
    }
  
    async getTodaysSummaries() {
      try {
        const db = await this.initDB();
        const today = new Date().toISOString().split('T')[0];
  
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([this.STORES.pageSummaries], 'readonly');
          const store = transaction.objectStore(this.STORES.pageSummaries);
          
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
  
    async _updateStore(storeName, key, data) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
  
        const putRequest = store.put(data);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      });
    }
  
    async _getMonthDailySummaries(monthYear) {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORES.dailySummaries], 'readonly');
        const store = transaction.objectStore(this.STORES.dailySummaries);
        const request = store.getAll();
  
        request.onsuccess = () => {
          const allSummaries = request.result || [];
          // Filter summaries for the current month
          const monthSummaries = allSummaries.filter(summary => 
            summary.date.startsWith(monthYear)
          );
          resolve(monthSummaries);
        };
        request.onerror = () => reject(request.error);
      });
    }
  
    _aggregateMonthlyCategories(dailySummaries) {
      return dailySummaries.reduce((acc, day) => {
        Object.entries(day.categories).forEach(([category, count]) => {
          acc[category] = (acc[category] || 0) + count;
        });
        return acc;
      }, {});
    }
  
    _aggregateMonthlyTopics(dailySummaries) {
      const allTopics = dailySummaries.reduce((acc, day) => {
        day.topTopics.forEach(({ topic, count }) => {
          acc[topic] = (acc[topic] || 0) + count;
        });
        return acc;
      }, {});
  
      return Object.entries(allTopics)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));
    }
  
    _calculateDailyAverages(dailySummaries) {
      if (!dailySummaries.length) return { pages: 0 };
  
      const totalPages = dailySummaries.reduce((sum, day) => sum + day.totalPages, 0);
      
      return {
        pages: Math.round(totalPages / dailySummaries.length * 10) / 10
      };
    }
  
    async clearAllData() {
      try {
        const db = await this.initDB();
        
        return Promise.all(
          Object.values(this.STORES).map(storeName => 
            new Promise((resolve, reject) => {
              const transaction = db.transaction([storeName], 'readwrite');
              const store = transaction.objectStore(storeName);
              const request = store.clear();
  
              request.onsuccess = () => resolve();
              request.onerror = () => reject(request.error);
            })
          )
        );
      } catch (error) {
        console.error('Error in clearAllData:', error);
        throw error;
      }
    }
  }
  
  export const databaseService = new DatabaseService();