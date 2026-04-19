# Sage Outreach Extension

A minimal browser extension project scaffold. Includes a background script and a manifest file.

## Features

- Background service worker script (`background.js`)
- Extension manifest (`manifest.json`)

## Getting Started

### Load the extension in Chrome

1. Open `chrome://extensions/` in Chrome.
2. Enable "Developer mode" (top-right).
3. Click "Load unpacked" and select this folder.

### Development Tips

- Edit the files and refresh the extension from `chrome://extensions/`.
- Check the background service worker logs via the "Service Worker" link under the extension in `chrome://extensions/`.

## Repository

Initialized locally and published using GitHub CLI (`gh`).
go to https://www.linkedin.com/search/results/companies/?origin=FACETED_SEARCH&companyHqGeo=%5B%22102221843%22%2C%2291000022%22%2C%22103644278%22%5D&companySize=%5B%22B%22%2C%22C%22%2C%22D%22%5D&industryCompanyVertical=%5B%2227%22%2C%22138%22%2C%22143%22%2C%223250%22%5D

or search term with e commerce with same filters
https://www.linkedin.com/search/results/companies/?keywords=e%20commerce&origin=FACETED_SEARCH&spellCorrectionEnabled=true&companyHqGeo=%5B%22102221843%22%2C%2291000022%22%2C%22103644278%22%5D&companySize=%5B%22B%22%2C%22C%22%2C%22D%22%5D&industryCompanyVertical=%5B%2227%22%5D&page=2
here important thing is there are comapnies which are not e commerce but show up we need to avoid it while sending requests.

image.png
this is the screenshot apply filters and click on the sage extension and enter number of pages to scrape and click on start scraping button. It will start scraping the data and save it in a google sheets important you have to be in same tab or keep the tab open and open another window if need to work on other things. It will automatically save the data in google sheets and you can access it from there.
