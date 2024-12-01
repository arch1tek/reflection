chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "storeSummary") {
    (async () => {
      console.log("Message received:", message);
      try {
        const { title, content } = message.data;
        const { summary, category } = await ModelManager.getSummaryAndCategory(title, content);

        await StorageManager.storeSummary({ title, summary, category });
        sendResponse({ status: "success", summary, category });
      } catch (error) {
        console.error("Error processing storeSummary action:", error);
        sendResponse({ status: "error", error: error.message });
      }
    })();
    return true; // Keep the messaging channel open for async response
  } else {
    sendResponse({ status: "unknown action" });
    return false;
  }
});

// On installation, check the model's readiness
chrome.runtime.onInstalled.addListener(async () => {
  const isReady = await ModelManager.isModelReady();
  if (!isReady) await ModelManager.checkAndDownloadModel();
  console.log("AI model is ready for use.");
});

// Clear storage on startup (optional)
chrome.runtime.onStartup.addListener(() => {
  StorageManager.clearStorage();
});
