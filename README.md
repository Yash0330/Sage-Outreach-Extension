# 🚀 Sage Outreach Bot

A locally hosted, semi-autonomous Chrome Extension designed to bypass LinkedIn Sales Navigator limits and automate targeted B2B outreach to e-commerce, D2C, and luxury retail decision-makers.

## ✨ Features

- **Phase 1: Company Scraper** - Extracts company names and URLs directly from standard LinkedIn Company Search and logs them to a Google Sheet. Automatically handles pagination and ignores duplicate entries.

- **Phase 2: Autonomous Routing & Connection** - Automatically pulls the next pending company from your database, constructs a global people search for their Executives (Founder, CEO, VP), and sequentially sends connection requests.

- **Anti-Ban Protocol** - Uses strict visual DOM rendering checks (innerText) to bypass obfuscated code, combined with randomized humanized delays (15-35 seconds) between actions to keep your LinkedIn account safe.

- **Zero Cost Backend** - Utilizes Google Apps Script as a serverless REST API webhook.

- **Background Service Worker** - Reliable background script (`background.js`) for continuous operation.

- **Extension Manifest** - Properly configured manifest (`manifest.json`) for Chrome compatibility.

## 🛠️ Installation & Setup Guide

### Step 1: Set up the Google Sheet Database

1. Create a new Google Sheet.

2. Create two tabs (worksheets) at the bottom named exactly:
   - `Companies`
   - `Outreach`

3. Add the following headers to Row 1 of the **Companies** tab:

   ```
   Company Name | Company URL | Status | Timestamp
   ```

4. Add the following headers to Row 1 of the **Outreach** tab:

   ```
   Name | Profile URL | Title | Company | Status | Timestamp
   ```

5. Freeze the top row on both tabs.

### Step 2: Deploy the Google Apps Script Webhook

1. In your Google Sheet, click **Extensions > Apps Script**.

2. Delete any default code and paste the code from your backend script (containing both the `doPost` and `doGet` functions).

3. Click the blue **Deploy** button > **New deployment**.

4. Select **Web app**.

5. Set "Execute as" to **Me** and "Who has access" to **Anyone**.

6. Click **Deploy**, authorize your Google account, and **Copy the Web App URL**.

### Step 3: Configure the Extension

1. Open the local folder containing your extension files (manifest.json, background.js, popup.js, content.js, connector.js).

2. Open `background.js`. Paste your Google Web App URL into the constant at the top:

   ```javascript
   const GOOGLE_SHEET_WEB_APP_URL = "YOUR_WEB_APP_URL_HERE";
   ```

3. Open `popup.js`. Paste your Google Web App URL into the constant at the top:

   ```javascript
   const GOOGLE_WEB_APP_URL = "YOUR_WEB_APP_URL_HERE";
   ```

4. Save all files.

### Step 4: Install the Extension in Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.

2. Toggle **Developer mode** ON (top right corner).

3. Click **Load unpacked** (top left).

4. Select the folder containing your extension files.

5. Pin the Sage Outreach extension to your Chrome toolbar.

## 📖 How to Use the Bot

### Phase 1: Building the Target List

1. Go to LinkedIn and click the search bar (leave it blank) and press Enter.

2. Select the **Companies** tab.

3. Apply your filters:
   - **Industry:** Retail Apparel and Fashion (or Retail, Technology)
   - **Company Size:** 11-50, 51-200, 201-500

4. Click the **Sage Outreach extension icon**.

5. Set the number of pages you want to scrape and click **1. Scrape Companies**.

6. Wait on the tab. The bot will paginate through the results and log unique companies to your **Companies** sheet.

### Phase 2: Running the Outreach Engine

1. Click the **Sage extension icon**.

2. Click the yellow **2. Load Next Target** button.

3. The extension will grab the next "Pending" company from your sheet, change its status to "Processing", and open a new tab directly to the executives of that company.

4. Once the new LinkedIn search tab fully loads, click the extension icon again.

5. Set your maximum connections per company (recommended: 3 to 5).

6. Click the green **3. Run Outreach Bot** button.

7. Keep the tab open and active. The bot will slowly scroll the page, find valid Connect buttons, handle the modals, log the data to your **Outreach** sheet, and wait 15-35 seconds between each send.

## ⚠️ Safety Rules & Rate Limits

To prevent LinkedIn from temporarily restricting your account, strictly adhere to the following limits:

- **Max Connections:** Send no more than **15 to 20 connection requests per day**. Do not run the bot continuously.

- **Operating Hours:** Only run the script during typical business hours.

- **Visual Focus:** When Phase 2 is running, keep the Chrome tab active on your screen. Minimizing the window or switching tabs can pause Chrome's background timers, causing the script to stall.

- **Filter Accuracy:** When selecting companies, verify that results match your target criteria. Avoid companies that don't match your e-commerce, D2C, or luxury retail focus to prevent irrelevant outreach.

## 🔗 Relevant LinkedIn Search Filters

Use these search URLs as reference when setting up your company filters:

- **Retail & Fashion Industries Filter:**

  ```
  https://www.linkedin.com/search/results/companies/?origin=FACETED_SEARCH&companyHqGeo=%5B%22102221843%22%2C%2291000022%22%2C%22103644278%22%5D&companySize=%5B%22B%22%2C%22C%22%2C%22D%22%5D&industryCompanyVertical=%5B%2227%22%2C%22138%22%2C%22143%22%2C%223250%22%5D
  ```

- **E-commerce Search:**
  ```
  https://www.linkedin.com/search/results/companies/?keywords=e%20commerce&origin=FACETED_SEARCH&spellCorrectionEnabled=true&companyHqGeo=%5B%22102221843%22%2C%2291000022%22%2C%22103644278%22%5D&companySize=%5B%22B%22%2C%22C%22%2C%22D%22%5D&industryCompanyVertical=%5B%2227%22%5D&page=2
  ```

**Important:** Filter results carefully. Some non-e-commerce companies may show up in results. Verify each company aligns with your target criteria before sending connection requests.

## 💡 Extension Workflow

1. **Apply LinkedIn filters** on your chosen industry and company size.
2. **Click the Sage extension icon** and enter the number of pages to scrape.
3. **Click the "Start Scraping" button** to begin data collection.
4. The bot automatically saves data to your Google Sheet and handles pagination.
5. **Keep the tab open** to ensure uninterrupted data collection.
6. Proceed to Phase 2 when your company list is ready.

## 🔧 Development Tips

- Edit the files and refresh the extension from `chrome://extensions/`.
- Check the background service worker logs via the "Service Worker" link under the extension in `chrome://extensions/`.
- Monitor Google Apps Script logs in your Google Sheet via **Extensions > Apps Script > Executions** tab.

## 📦 Repository

Initialized locally and published using GitHub CLI (`gh`).
