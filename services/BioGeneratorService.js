class BioGeneratorService {
  static async generateBio(trends, recentPages) {
    try {
      const session = await chrome.aiOriginTrial.languageModel.create();
      const prompt = this.createBioPrompt(trends, recentPages);
      return await session.prompt(prompt);
    } catch (error) {
      console.error("Error generating bio:", error);
      return "Unable to generate bio at this time.";
    }
  }

  static createBioPrompt(trends, recentPages) {
    return `
      Based on this user's browsing patterns and recent activity:

      Overall Interests:
      ${trends.map(t => `- ${t.percentage}% ${t.category}`).join('\n')}

      Recent Browsing Activity:
      ${recentPages.map(page => `
      Title: ${page.title}
      Category: ${page.category}
      Summary: ${page.summary}
      `).join('\n')}

      Generate a personalized, friendly bio (2-3 sentences) that describes this person's interests and recent focus areas.
      Make it conversational and highlight both their main interests and any interesting recent topics they've explored.
      Don't list percentages directly, but rather weave the interests naturally into the narrative.
    `;
  }
}

export default BioGeneratorService; 