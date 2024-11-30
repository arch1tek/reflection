// Function to render summaries in the popup
function renderSummaries() {
  chrome.storage.local.get({ summaryDatabase: [] }, (data) => {
    const summariesDiv = document.getElementById("summaries");
    summariesDiv.innerHTML = ""; // Clear any existing content

    if (data.summaryDatabase.length === 0) {
      summariesDiv.innerHTML = "<p>No summaries available.</p>";
      return;
    }

    data.summaryDatabase.forEach((item) => {
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
  chrome.storage.local.set({ summaryDatabase: [] }, () => {
    console.log("All data cleared.");
    renderSummaries(); // Refresh the UI
  });
}

// Initialize the popup
document.addEventListener("DOMContentLoaded", () => {
  renderSummaries();

  const clearButton = document.getElementById("clearData");
  clearButton.addEventListener("click", clearSummaries);
});
