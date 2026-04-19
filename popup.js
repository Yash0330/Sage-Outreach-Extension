const GOOGLE_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxEwTZBLoEw51ihuTPCDvDaKkcvkQJ96wV1Hbkr1v01lxT6K8ni0oPkTGlVrfnO0Z1E/exec";

// Phase 1: Scrape
document.getElementById("scrapeBtn").addEventListener("click", async () => {
  let pageLimit = document.getElementById("pageLimit").value;
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes("linkedin.com/search/results/")) {
    document.getElementById("status").innerText =
      `Scraping ${pageLimit} pages...`;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (limit) => {
        window.SAGE_PAGES_TO_SCRAPE = parseInt(limit);
      },
      args: [pageLimit],
    });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  } else {
    document.getElementById("status").innerText =
      "Error: Navigate to LinkedIn Search.";
  }
});

// Phase 2A: Load Target (The Step You Missed)
document.getElementById("loadTargetBtn").addEventListener("click", async () => {
  document.getElementById("status").innerText = "Fetching next company...";

  try {
    let response = await fetch(GOOGLE_WEB_APP_URL + "?action=getNext");
    let data = await response.json();

    if (data.status === "success") {
      let companyName = data.name;

      // Construct a GLOBAL people search URL targeting founders/VPs at this specific company
      let searchQuery = `"${companyName}" (Founder OR "Co-Founder" OR CEO OR VP)`;
      let searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`;

      document.getElementById("status").innerText =
        `Searching leaders at: ${companyName}`;

      // Open the pre-filtered global search page in a new Chrome tab
      chrome.tabs.create({ url: searchUrl });
    } else if (data.status === "empty") {
      document.getElementById("status").innerText =
        "All caught up! No pending companies.";
    }
  } catch (error) {
    document.getElementById("status").innerText =
      "Error connecting to Google Sheet.";
    console.error(error);
  }
});

// Phase 2B: Connect Bot
document.getElementById("connectBtn").addEventListener("click", async () => {
  let connectLimit = document.getElementById("connectLimit").value;
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Verify we are on a People Search page before running the connector
  if (tab.url.includes("linkedin.com/search/results/people")) {
    document.getElementById("status").innerText =
      `Connecting with top ${connectLimit} leads...`;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (limit) => {
        window.SAGE_MAX_CONNECTIONS = parseInt(limit);
      },
      args: [connectLimit],
    });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["connector.js"],
    });
  } else {
    document.getElementById("status").innerText =
      "Error: Must be on a People Search page.";
  }
});
