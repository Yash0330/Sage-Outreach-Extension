document.getElementById("scrapeBtn").addEventListener("click", async () => {
  let pageLimit = document.getElementById("pageLimit").value;
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes("linkedin.com/search/results/companies")) {
    document.getElementById("status").innerText =
      `Scraping ${pageLimit} pages... Do not close the tab.`;

    // Pass the limit to the page's memory
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (limit) => {
        window.SAGE_PAGES_TO_SCRAPE = parseInt(limit);
      },
      args: [pageLimit],
    });

    // Execute the scraper
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  } else {
    document.getElementById("status").innerText =
      "Error: Navigate to LinkedIn Company Search first.";
    document.getElementById("status").style.color = "red";
  }
});
