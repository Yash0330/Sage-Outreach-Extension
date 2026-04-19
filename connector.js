async function runOutreachBot(maxConnections) {
  console.log("Starting Sage Outreach Bot...");

  // 1. Find all buttons that contain the exact text "Connect"
  let connectButtons = [];
  let allSpans = document.querySelectorAll("span");

  for (let span of allSpans) {
    if (span.textContent.trim() === "Connect") {
      // Ensure it belongs to a search result card, not random UI navigation
      let card = span.closest(".reusable-search__result-container");
      let btn = span.closest("button");
      if (card && btn && !btn.disabled) {
        connectButtons.push({ button: btn, card: card });
      }
    }
  }

  if (connectButtons.length === 0) {
    alert(
      "No valid 'Connect' buttons found on this page. They may already be connections, or you need to scroll down.",
    );
    return;
  }

  let sentCount = 0;
  let limit = Math.min(maxConnections, connectButtons.length);

  for (let i = 0; i < limit; i++) {
    let lead = connectButtons[i];

    // 2. Extract Lead Info safely using text node matching to bypass obfuscated classes
    let nameElement = lead.card.querySelector(
      '.entity-result__title-text a span[aria-hidden="true"]',
    );
    let titleElement = lead.card.querySelector(
      ".entity-result__primary-subtitle",
    );
    let linkElement = lead.card.querySelector(".entity-result__title-text a");

    let name = nameElement ? nameElement.textContent.trim() : "Unknown Lead";
    let title = titleElement
      ? titleElement.textContent.trim()
      : "Unknown Title";
    let profileUrl = linkElement ? linkElement.href.split("?")[0] : "No URL";

    console.log(`Targeting: ${name} | ${title}`);

    // 3. Initiate Connection (Scroll and Click)
    lead.button.scrollIntoView({ behavior: "smooth", block: "center" });
    await new Promise((r) => setTimeout(r, 1500)); // Pause after scrolling
    lead.button.click();

    // Wait for the LinkedIn connection modal to pop up
    await new Promise((r) => setTimeout(r, 2000));

    // 4. Handle the Modal
    let modalButtons = document.querySelectorAll(".artdeco-modal button");
    let sendBtn = Array.from(modalButtons).find(
      (b) =>
        b.textContent.trim() === "Send" ||
        b.textContent.trim() === "Send without a note",
    );

    if (sendBtn) {
      sendBtn.click();
      sentCount++;
      console.log(`Successfully sent to ${name}`);

      // 5. Send data to Google Sheets Background Script
      chrome.runtime.sendMessage({
        action: "saveData",
        data: {
          type: "person",
          name: name,
          title: title,
          profileUrl: profileUrl,
          company: "Extracted from Search", // Kept simple to avoid DOM breakage
        },
      });

      // 6. ANTI-BAN PROTOCOL: Randomized Delay
      // We must wait between 15 and 35 seconds before the next click.
      if (i < limit - 1) {
        // Don't wait if it's the final connection
        let delay = Math.floor(Math.random() * (35000 - 15000 + 1) + 15000);
        console.log(
          `Humanizing delay: Waiting ${Math.round(delay / 1000)} seconds...`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    } else {
      console.warn(
        `Could not find 'Send' button in modal for ${name}. Closing modal.`,
      );
      let closeBtn = document.querySelector(".artdeco-modal__dismiss");
      if (closeBtn) closeBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  alert(
    `Outreach complete! Sent ${sentCount} connection requests. Check your Google Sheet.`,
  );
}

const maxToConnect = window.SAGE_MAX_CONNECTIONS || 5;
runOutreachBot(maxToConnect);
