
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function capture() {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Base URL - assuming the dev server is running on 3000 - Force English locale
    const url = 'http://localhost:3000/en';

    console.log(`Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
    } catch (e) {
        console.error("Could not connect to localhost:3000. Is the server running?");
        console.error(e);
        await browser.close();
        process.exit(1);
    }

    // Ensure directory exists
    const screenshotDir = path.join(process.cwd(), 'public', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Desktop
    console.log('Capturing Desktop Screenshot...');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(2000); // Wait for animations/rendering
    await page.screenshot({ path: path.join(screenshotDir, 'home.png') });

    // Mobile
    console.log('Capturing Mobile Screenshot...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(2000); // Wait for layout adjustment
    await page.screenshot({ path: path.join(screenshotDir, 'home-mobile.png') });

    await browser.close();
    console.log('Screenshots updated successfully!');
}

capture().catch((err) => {
    console.error(err);
    process.exit(1);
});
