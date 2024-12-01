import { databaseService } from './services/DatabaseService.js';

class SidePanelUI {
  constructor() {
    this.summariesContainer = document.getElementById('summaries');
    this.clearButton = document.getElementById('clearButton');
    this.initializeUI();
  }

  async initializeUI() {
    await this.loadSummaries();
    this.setupClearButton();
    this.setupAutoRefresh();
  }

  setupAutoRefresh() {
    // Refresh summaries every 30 seconds
    setInterval(() => this.loadSummaries(), 30000);
  }

  async loadSummaries() {
    try {
      const summaries = await databaseService.getTodaysSummaries();
      this.displaySummaries(summaries);
    } catch (error) {
      console.error('Error loading summaries:', error);
      this.showError('Failed to load summaries');
    }
  }

  displaySummaries(summaries) {
    this.summariesContainer.innerHTML = '';
    
    if (!summaries.length) {
      this.summariesContainer.innerHTML = '<p style="text-align: center; color: #666;">No summaries for today yet.</p>';
      return;
    }

    summaries.forEach(summary => {
      const summaryElement = document.createElement('div');
      summaryElement.className = 'summary';
      summaryElement.innerHTML = `
        <h4>${summary.title}</h4>
        <div style="margin: 8px 0;">
          <span class="category-tag">${summary.category}</span>
          <span class="category-tag">${summary.topic}</span>
        </div>
        <p>${summary.summary}</p>
        <small>${new Date(summary.timestamp).toLocaleTimeString()}</small>
      `;
      this.summariesContainer.appendChild(summaryElement);
    });
  }

  setupClearButton() {
    this.clearButton.onclick = async () => {
      if (confirm('Are you sure you want to clear all stored data?')) {
        try {
          await databaseService.clearAllData();
          this.summariesContainer.innerHTML = '<p style="text-align: center; color: #666;">No summaries for today yet.</p>';
        } catch (error) {
          console.error('Error clearing data:', error);
          this.showError('Failed to clear data');
        }
      }
    };
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.textContent = message;
    this.summariesContainer.appendChild(errorElement);
  }
}

// Initialize sidepanel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SidePanelUI();
}); 