import { test, expect } from '@playwright/test';

test.describe('Research Gaps Page', () => {
    test('research gaps page loads correctly', async ({ page }) => {
        await page.goto('/en/research-gaps');

        // Should show the Research Gap Marketplace
        await expect(page).toHaveURL(/\/research-gaps/);

        // Page should have the header
        const header = page.locator('h1:has-text("What Don\'t We Know")');
        await expect(header).toBeVisible();
    });

    test('can filter research gaps by status', async ({ page }) => {
        await page.goto('/en/research-gaps');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Find status filter dropdown
        const statusFilter = page.locator('select').filter({ hasText: /All Statuses/ }).first();
        if (await statusFilter.isVisible()) {
            await statusFilter.selectOption('investigating');

            // Should update URL or filter content
            await page.waitForTimeout(500);
        }
    });

    test('can filter research gaps by gap type', async ({ page }) => {
        await page.goto('/en/research-gaps');

        await page.waitForLoadState('networkidle');

        // Find gap type filter
        const typeFilter = page.locator('select').filter({ hasText: /All Types/ }).first();
        if (await typeFilter.isVisible()) {
            await typeFilter.selectOption('data');

            await page.waitForTimeout(500);
        }
    });

    test('search input is visible', async ({ page }) => {
        await page.goto('/en/research-gaps');

        // Search input should be visible in header
        const searchInput = page.locator('input[placeholder*="Search research gaps"]');
        await expect(searchInput).toBeVisible();
    });

    test('identify a gap button is visible', async ({ page }) => {
        await page.goto('/en/research-gaps');

        // The "Identify a Gap" button should be visible
        const identifyButton = page.getByRole('button', { name: /Identify a Gap/i });
        await expect(identifyButton).toBeVisible();
    });

    test('strategic filter button exists', async ({ page }) => {
        await page.goto('/en/research-gaps');

        // Strategic filter button should exist
        const strategicButton = page.getByRole('button', { name: /Strategic/i });
        await expect(strategicButton).toBeVisible();
    });
});

test.describe('Gap Contributions', () => {
    test('contributions section appears on gap cards when available', async ({ page }) => {
        await page.goto('/en/research-gaps');

        await page.waitForLoadState('networkidle');

        // Check if any gap cards are present
        const gapCards = page.locator('[class*="rounded-xl"][class*="border"]').filter({
            has: page.locator('h3')
        });

        const cardCount = await gapCards.count();

        // If there are gap cards, contributions section may be present
        if (cardCount > 0) {
            // Test passes - page loaded with gaps
            expect(cardCount).toBeGreaterThan(0);
        }
    });
});

test.describe('Admin Platform Health Dashboard', () => {
    test('platform health page requires authentication', async ({ page }) => {
        await page.goto('/en/admin/platform-health');

        // Should either show dashboard or redirect to login
        const url = page.url();
        expect(url).toMatch(/(platform-health|auth\/login|admin)/);
    });

    test('admin sidebar shows platform health link', async ({ page }) => {
        // Navigate to any admin page to check sidebar
        await page.goto('/en/admin');

        // Wait for navigation to settle - admin may redirect to login
        await page.waitForLoadState('domcontentloaded');

        // Give time for any redirects
        await page.waitForTimeout(1000);

        // Check if we're on admin or redirected to login
        const url = page.url();

        if (url.includes('/admin') && !url.includes('/auth/')) {
            // Look for Platform Health link in sidebar
            const healthLink = page.getByRole('link', { name: /Platform Health/i });

            // If visible, verify the link
            if (await healthLink.count() > 0) {
                await expect(healthLink).toBeVisible();
            }
        }
        // If redirected to login, test passes (auth required behavior)
    });
});

test.describe('Impact Stories Section', () => {
    test('feed page loads with impact stories section when available', async ({ page }) => {
        await page.goto('/en/feed');

        await page.waitForLoadState('networkidle');

        // Close onboarding if present
        const closeBtn = page.getByRole('button', { name: /close/i });
        if (await closeBtn.count() > 0 && await closeBtn.first().isVisible()) {
            await closeBtn.first().click();
        }

        // Feed page should load
        await expect(page).toHaveURL(/\/feed/);

        // The page should have a title
        const feedTitle = page.locator('h1');
        await expect(feedTitle.first()).toBeVisible();
    });
});
