async function scrapeCompanies() {
  // 1. Scroll to the bottom to ensure lazy-loaded images/links render
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds for DOM to settle

  // 2. Select all search result containers
  const resultCards = document.querySelectorAll(
    ".reusable-search__result-container",
  );
  let count = 0;

  resultCards.forEach((card) => {
    // LinkedIn DOM changes frequently, but the main entity link is usually stable
    const linkElement = card.querySelector(".entity-result__title-text a");

    if (linkElement) {
      // Clean up the URL to remove tracking parameters
      let rawUrl = linkElement.href;
      let cleanUrl = rawUrl.split("?")[0];

      let companyName = linkElement.innerText.trim();

      // Send to Background Script
      chrome.runtime.sendMessage({
        action: "saveData",
        data: {
          type: "company",
          companyName: companyName,
          companyUrl: cleanUrl,
        },
      });
      count++;
    }
  });

  alert(`Scraping complete! Sent ${count} companies to your Google Sheet.`);
}

scrapeCompanies();
