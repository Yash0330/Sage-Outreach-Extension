// Phase 3: Scrape Sent Invitations
document
  .getElementById("scrapeInvitesBtn")
  .addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.includes("linkedin.com/mynetwork/invitation-manager/sent")) {
      document.getElementById("status").innerText =
        "Scraping Sent Invitations...";
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scrape_invites.js"],
      });
    } else {
      document.getElementById("status").innerText =
        "Error: Navigate to your 'Sent' Invitations page first.";
      document.getElementById("status").style.color = "red";
    }
  });
