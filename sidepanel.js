import { databaseService } from './services/DatabaseService.js';

class SidePanelUI {
  constructor() {
    this.summariesContainer = document.getElementById('summaries');
    this.clearButton = document.getElementById('clearButton');
    this.tabs = document.querySelectorAll('.tab');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.initializeUI();
  }

  async initializeUI() {
    this.setupTabs();
    await this.loadSummaries();
    await this.loadDailySummary();
    await this.loadMonthlySummary();
    this.setupClearButton();
    this.setupAutoRefresh();
  }

  setupTabs() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        this.tabs.forEach(t => t.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        document.getElementById(tabId).classList.add('active');
      });
    });
  }

  setupAutoRefresh() {
    // Refresh summaries every 30 seconds
    setInterval(async () => {
      await this.loadSummaries();
      await this.loadDailySummary();
      await this.loadMonthlySummary();
    }, 30000);
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

  async loadDailySummary() {
    try {
      const dailySummary = await databaseService.getDailySummary();
      if (dailySummary) {
        this.displayDailySummary(dailySummary);
      }
    } catch (error) {
      console.error('Error loading daily summary:', error);
      this.showError('Failed to load daily summary');
    }
  }

  async loadMonthlySummary() {
    try {
      const monthlySummary = await databaseService.getMonthlySummary();
      if (monthlySummary) {
        this.displayMonthlySummary(monthlySummary);
      }
    } catch (error) {
      console.error('Error loading monthly summary:', error);
      this.showError('Failed to load monthly summary');
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

  displayDailySummary(summary) {
    const pagesCount = document.getElementById('daily-pages-count');
    const categories = document.getElementById('daily-categories');
    const timeChart = document.getElementById('daily-time-chart');

    pagesCount.textContent = summary.totalPages;

    // Display categories
    categories.innerHTML = Object.entries(summary.categories)
      .sort(([,a], [,b]) => b - a)
      .map(([category, count]) => `
        <div class="category-tag">
          ${category}: ${count}
        </div>
      `).join('');

    // Display time distribution
    timeChart.innerHTML = this.createTimeDistributionChart(summary.timeDistribution);
  }

  displayMonthlySummary(summary) {
    const pagesCount = document.getElementById('monthly-pages-count');
    const dailyAvg = document.getElementById('monthly-daily-avg');
    const categoryChart = document.getElementById('monthly-category-chart');

    pagesCount.textContent = summary.totalPages;
    dailyAvg.textContent = `${summary.dailyAverages.pages} pages/day`;

    // Display category distribution
    categoryChart.innerHTML = Object.entries(summary.categories)
      .sort(([,a], [,b]) => b - a)
      .map(([category, count]) => `
        <div class="category-tag">
          ${category}: ${count}
        </div>
      `).join('');
  }

  createTimeDistributionChart(timeData) {
    // Simple bar chart representation
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return `
      <div style="display: flex; align-items: flex-end; height: 150px; gap: 2px;">
        ${hours.map(hour => {
          const count = timeData[hour] || 0;
          const height = count ? Math.max(20, (count / Math.max(...Object.values(timeData))) * 150) : 20;
          return `
            <div style="flex: 1; background: #007bff; height: ${height}px; position: relative;">
              <span style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 10px;">
                ${hour}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  setupClearButton() {
    this.clearButton.onclick = async () => {
      if (confirm('Are you sure you want to clear all stored data?')) {
        try {
          await databaseService.clearAllData();
          this.summariesContainer.innerHTML = '<p style="text-align: center; color: #666;">No summaries for today yet.</p>';
          document.getElementById('daily-pages-count').textContent = '0';
          document.getElementById('daily-categories').innerHTML = '';
          document.getElementById('daily-time-chart').innerHTML = '';
          document.getElementById('monthly-pages-count').textContent = '0';
          document.getElementById('monthly-daily-avg').textContent = '0 pages/day';
          document.getElementById('monthly-category-chart').innerHTML = '';
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