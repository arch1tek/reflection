// Extract page content (title and body text)
function extractContent() {
    const title = document.title;
    const content = document.body.innerText;
    return { title, content };
  }
  
  // Summarize the content of the page using the language model
  async function summarizeContent(content) {
    const session = await chrome.aiOriginTrial.languageModel.create();
    const result = await session.prompt(`Summarize the following content: ${content}`);
    return result;
  }
  
  // Trigger summary when the page is loaded
  async function processPage() {
    const { title, content } = extractContent();
    const summary = await summarizeContent(content);
    
    const pageData = {
      title: title,
      summary: summary
    };
  
    chrome.runtime.sendMessage({ action: "storeSummary", data: pageData });
  }
  
  processPage();
  