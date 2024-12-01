import AnalyticsService from './services/AnalyticsService.js';
import BioGeneratorService from './services/BioGeneratorService.js';
import UIService from './services/UIService.js';

class PopupManager {
  constructor() {
    console.log('PopupManager initialized');
    this.initialize();
  }

  async initialize() {
    try {
      console.log('Starting initialization');
      await this.renderSummaries();
      this.setupEventListeners();
      console.log('Initialization complete');
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  setupEventListeners() {
    const clearButton = document.getElementById("clearData");
    clearButton?.addEventListener("click", () => this.handleClearData());
  }

  async renderSummaries() {
    try {
      console.log('Fetching summary data');
      const data = await this.getSummaryData();
      console.log('Summary data:', data);
      
      const summariesDiv = document.getElementById("summaries");
      if (!summariesDiv) {
        console.error('Summaries div not found');
        return;
      }

      if (!data.summaryDatabase?.length) {
        console.log('No summaries available');
        this.renderEmptyState(summariesDiv);
        return;
      }

      console.log('Rendering full profile');
      await this.renderFullProfile(data.summaryDatabase, summariesDiv);
    } catch (error) {
      console.error('Error in renderSummaries:', error);
    }
  }

  async getSummaryData() {
    return new Promise(resolve => {
      chrome.storage.local.get({ summaryDatabase: [] }, resolve);
    });
  }

  renderEmptyState(container) {
    container.innerHTML = "<p>No summaries available.</p>";
  }

  async renderFullProfile(summaries, summariesDiv) {
    const profileDiv = this.createProfileDiv(summariesDiv);
    const trends = await AnalyticsService.analyzeTrends(summaries);
    const recentPages = AnalyticsService.getRecentActivities(summaries);
    const stats = AnalyticsService.getStats(summaries, trends);
    
    profileDiv.innerHTML = UIService.createProfileSection("Generating your profile...", trends, stats);
    
    const finalBio = await BioGeneratorService.generateBio(trends, recentPages);
    
    this.renderRecentActivity(summaries.slice(-5), summariesDiv);
  }

  createProfileDiv(summariesDiv) {
    const profileDiv = document.createElement("div");
    profileDiv.id = "profile";
    summariesDiv.parentNode.insertBefore(profileDiv, summariesDiv);
    return profileDiv;
  }

  renderRecentActivity(recentSummaries, container) {
    container.innerHTML = "<h3>Recent Activity</h3>";
    recentSummaries.forEach(item => {
      container.innerHTML += UIService.createSummaryItem(item);
    });
  }

  async handleClearData() {
    if (confirm("Are you sure you want to clear all your browsing data?")) {
      await this.clearStorage();
      await this.renderSummaries();
    }
  }

  clearStorage() {
    return new Promise(resolve => {
      chrome.storage.local.set({ summaryDatabase: [] }, () => {
        console.log("All data cleared.");
        resolve();
      });
    });
  }
}

// Initialize the popup
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM Content Loaded');
  try {
    new PopupManager();
  } catch (error) {
    console.error('Error creating PopupManager:', error);
  }
});
