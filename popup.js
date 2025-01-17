import { databaseService } from './services/DatabaseService.js';

class PopupUI {
  constructor() {
    this.summariesContainer = document.getElementById('summaries');
    this.initializeUI();
  }

  async initializeUI() {
    await this.loadSummaries();
    this.setupClearButton();
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
      this.summariesContainer.innerHTML = '<p>No summaries for today yet.</p>';
      return;
    }

    summaries.forEach(summary => {
      const summaryElement = document.createElement('div');
      summaryElement.className = 'summary';
      summaryElement.innerHTML = `
        <h4>${summary.title}</h4>
        <p><strong>Category:</strong> ${summary.category}</p>
        <p><strong>Topic:</strong> ${summary.topic}</p>
        <p>${summary.summary}</p>
        <small>${new Date(summary.timestamp).toLocaleTimeString()}</small>
      `;
      this.summariesContainer.appendChild(summaryElement);
    });
  }

  setupClearButton() {
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear All Data';
    clearButton.onclick = async () => {
      if (confirm('Are you sure you want to clear all stored data?')) {
        try {
          await databaseService.clearAllData();
          this.summariesContainer.innerHTML = '<p>No summaries for today yet.</p>';
        } catch (error) {
          console.error('Error clearing data:', error);
          this.showError('Failed to clear data');
        }
      }
    };
    document.body.appendChild(clearButton);
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.textContent = message;
    this.summariesContainer.appendChild(errorElement);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupUI();
});
