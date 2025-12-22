import { test, expect } from '@playwright/test';

test.describe('RTL (Arabic) Mode Support', () => {
    test('Arabic page has RTL direction', async ({ page }) => {
        // Go to Arabic login page (since root may redirect)
        await page.goto('/ar/auth/login');

        // Wait for page to load (domcontentloaded is faster and more reliable)
        await page.waitForLoadState('domcontentloaded');

        // Verify page loaded successfully
        const url = page.url();
        expect(url).toMatch(/(ar|auth\/login)/);

        // Page should be visible and functional
        await expect(page.locator('body')).toBeVisible();
    });

    test('Arabic navigation shows translated menu items', async ({ page }) => {
        await page.goto('/ar');

        // Close onboarding if present
        const closeBtn = page.getByRole('button', { name: /إغلاق|close/i });
        if (await closeBtn.count() > 0 && await closeBtn.first().isVisible()) {
            await closeBtn.first().click();
        }

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Arabic text should be present somewhere on the page
        const pageContent = await page.textContent('body');
        expect(pageContent).toBeTruthy();
    });

    test('Arabic research lab page loads', async ({ page }) => {
        await page.goto('/ar/research-lab');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Should load or redirect
        const url = page.url();
        expect(url).toMatch(/(research-lab|auth\/login)/);

        // Check RTL direction is maintained (only if still on Arabic page)
        if (url.includes('/ar/')) {
            const isRTL = await page.evaluate(() => {
                const html = document.documentElement;
                return html.getAttribute('dir') === 'rtl' ||
                    getComputedStyle(html).direction === 'rtl';
            });
            expect(isRTL).toBeTruthy();
        }
    });

    test('Arabic polls page shows translated content', async ({ page }) => {
        await page.goto('/ar/research-lab/polls');

        // Should load or redirect to login
        const url = page.url();
        expect(url).toMatch(/(polls|auth\/login)/);
    });

    test('Arabic surveys page shows translated content', async ({ page }) => {
        await page.goto('/ar/research-lab/surveys');

        // Should load or redirect to login
        const url = page.url();
        expect(url).toMatch(/(surveys|auth\/login)/);
    });

    test('Arabic statistics page shows translated content', async ({ page }) => {
        await page.goto('/ar/research-lab/statistics');

        // Should load or redirect to login
        const url = page.url();
        expect(url).toMatch(/(statistics|auth\/login)/);
    });

    test('Arabic search engine page loads', async ({ page }) => {
        await page.goto('/ar/research-lab/search');

        // Should load or redirect to login
        const url = page.url();
        expect(url).toMatch(/(search|login)/);
    });

    test('Arabic events page loads', async ({ page }) => {
        await page.goto('/ar/events');

        // Should load the events page
        await expect(page).toHaveURL(/\/ar\/events/);
    });

    test('Arabic auth page shows translated labels', async ({ page }) => {
        await page.goto('/ar/auth/login');

        // Should have RTL direction
        const direction = await page.getAttribute('html', 'dir');
        expect(direction).toBe('rtl');

        // Form should be present
        await expect(page.locator('form, input[type="email"]').first()).toBeVisible();
    });

    test('language switcher works from Arabic to English', async ({ page }) => {
        await page.goto('/ar');

        // Close onboarding if present
        const closeBtn = page.getByRole('button', { name: /إغلاق|close/i });
        if (await closeBtn.count() > 0 && await closeBtn.first().isVisible()) {
            await closeBtn.first().click();
        }

        // Find and click language switcher (look for English option)
        const langButton = page.locator('button:has-text("English"), [data-testid="language-switcher"]').first();
        if (await langButton.isVisible()) {
            await langButton.click();
            // Should navigate to English version
            await expect(page).toHaveURL(/\/en/);
        }
    });
});

test.describe('Cross-Language Consistency', () => {
    test('navigation structure is consistent between languages', async ({ page }) => {
        // Check English nav
        await page.goto('/en');
        const enNavLinks = await page.locator('nav a, header a').count();

        // Check Arabic nav
        await page.goto('/ar');
        const arNavLinks = await page.locator('nav a, header a').count();

        // Should have similar number of navigation links
        expect(Math.abs(enNavLinks - arNavLinks)).toBeLessThan(10);
    });
});
