class BioGeneratorService {
  static async generateBio(trends, recentPages) {
    console.log('Generating bio with:', {
      trendsCount: trends.length,
      recentPagesCount: recentPages.length
    });

    try {
      console.log('Creating AI session...');
      const session = await chrome.aiOriginTrial.languageModel.create();
      
      console.log('Creating bio prompt...');
      const prompt = this.createBioPrompt(trends, recentPages);
      
      console.log('Starting streaming prompt...');
      const stream = session.promptStreaming(prompt);
      
      let result = '';
      let previousChunk = '';

      for await (const chunk of stream) {
        const newChunk = chunk.startsWith(previousChunk)
          ? chunk.slice(previousChunk.length)
          : chunk;
        
        console.log('Received chunk:', newChunk);
        result += newChunk;
        previousChunk = chunk;

        // Emit the partial bio through a custom event
        this.emitBioUpdate(result);
      }

      console.log('Final bio generated:', result);
      return result;
    } catch (error) {
      console.error("Error generating bio:", error);
      console.error("Error details:", {
        trends,
        recentPages,
        errorMessage: error.message,
        errorStack: error.stack
      });
      return "Unable to generate bio at this time.";
    }
  }

  static emitBioUpdate(partialBio) {
    const event = new CustomEvent('bioUpdate', { 
      detail: { bio: partialBio }
    });
    window.dispatchEvent(event);
  }

  static createBioPrompt(trends, recentPages) {
    console.log('Creating bio prompt with trends:', trends);
    const prompt = `
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
    console.log('Generated prompt:', prompt);
    return prompt;
  }
}

export default BioGeneratorService; 