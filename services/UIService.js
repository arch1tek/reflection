class UIService {
  static createProfileSection(bio, trends, stats) {
    return `
      <div class="profile-section">
        <h3>Your Browsing Profile</h3>
        ${this.createBioSection(bio)}
        ${this.createTrendsSection(trends)}
        ${this.createStatsSection(stats)}
      </div>
    `;
  }

  static createBioSection(bio) {
    return `
      <div class="bio-section">
        <h4>About You</h4>
        <p>${bio}</p>
      </div>
    `;
  }

  static createTrendsSection(trends) {
    return `
      <div class="trends-section">
        <h4>Your Interests</h4>
        <div class="trends-container">
          ${trends.map(trend => this.createTrendItem(trend)).join('')}
        </div>
      </div>
    `;
  }

  static createTrendItem(trend) {
    return `
      <div class="trend-item">
        <div class="trend-bar" style="width: ${trend.percentage}%"></div>
        <span class="trend-label">${trend.category}</span>
        <span class="trend-percentage">${trend.percentage}%</span>
      </div>
    `;
  }

  static createStatsSection(stats) {
    return `
      <div class="stats-section">
        <h4>Quick Stats</h4>
        <p>Pages Analyzed: ${stats.totalPages}</p>
        <p>Top Category: ${stats.topCategory}</p>
        <p>Categories Explored: ${stats.categoriesExplored}</p>
      </div>
    `;
  }

  static createSummaryItem(item) {
    return `
      <div class="summary-item">
        <strong>${item.title}</strong>
        <div class="category">Category: ${item.category}</div>
        <div class="summary-text">${item.summary}</div>
      </div>
    `;
  }
}

export default UIService; 