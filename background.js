const GOOGLE_SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxEwTZBLoEw51ihuTPCDvDaKkcvkQJ96wV1Hbkr1v01lxT6K8ni0oPkTGlVrfnO0Z1E/exec";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveData") {
    fetch(GOOGLE_SHEET_WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(request.data),
      headers: { "Content-Type": "text/plain" }, // Text/plain avoids complex CORS preflight issues
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully saved to sheet:", data);
        sendResponse({ status: "success" });
      })
      .catch((error) => {
        console.error("Error saving to sheet:", error);
        sendResponse({ status: "error" });
      });

    return true; // Keeps the message channel open for the async fetch
  }
});
