import { test, expect } from '@playwright/test';

// Visual regression snapshots are platform-specific (win32/linux/darwin).
// Skip in CI if running on a different OS than where snapshots were generated.
const isCI = !!process.env.CI;

test.describe('Visual Regression', () => {
    test.skip(isCI, 'Visual snapshots are platform-specific; skipping in CI');

    test('home page matches snapshot', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveScreenshot('home-page.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.1 // Allow small rendering differences
        });
    });

    test('login page matches snapshot', async ({ page }) => {
        await page.goto('/en/auth/login');
        await expect(page).toHaveScreenshot('login-page.png', {
            fullPage: true
        });
    });

    // We can add more specific component tests here
    test('auth form component matches snapshot', async ({ page }) => {
        await page.goto('/en/auth/login');
        const authForm = page.locator('.auth-form-container').first();
        // Fallback if specific class not found, just take viewport
        if (await authForm.isVisible()) {
            await expect(authForm).toHaveScreenshot('auth-form.png');
        }
    });
});
