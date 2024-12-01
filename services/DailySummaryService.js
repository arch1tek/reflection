class DailySummaryService {
  static RETENTION_DAYS = 7; // Configurable retention period

  static async aggregateDailySummary(summaries) {
    try {
      const session = await chrome.aiOriginTrial.languageModel.create();
      const categoryStats = this.calculateCategoryStats(summaries);
      
      // Get quirky insights using LLM
      const quirkyInsights = await this.generateQuirkyInsights(session, summaries, categoryStats);

      return {
        date: new Date().toISOString().split('T')[0],
        categoryStats,
        totalPages: summaries.length,
        quirkyInsights,
        topCategories: this.getTopCategories(categoryStats, 3)
      };
    } catch (error) {
      console.error('Error aggregating daily summary:', error);
      throw error;
    }
  }

  static calculateCategoryStats(summaries) {
    const stats = {};
    summaries.forEach(item => {
      if (!stats[item.category]) {
        stats[item.category] = {
          count: 0,
          titles: []
        };
      }
      stats[item.category].count++;
      stats[item.category].titles.push(item.title);
    });
    return stats;
  }

  static getTopCategories(categoryStats, limit) {
    return Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, limit)
      .map(([category]) => category);
  }

  static async generateQuirkyInsights(session, summaries, categoryStats) {
    const prompt = `
      Based on this user's browsing data for today:
      Categories: ${Object.entries(categoryStats).map(([cat, data]) => 
        `${cat} (${data.count} pages)`).join(', ')}
      
      Generate 3 quirky, fun insights about their browsing habits. Be creative and humorous!
      Format as JSON array of strings. Example:
      ["You're a real JavaScript ninja today! 🥷 80% of your tech reading was about JS."]
    `;

    const response = await session.prompt(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return ["Had trouble generating insights today 🤔"];
    }
  }
}

export default DailySummaryService; 
// empty commit