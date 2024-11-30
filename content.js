// Extract page content (title and body text)
function extractContent() {
  const title = document.title;
  const content = document.body.innerText;
  return { title, content };
}

// Use Google's AI prompt API to summarize and classify content
async function getSummaryAndCategory(title, content) {
  try {
    const session = await chrome.aiOriginTrial.languageModel.create();

    const prompt = `
    You are an assistant tasked with summarizing webpage content and classifying its topic. 
    Given the following webpage title and content, please summarize the content and classify it into a category 
    (e.g., technology, health, sports, finance, entertainment, etc.).

    Title: ${title}
    Content: ${content}

    Respond in JSON format:
    {
      "summary": "<Summary of the content>",
      "category": "<Category>"
    }
    `;

    const result = await session.prompt(prompt);

    // Parse and return the JSON response
    const parsedResult = JSON.parse(result);
    return parsedResult; // Contains {summary, category}
  } catch (error) {
    console.error("Error summarizing or classifying content:", error);
    return {
      summary: "Unable to summarize the content.",
      category: "Unknown",
    };
  }
}

// Main function to process the current webpage
async function processWebPage() {
  try {
    const { title, content } = extractContent();

    // Get the summary and category
    const { summary, category } = await getSummaryAndCategory(title, content);

    console.log("Summary:", summary);
    console.log("Category:", category);

    // Optionally, send it to the background script for storage
    chrome.runtime.sendMessage({ 
      action: "storeSummary", 
      data: { title, summary, category } 
    });
  } catch (error) {
    console.error("Error processing webpage:", error);
  }
}

// Automatically process the page when the content script runs
processWebPage();
