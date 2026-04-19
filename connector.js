async function runOutreachBot(maxConnections) {
  console.log("Starting Sage Outreach Bot...");

  // 1. GRADUATED SCROLL FIX: Scroll down slowly to ensure LinkedIn's React framework loads all buttons
  for (let i = 1; i <= 3; i++) {
    window.scrollTo(0, (document.body.scrollHeight / 3) * i);
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 2. THE ULTIMATE TARGETING FIX: Check the visual text of the buttons
  let allButtons = document.querySelectorAll("button");
  let connectButtons = [];

  allButtons.forEach((btn) => {
    // innerText ignores all the hidden HTML, SVGs, and spans, leaving only what is visible on screen
    let visibleText = btn.innerText ? btn.innerText.trim() : "";

    // Check if the button visually says exactly "Connect"
    if (visibleText === "Connect") {
      let card = btn.closest(".reusable-search__result-container");
      if (card && !btn.disabled) {
        connectButtons.push({ button: btn, card: card });
      }
    }
  });

  if (connectButtons.length === 0) {
    alert(
      "No 'Connect' buttons found on this page. They might be out of network or locked. Try 'Load Next Target'.",
    );
    return;
  }

  let sentCount = 0;
  let limit = Math.min(maxConnections, connectButtons.length);

  for (let i = 0; i < limit; i++) {
    let lead = connectButtons[i];

    // 3. Extract Lead Info (using innerText here too for cleaner data)
    let nameElement = lead.card.querySelector(
      '.entity-result__title-text span[aria-hidden="true"]',
    );
    if (!nameElement)
      nameElement = lead.card.querySelector(".entity-result__title-text a"); // Fallback

    let titleElement = lead.card.querySelector(
      ".entity-result__primary-subtitle",
    );
    let linkElement = lead.card.querySelector(".entity-result__title-text a");

    let name = nameElement ? nameElement.innerText.trim() : "Unknown Lead";
    let title = titleElement ? titleElement.innerText.trim() : "Unknown Title";
    let profileUrl = linkElement ? linkElement.href.split("?")[0] : "No URL";

    console.log(`Targeting: ${name} | ${title}`);

    // 4. Initiate Connection
    lead.button.scrollIntoView({ behavior: "smooth", block: "center" });
    await new Promise((r) => setTimeout(r, 1500));
    lead.button.click();

    // Wait for the LinkedIn connection modal
    await new Promise((r) => setTimeout(r, 2500));

    // 5. BULLETPROOF MODAL HANDLING
    let modal = document.querySelector(".artdeco-modal");
    if (modal) {
      let modalButtons = modal.querySelectorAll("button");
      let sendBtn = null;

      // Search for the specific Send button variants based on visible text
      for (let b of modalButtons) {
        let text = b.innerText ? b.innerText.trim().toLowerCase() : "";
        if (text === "send" || text === "send without a note") {
          sendBtn = b;
          break;
        }
      }

      // Fallbacks just in case
      if (!sendBtn)
        sendBtn = modal.querySelector(
          'button[aria-label="Send without a note"]',
        );
      if (!sendBtn)
        sendBtn = modal.querySelector('button[aria-label="Send now"]');

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

        // Wait for modal to close fully
        await new Promise((r) => setTimeout(r, 1500));

        // 7. ANTI-BAN PROTOCOL
        if (i < limit - 1) {
          let delay = Math.floor(Math.random() * (35000 - 15000 + 1) + 15000);
          console.log(`Waiting ${Math.round(delay / 1000)} seconds...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      } else {
        console.warn(
          `Could not find 'Send' button for ${name}. Closing modal.`,
        );
        let closeBtn = modal.querySelector('button[aria-label="Dismiss"]');
        if (!closeBtn)
          closeBtn = modal.querySelector(".artdeco-modal__dismiss");
        if (closeBtn) closeBtn.click();
        await new Promise((r) => setTimeout(r, 1500));
      }
    } else {
      console.warn(`Modal never opened for ${name}.`);
    }
  }

  alert(
    `Outreach complete! Sent ${sentCount} connection requests. Check your Google Sheet.`,
  );
}

// Ensure the variable passes cleanly on multiple clicks
runOutreachBot(window.SAGE_MAX_CONNECTIONS || 5);
