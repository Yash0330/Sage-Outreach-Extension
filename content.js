// Wrap the entire script in an anonymous function to isolate memory
(() => {
  async function scrapePaginatedCompanies(maxPages) {
    let totalScraped = 0;

    for (let i = 0; i < maxPages; i++) {
      console.log(`Scraping page ${i + 1} of ${maxPages}...`);

      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      let companies = new Map();
      const links = document.querySelectorAll('a[href*="/company/"]');

      links.forEach((link) => {
        let cleanUrl = link.href.split("?")[0];
        let companyName = link.innerText.trim().split("\n")[0];

        const isJunkText =
          /connections?|follows? this page|followers?|not applicable/i.test(
            companyName,
          );

        if (
          companyName &&
          !isJunkText &&
          companyName.toLowerCase() !== "follow" &&
          !cleanUrl.includes("/life") &&
          !cleanUrl.includes("/about")
        ) {
          if (!companies.has(cleanUrl)) {
            companies.set(cleanUrl, companyName);
          }
        }
      });

      companies.forEach((companyName, companyUrl) => {
        chrome.runtime.sendMessage({
          action: "saveData",
          data: {
            type: "company",
            companyName: companyName,
            companyUrl: companyUrl,
          },
        });
        totalScraped++;
      });

      if (i === maxPages - 1) break;

      let nextBtn = null;
      let allSpans = document.querySelectorAll("span");

      for (let span of allSpans) {
        if (span.textContent.trim() === "Next") {
          nextBtn = span.closest("button") || span;
          break;
        }
      }

      if (!nextBtn || nextBtn.disabled) {
        console.log("No more pages available or Next button disabled.");
        break;
      }

      nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      nextBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    alert(
      `Scraping complete! Extracted ${totalScraped} companies across ${maxPages} pages. Duplicates ignored.`,
    );
  }

  // Execute using the isolated scope
  scrapePaginatedCompanies(window.SAGE_PAGES_TO_SCRAPE || 1);
})();
