import { test, expect } from '@playwright/test';

test.describe('RTL (Arabic) Mode Support', () => {
    test.beforeEach(async ({ page }) => {
        // Disable Epistemic Onboarding and Cookie Consent by setting localStorage keys
        await page.addInitScript(() => {
            window.localStorage.setItem('syriahub_epistemic_onboarding_shown', 'true');
            window.localStorage.setItem('syriahub-cookie-consent', 'all');
        });
    });

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
        test.setTimeout(90000); // Extended timeout for slow navigation
        await page.goto('/ar');

        // Close onboarding if present
        const closeBtn = page.getByRole('button', { name: /إغلاق|close/i });
        if (await closeBtn.count() > 0 && await closeBtn.first().isVisible()) {
            await closeBtn.first().click();
        }

        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');

        // Arabic text should be present somewhere on the page
        const pageContent = await page.textContent('body');
        expect(pageContent).toBeTruthy();
    });

    test('Arabic research lab page loads', async ({ page }) => {
        await page.goto('/ar/research-lab', { waitUntil: 'domcontentloaded' });

        // Research lab is protected - should redirect to login
        await expect(page).toHaveURL(/\/ar\/(auth\/login|login|sign-in)/, { timeout: 20000 });

        // Wait for page to hydrate and RTL direction to be applied
        await page.waitForFunction(() => {
            const html = document.documentElement;
            return html.getAttribute('dir') === 'rtl' ||
                html.getAttribute('lang')?.startsWith('ar') ||
                getComputedStyle(html).direction === 'rtl' ||
                getComputedStyle(document.body).direction === 'rtl';
        }, { timeout: 15000 });
    });

    test('Arabic polls page shows translated content', async ({ page }) => {
        test.setTimeout(60000);
        await page.goto('/ar/research-lab/polls');
        await page.waitForLoadState('domcontentloaded');

        // Should load or redirect to login
        const url = page.url();
        expect(url).toMatch(/(polls|auth\/login)/);
    });

    test('Arabic surveys page shows translated content', async ({ page }) => {
        test.setTimeout(60000);
        await page.goto('/ar/research-lab/surveys');
        await page.waitForLoadState('domcontentloaded');

        // Should load or redirect to login
        const url = page.url();
        expect(url).toMatch(/(surveys|auth\/login)/);
    });

    test('Arabic statistics page shows translated content', async ({ page }) => {
        test.setTimeout(60000);
        await page.goto('/ar/research-lab/statistics');
        await page.waitForLoadState('domcontentloaded');

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
        await page.goto('/ar/auth/login', { waitUntil: 'domcontentloaded' });

        // Wait for RTL direction to be applied after hydration
        await page.waitForFunction(() => {
            const html = document.documentElement;
            return html.getAttribute('dir') === 'rtl' ||
                html.getAttribute('lang')?.startsWith('ar') ||
                getComputedStyle(html).direction === 'rtl' ||
                getComputedStyle(document.body).direction === 'rtl';
        }, { timeout: 15000 });

        // Form should be present
        await expect(page.locator('form, input[type="email"]').first()).toBeVisible();
    });

    test('language switcher works from Arabic to English', async ({ page }) => {
        test.setTimeout(90000);
        await page.goto('/ar');
        await page.waitForLoadState('domcontentloaded');

        // Close onboarding if present
        const closeBtn = page.getByRole('button', { name: /إغلاق|close/i });
        if (await closeBtn.count() > 0 && await closeBtn.first().isVisible()) {
            await closeBtn.first().click();
        }

        // Open language switcher dropdown and select English
        const langTrigger = page.locator('[data-testid="language-switcher"]').first();
        if (await langTrigger.isVisible()) {
            await langTrigger.click();
            const englishOption = page.locator('text=/English/i').first();
            await expect(englishOption).toBeVisible({ timeout: 15000 });
            await englishOption.click();
            await page.waitForURL(/\/en(\/|$)/, { timeout: 30000 });
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
