async function scrapePaginatedCompanies(maxPages) {
  let totalScraped = 0;

  for (let i = 0; i < maxPages; i++) {
    console.log(`Scraping page ${i + 1} of ${maxPages}...`);

    // 1. Scroll to the bottom to ensure lazy-loaded images/links render
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 2. Use a Map to store unique companies
    let companies = new Map();

    // 3. Find ANY link on the page containing "/company/"
    const links = document.querySelectorAll('a[href*="/company/"]');

    links.forEach((link) => {
      let cleanUrl = link.href.split("?")[0];
      let companyName = link.innerText.trim().split("\n")[0];

      // THE FIX: Identify and filter out LinkedIn's social proof junk text
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
        // THE FIX: Only save the name if we haven't already saved one for this URL.
        // The real company name always comes first in the DOM, so this locks it in and prevents overwriting.
        if (!companies.has(cleanUrl)) {
          companies.set(cleanUrl, companyName);
        }
      }
    });

    // 4. Send the unique companies to the Background script
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

    // 5. If this is the last page, break the loop early
    if (i === maxPages - 1) {
      break;
    }

    // 6. Search the DOM for the exact text "Next"
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

    // Scroll the button exactly into the center of the viewport
    nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Click it
    nextBtn.click();

    // Wait 5 seconds for the next page of companies to load
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  alert(
    `Scraping complete! Extracted ${totalScraped} companies across ${maxPages} pages. Duplicates ignored.`,
  );
}

// Fixed line to prevent variable redeclaration errors
scrapePaginatedCompanies(window.SAGE_PAGES_TO_SCRAPE || 1);
