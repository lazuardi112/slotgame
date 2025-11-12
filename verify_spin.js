const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the game and set a consistent viewport
    await page.goto('http://localhost:5001');
    await page.setViewportSize({ width: 375, height: 667 }); // Typical mobile size

    // Add a listener to catch all console messages and log them to the test output
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));

    console.log('Page loaded. Waiting for Play button to be visible...');

    // 1. Verify the Menu screen and click the "Play" button
    const playButtonSelector = 'canvas'; // Since we click the canvas
    await page.waitForSelector(playButtonSelector, { state: 'visible', timeout: 15000 });
    console.log('Canvas is visible. Clicking the Play button...');

    // Use force=true to bypass any potential overlay issues as a last resort
    await page.click(playButtonSelector, { position: { x: 188, y: 550 }, timeout: 10000, force: true });
    console.log('Play button clicked.');

    // Wait for a moment to let the game screen load
    await page.waitForTimeout(2000);

    // Take a screenshot after clicking "Play" to see the game interface
    const gameScreenPath = '/home/jules/verification/game_screen.png';
    await page.screenshot({ path: gameScreenPath });
    console.log(`Screenshot of the game screen saved to ${gameScreenPath}`);

    // 2. Verify the Spin button is present and click it
    console.log('Attempting to click the Spin button...');

    // Coordinates for the spin button based on previous analysis
    await page.click('canvas', { position: { x: 320, y: 590 }, timeout: 10000, force: true });
    console.log('Spin button clicked.');

    // 3. Verify the outcome
    // Listen for the specific console log that indicates a successful spin API call
    let spinSuccess = false;
    page.on('console', msg => {
        if (msg.text().includes('Spin API call successful')) {
            spinSuccess = true;
        }
    });

    // Wait for a reasonable amount of time for the spin to complete and the log to appear
    await page.waitForTimeout(5000);

    const finalScreenshotPath = '/home/jules/verification/final_spin_verification.png';
    await page.screenshot({ path: finalScreenshotPath });
    console.log(`Final screenshot saved to ${finalScreenshotPath}`);

    // Assert that the success message was logged
    assert.strictEqual(spinSuccess, true, 'Spin API call was not successful. Check console logs.');

    console.log('Verification successful: Spin button was clicked and the API call was logged.');

  } catch (error) {
    console.error('Verification failed:', error);
    const errorScreenshotPath = '/home/jules/verification/error_screenshot.png';
    await page.screenshot({ path: errorScreenshotPath });
    console.log(`Error screenshot saved to ${errorScreenshotPath}`);
    process.exit(1); // Exit with a non-zero code to indicate failure
  } finally {
    await browser.close();
  }
})();
