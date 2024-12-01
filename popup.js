// Function to analyze categories and generate trends
async function analyzeTrends(summaries) {
  const categoryCount = {};
  summaries.forEach(item => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
  });

  // Calculate percentages
  const total = summaries.length;
  const trends = Object.entries(categoryCount).map(([category, count]) => ({
    category,
    percentage: ((count / total) * 100).toFixed(1)
  }));

  return trends.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
}

// Function to generate user bio based on browsing patterns
async function generateUserBio(summaries) {
  const session = await chrome.aiOriginTrial.languageModel.create();
  const trends = await analyzeTrends(summaries);
  
  // Get the most recent 10 pages for context
  const recentPages = summaries.slice(-10).map(item => ({
    title: item.title,
    category: item.category,
    summary: item.summary
  }));

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

  try {
    const bio = await session.prompt(prompt);
    return bio;
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Unable to generate bio at this time.";
  }
}

// Function to render the profile page
async function renderProfile(summaries) {
  const profileDiv = document.getElementById("profile");
  const trends = await analyzeTrends(summaries);
  const bio = await generateUserBio(summaries);

  // Create the profile HTML
  const profileHTML = `
    <div class="profile-section">
      <h3>Your Browsing Profile</h3>
      <div class="bio-section">
        <h4>About You</h4>
        <p>${bio}</p>
      </div>
      
      <div class="trends-section">
        <h4>Your Interests</h4>
        <div class="trends-container">
          ${trends.map(trend => `
            <div class="trend-item">
              <div class="trend-bar" style="width: ${trend.percentage}%"></div>
              <span class="trend-label">${trend.category}</span>
              <span class="trend-percentage">${trend.percentage}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="stats-section">
        <h4>Quick Stats</h4>
        <p>Pages Analyzed: ${summaries.length}</p>
        <p>Top Category: ${trends[0]?.category || 'N/A'}</p>
        <p>Categories Explored: ${trends.length}</p>
      </div>
    </div>
  `;

  profileDiv.innerHTML = profileHTML;
}

// Modified renderSummaries function
function renderSummaries() {
  chrome.storage.local.get({ summaryDatabase: [] }, async (data) => {
    const summariesDiv = document.getElementById("summaries");
    const profileDiv = document.createElement("div");
    profileDiv.id = "profile";
    summariesDiv.parentNode.insertBefore(profileDiv, summariesDiv);

    if (data.summaryDatabase.length === 0) {
      summariesDiv.innerHTML = "<p>No summaries available.</p>";
      return;
    }

    // Render profile first
    await renderProfile(data.summaryDatabase);

    // Then render summaries
    summariesDiv.innerHTML = "<h3>Recent Activity</h3>";
    
    // Show only the last 5 summaries
    const recentSummaries = data.summaryDatabase.slice(-5);
    recentSummaries.forEach((item) => {
      const summaryElement = document.createElement("div");
      summaryElement.className = "summary-item";

      summaryElement.innerHTML = `
        <strong>${item.title}</strong>
        <div class="category">Category: ${item.category}</div>
        <div class="summary-text">${item.summary}</div>
      `;

      summariesDiv.appendChild(summaryElement);
    });
  });
}

// Function to clear stored summaries
function clearSummaries() {
  if (confirm("Are you sure you want to clear all your browsing data?")) {
    chrome.storage.local.set({ summaryDatabase: [] }, () => {
      console.log("All data cleared.");
      renderSummaries(); // Refresh the UI
    });
  }
}

// Initialize the popup
document.addEventListener("DOMContentLoaded", () => {
  renderSummaries();

  const clearButton = document.getElementById("clearData");
  clearButton.addEventListener("click", clearSummaries);
});
