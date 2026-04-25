async function runOutreachBot(maxConnections) {
  console.log("Starting Sage Outreach Bot...");

  // Graduated scroll to ensure LinkedIn's React framework loads all content
  for (let i = 1; i <= 3; i++) {
    window.scrollTo(0, (document.body.scrollHeight / 3) * i);
    await new Promise((r) => setTimeout(r, 1000));
  }

  let connectButtons = [];

  // New LinkedIn UI: connect is an <a> tag with aria-label "Invite X to connect"
  let connectLinks = document.querySelectorAll('a[aria-label*="to connect"]');
  connectLinks.forEach((link) => {
    if (link.getAttribute("aria-disabled") !== "true") {
      let card = link.closest("li");
      if (card) connectButtons.push({ button: link, card, isLink: true });
    }
  });

  // Fallback: old LinkedIn UI with <button> elements
  if (connectButtons.length === 0) {
    document.querySelectorAll("button").forEach((btn) => {
      if (btn.innerText?.trim() === "Connect" && !btn.disabled) {
        let card =
          btn.closest("li") ||
          btn.closest(".reusable-search__result-container");
        if (card) connectButtons.push({ button: btn, card, isLink: false });
      }
    });
  }

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

    // Extract name from aria-label: "Invite Michael E. to connect"
    let ariaLabel = lead.button.getAttribute("aria-label") || "";
    let nameMatch = ariaLabel.match(/Invite (.+?) to connect/);
    let name = nameMatch ? nameMatch[1] : null;

    // Fallback: old selectors
    if (!name) {
      let nameEl =
        lead.card.querySelector(
          '.entity-result__title-text span[aria-hidden="true"]',
        ) || lead.card.querySelector(".entity-result__title-text a");
      name = nameEl ? nameEl.innerText.trim() : "Unknown Lead";
    }

    // Title: try old selector
    let titleElement = lead.card.querySelector(
      ".entity-result__primary-subtitle",
    );
    let title = titleElement ? titleElement.innerText.trim() : "Unknown Title";

    // Profile URL: from the card's profile link
    let profileLink =
      lead.card.querySelector('a[href*="linkedin.com/in/"]') ||
      lead.card.querySelector('a[href*="/in/"]');
    let profileUrl = profileLink ? profileLink.href.split("?")[0] : "No URL";

    // Fallback: reconstruct from vanityName in the connect href
    if (profileUrl === "No URL" && lead.isLink) {
      let href = lead.button.getAttribute("href") || "";
      let vanityMatch = href.match(/vanityName=([^&]+)/);
      if (vanityMatch)
        profileUrl = `https://www.linkedin.com/in/${vanityMatch[1]}/`;
    }

    console.log(`Targeting: ${name} | ${title}`);

    // Click the connect button/link
    lead.button.scrollIntoView({ behavior: "smooth", block: "center" });
    await new Promise((r) => setTimeout(r, 1500));
    lead.button.click();

    // Wait for the LinkedIn connection modal
    await new Promise((r) => setTimeout(r, 2500));

    let modal = document.querySelector(".artdeco-modal");
    if (modal) {
      let modalButtons = modal.querySelectorAll("button");
      let sendBtn = null;

      for (let b of modalButtons) {
        let text = b.innerText ? b.innerText.trim().toLowerCase() : "";
        if (text === "send" || text === "send without a note") {
          sendBtn = b;
          break;
        }
      }

      if (!sendBtn)
        sendBtn = modal.querySelector('button[aria-label="Send without a note"]');
      if (!sendBtn)
        sendBtn = modal.querySelector('button[aria-label="Send now"]');

      if (sendBtn) {
        sendBtn.click();
        sentCount++;
        console.log(`Successfully sent to ${name}`);

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

        await new Promise((r) => setTimeout(r, 1500));

        if (i < limit - 1) {
          let delay = Math.floor(Math.random() * (35000 - 15000 + 1) + 15000);
          console.log(`Waiting ${Math.round(delay / 1000)} seconds...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      } else {
        console.warn(`Could not find 'Send' button for ${name}. Closing modal.`);
        let closeBtn = modal.querySelector('button[aria-label="Dismiss"]');
        if (!closeBtn) closeBtn = modal.querySelector(".artdeco-modal__dismiss");
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

runOutreachBot(window.SAGE_MAX_CONNECTIONS || 5);
