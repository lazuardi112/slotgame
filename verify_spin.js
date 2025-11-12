const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // This promise will resolve when the target console message is detected.
  const spinSuccessPromise = new Promise((resolve, reject) => {
    // Set a timeout for the entire verification process.
    const timeout = setTimeout(() => {
      reject(new Error("Verification timed out after 15 seconds."));
    }, 15000);

    page.on('console', msg => {
      const messageText = msg.text();
      console.log(`[Browser Console]: ${messageText}`); // Log all messages for debugging.
      if (messageText.includes('Spin API call successful')) {
        clearTimeout(timeout); // Clear the timeout since we were successful.
        resolve(true);
      }
    });
  });

  try {
    console.log('Navigating to the application...');
    await page.goto('http://localhost:5001');
    await page.setViewportSize({ width: 375, height: 667 }); // Use a consistent mobile viewport.

    console.log('Waiting for canvas to be visible...');
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 });

    console.log('Clicking on the initial screen to enter the main menu...');
    // A single click in the center should be enough to pass the loading screen.
    await page.click('canvas', { timeout: 5000 });
    await page.waitForTimeout(1000); // Allow time for the menu to animate in.

    console.log('In the main menu, clicking to start the game...');
    // Another click in the center should hit the "Play" button on the menu.
    await page.click('canvas', { timeout: 5000 });
    await page.waitForTimeout(2000); // Allow time for the game screen to load.

    const gameScreenPath = '/home/jules/verification/game_screen.png';
    await page.screenshot({ path: gameScreenPath });
    console.log(`Screenshot of the game screen saved to ${gameScreenPath}`);

    console.log('Attempting to click the Spin button...');
    // Use the specific coordinates for the spin button on a mobile layout.
    await page.click('canvas', { position: { x: 320, y: 590 }, timeout: 5000 });
    console.log('Spin button clicked.');

    console.log('Waiting for server confirmation of the spin...');
    // Now we wait for the promise to resolve, which happens when our console message is logged.
    const spinSuccess = await spinSuccessPromise;

    assert.strictEqual(spinSuccess, true, 'Spin API call was not successful.');
    console.log('Server confirmation received. Spin was successful.');

    const finalScreenshotPath = '/home/jules/verification/final_spin_verification.png';
    await page.screenshot({ path: finalScreenshotPath });
    console.log(`Final screenshot saved to ${finalScreenshotPath}`);

    console.log('Verification script completed successfully!');

  } catch (error) {
    console.error('Verification failed:', error);
    const errorScreenshotPath = '/home/jules/verification/error_screenshot.png';
    await page.screenshot({ path: errorScreenshotPath });
    console.log(`Error screenshot saved to ${errorScreenshotPath}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
