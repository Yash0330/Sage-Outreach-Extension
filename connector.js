async function runOutreachBot(maxConnections) {
  console.log("Starting Sage Outreach Bot...");

  // 1. SCROLL FIX: Scroll to the bottom to force all LinkedIn lazy-loaded buttons to render
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise((r) => setTimeout(r, 2500)); // Wait 2.5 seconds for the network to load the buttons

  // 2. Find all buttons that contain the exact text "Connect"
  let connectButtons = [];
  let allSpans = document.querySelectorAll("span");

  for (let span of allSpans) {
    if (span.textContent.trim() === "Connect") {
      let card = span.closest(".reusable-search__result-container");
      let btn = span.closest("button");

      // Ensure it's a valid, clickable button attached to a person's card
      if (card && btn && !btn.disabled) {
        connectButtons.push({ button: btn, card: card });
      }
    }
  }

  // If the founders have strict privacy settings and no Connect buttons exist
  if (connectButtons.length === 0) {
    alert(
      "No 'Connect' buttons found. These executives likely have strict privacy settings (showing 'Message' or 'Follow'). Click 'Load Next Target' to move to the next company.",
    );
    return;
  }

  let sentCount = 0;
  let limit = Math.min(maxConnections, connectButtons.length);

  for (let i = 0; i < limit; i++) {
    let lead = connectButtons[i];

    // 3. Extract Lead Info
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

    // 4. Initiate Connection
    lead.button.scrollIntoView({ behavior: "smooth", block: "center" });
    await new Promise((r) => setTimeout(r, 1500));
    lead.button.click();

    // Wait for the LinkedIn connection modal
    await new Promise((r) => setTimeout(r, 2000));

    // 5. Handle the Modal
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

      // 6. Send data to Google Sheets
      chrome.runtime.sendMessage({
        action: "saveData",
        data: {
          type: "person",
          name: name,
          title: title,
          profileUrl: profileUrl,
          company: "Extracted from Search",
        },
      });

      // 7. ANTI-BAN PROTOCOL
      if (i < limit - 1) {
        let delay = Math.floor(Math.random() * (35000 - 15000 + 1) + 15000);
        console.log(`Waiting ${Math.round(delay / 1000)} seconds...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    } else {
      console.warn(`Could not find 'Send' button for ${name}. Closing modal.`);
      let closeBtn = document.querySelector(".artdeco-modal__dismiss");
      if (closeBtn) closeBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  alert(
    `Outreach complete! Sent ${sentCount} connection requests. Check your Google Sheet.`,
  );
}

// Fixed line to prevent variable redeclaration errors
const maxToConnect = window.SAGE_MAX_CONNECTIONS || 5;
runOutreachBot(maxToConnect);
