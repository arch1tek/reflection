class ContentExtractor {
  static extractPageContent() {
    const title = document.title;
    const content = document.body.innerText;
    console.log("Extracted content:", { title, content });
    return { title, content };
  }
}

// Automatically process the page when the content script runs
async function processWebPage() {
  const content = ContentExtractor.extractPageContent();
  chrome.runtime.sendMessage({ action: "storeSummary", data: content });
}

processWebPage()