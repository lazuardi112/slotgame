const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5001');
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
