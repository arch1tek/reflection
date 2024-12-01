class AnalyticsService {
    static async analyzeTrends(currentSummaries, dailySummaries = {}) {
      console.log('Starting trend analysis:', {
        currentSummariesCount: currentSummaries.length,
        dailySummariesCount: Object.keys(dailySummaries).length
      });
      
      try {
        const categoryCount = {};
        
        // Process historical daily summaries
        Object.values(dailySummaries).forEach(day => {
          console.log('Processing daily summary:', day);
          Object.entries(day.categoryStats).forEach(([category, stats]) => {
            categoryCount[category] = (categoryCount[category] || 0) + stats.count;
          });
        });

        // Add current day's summaries
        currentSummaries.forEach(item => {
          console.log('Processing current summary:', item.category);
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });

        const total = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
        console.log('Total items processed:', total);

        const trends = Object.entries(categoryCount).map(([category, count]) => ({
          category,
          percentage: ((count / total) * 100).toFixed(1)
        }));

        console.log('Generated trends:', trends);
        return trends.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
      } catch (error) {
        console.error('Error analyzing trends:', error);
        throw error;
      }
    }
  
    static getRecentActivities(summaries, limit = 10) {
      try {
        const recentActivities = summaries.slice(-limit).map(item => ({
          title: item.title,
          category: item.category,
          summary: item.summary
        }));
        console.log('Recent activities:', recentActivities);
        return recentActivities;
      } catch (error) {
        console.error('Error getting recent activities:', error);
        throw error;
      }
    }
  
    static getStats(currentSummaries, trends, dailySummaries = {}) {
      try {
        const totalDays = Object.keys(dailySummaries).length + 1;
        const totalPages = currentSummaries.length + 
          Object.values(dailySummaries).reduce((sum, day) => sum + day.totalPages, 0);

        const stats = {
          totalPages,
          totalDays,
          topCategory: trends[0]?.category || 'N/A',
          categoriesExplored: trends.length,
          averagePagesPerDay: (totalPages / totalDays).toFixed(1),
          mostProductiveDay: this.findMostProductiveDay(dailySummaries),
          streakInsights: this.analyzeStreaks(dailySummaries)
        };

        return stats;
      } catch (error) {
        console.error('Error getting stats:', error);
        throw error;
      }
    }
  
    static findMostProductiveDay(dailySummaries) {
      let maxPages = 0;
      let productiveDay = 'Today';

      Object.entries(dailySummaries).forEach(([date, summary]) => {
        if (summary.totalPages > maxPages) {
          maxPages = summary.totalPages;
          productiveDay = date;
        }
      });

      return { date: productiveDay, pages: maxPages };
    }
  
    static analyzeStreaks(dailySummaries) {
      // Analyze category streaks
      const streaks = {};
      Object.values(dailySummaries).forEach(day => {
        day.topCategories.forEach(category => {
          streaks[category] = (streaks[category] || 0) + 1;
        });
      });

      return Object.entries(streaks)
        .map(([category, days]) => `${category} streak: ${days} days`)
        .sort((a, b) => b.split(': ')[1] - a.split(': ')[1])
        .slice(0, 3);
    }
  }
  
  export default AnalyticsService;