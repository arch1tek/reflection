class AnalyticsService {
    static async analyzeTrends(summaries) {
      try {
        console.log('Analyzing trends for summaries:', summaries);
        const categoryCount = {};
        summaries.forEach(item => {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });
  
        const total = summaries.length;
        const trends = Object.entries(categoryCount).map(([category, count]) => ({
          category,
          percentage: ((count / total) * 100).toFixed(1)
        }));
  
        const sortedTrends = trends.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
        console.log('Analyzed trends:', sortedTrends);
        return sortedTrends;
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
  
    static getStats(summaries, trends) {
      try {
        const stats = {
          totalPages: summaries.length,
          topCategory: trends[0]?.category || 'N/A',
          categoriesExplored: trends.length
        };
        console.log('Generated stats:', stats);
        return stats;
      } catch (error) {
        console.error('Error getting stats:', error);
        throw error;
      }
    }
  }
  
  export default AnalyticsService;