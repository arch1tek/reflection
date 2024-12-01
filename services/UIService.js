class UIService {
  static createProfileSection(bio, trends, stats) {
    console.log('Creating profile section with:', {
      bioLength: bio.length,
      trendsCount: trends.length,
      stats
    });

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
        <p id="streaming-bio">${bio}</p>
      </div>
    `;
  }

  static updateBioContent(bio) {
    const bioElement = document.getElementById('streaming-bio');
    if (bioElement) {
      bioElement.textContent = bio;
    }
  }

  static createTrendsSection(trends) {
    console.log('Creating trends section with', trends.length, 'trends');
    const section = `
      <div class="trends-section">
        <h4>Your Interests</h4>
        <div class="trends-container">
          ${trends.map(trend => {
            console.log('Processing trend:', trend);
            return this.createTrendItem(trend);
          }).join('')}
        </div>
      </div>
    `;
    return section;
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
    console.log('Creating summary item:', {
      title: item.title,
      category: item.category,
      summaryLength: item.summary.length
    });
    
    return `
      <div class="summary-item">
        <strong>${item.title}</strong>
        <div class="category">Category: ${item.category}</div>
        <div class="summary-text">${item.summary}</div>
      </div>
    `;
  }
}

// Add event listener for bio updates
window.addEventListener('bioUpdate', (event) => {
  UIService.updateBioContent(event.detail.bio);
});

export default UIService; 