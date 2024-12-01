class ContentExtractor {
  extractContent() {
    const title = document.title;
    const content = document.body.innerText;
    return { title, content };
  }

  sendForProcessing() {
    const extractedContent = this.extractContent();
    chrome.runtime.sendMessage({ 
      action: "processContent", 
      data: {
        ...extractedContent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Initialize and run
const extractor = new ContentExtractor();
extractor.sendForProcessing();
  