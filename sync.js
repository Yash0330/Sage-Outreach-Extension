async function syncConnections() {
  console.log("Starting Connection Sync...");

  // Scroll down a few times to lazy-load recent connections
  let lastHeight = 0;
  for (let i = 0; i < 5; i++) {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 1500));
    if (document.body.scrollHeight === lastHeight) break;
    lastHeight = document.body.scrollHeight;
  }

  let connections = new Map();

  // Find all profile links on the page
  let links = document.querySelectorAll('a[href*="/in/"]');

  links.forEach((link) => {
    let cleanUrl = link.href.split("?")[0];

    // Extract name using visual text, bypassing hidden elements
    let text = link.innerText ? link.innerText.trim() : "";
    let name = text.split("\n")[0];

    // Filter out junk, generic links, and your own profile
    if (name && name !== "" && !cleanUrl.includes("/in/me/")) {
      connections.set(cleanUrl, name);
    }
  });

  let count = 0;
  connections.forEach((name, url) => {
    chrome.runtime.sendMessage({
      action: "saveData",
      data: {
        type: "connection",
        name: name,
        profileUrl: url,
      },
    });
    count++;
  });

  alert(
    `Synced ${count} connections! Your Google Sheet is matching them and updating statuses to "Accepted".`,
  );
}

syncConnections();
