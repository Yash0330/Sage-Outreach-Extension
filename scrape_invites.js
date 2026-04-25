async function scrapeSentInvites() {
  const inviteOwner = window.SAGE_INVITE_OWNER || "yash";

  console.log("Scraping Sent Invitations...");

  // Scroll down to load the full list of recent invites
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise((r) => setTimeout(r, 2000));

  let connections = new Map();

  // LinkedIn uses 'listitem' roles for these cards now, bypassing the obfuscated CSS classes entirely
  let cards = document.querySelectorAll('div[role="listitem"], li');

  cards.forEach((card) => {
    // 1. Find the profile link
    let link = card.querySelector('a[href*="/in/"]');

    if (link) {
      let cleanUrl = link.href.split("?")[0];

      // 2. Extract text from the paragraph tags since the link no longer contains the name
      let paragraphs = card.querySelectorAll("p");
      let textNodes = [];

      paragraphs.forEach((p) => {
        let text = p.innerText ? p.innerText.trim() : "";
        if (text) textNodes.push(text);
      });

      // Based on LinkedIn's DOM structure:
      // [0] is the Name, [1] is the Title, [2] is the "Sent X ago" text
      let name = textNodes.length > 0 ? textNodes[0] : "";
      let title = textNodes.length > 1 ? textNodes[1] : "Unknown Title";

      // Filter out your own profile, empty names, and prevent duplicate processing
      if (name && name !== "" && !cleanUrl.includes("/in/me/")) {
        if (!connections.has(cleanUrl)) {
          connections.set(cleanUrl, { name: name, title: title });
        }
      }
    }
  });

  let count = 0;
  connections.forEach((data, url) => {
    chrome.runtime.sendMessage({
      action: "saveData",
      data: {
        type: "manual_invite",
        sentBy: inviteOwner,
        name: data.name,
        title: data.title,
        profileUrl: url,
      },
    });
    count++;
  });

  alert(
    `Scraping complete! Extracted ${count} profiles for ${inviteOwner} and sent them to your Google Sheet.`,
  );
}

scrapeSentInvites();
