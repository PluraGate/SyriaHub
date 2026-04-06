import { chromium } from '@playwright/test';

/**
 * Global setup that warms up the Next.js dev server before tests run.
 * This prevents cold-start flakiness when many parallel workers hit the server simultaneously.
 */
async function globalSetup() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Warm up the main pages to trigger Next.js compilation
    const baseURL = 'http://localhost:3000';
    const warmupPages = ['/', '/en', '/ar', '/en/auth/login', '/ar/auth/login'];

    for (const path of warmupPages) {
        try {
            await page.goto(`${baseURL}${path}`, { waitUntil: 'networkidle', timeout: 60000 });
        } catch {
            // Ignore errors during warmup - just triggering compilation
        }
    }

    await page.close();
    await browser.close();
}

export default globalSetup;
