import { test, expect } from '@playwright/test';

test('homepage has correct title and brand name', async ({ page }) => {
    await page.goto('/');

    // Should redirect to /[locale]
    await expect(page).toHaveURL(/\/en|\/ar/);

    // Dismiss onboarding if visible - using a more specific selector
    const dismissButton = page.getByRole('button', { name: /Close onboarding/i });
    if (await dismissButton.count() > 0 && await dismissButton.isVisible()) {
        await dismissButton.click();
        // Wait for modal to disappear
        await expect(dismissButton).not.toBeVisible();
    }

    // Expect the title to contain "SyriaHub"
    await expect(page).toHaveTitle(/SyriaHub/);

    // Check if the logo/brand name is visible
    const brandName = page.getByRole('link', { name: /SyriaHub Home/i }).first();
    await expect(brandName).toBeVisible();
});

test('can navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Dismiss onboarding if visible
    const dismissButton = page.getByRole('button', { name: /Close onboarding/i });
    if (await dismissButton.count() > 0 && await dismissButton.isVisible()) {
        await dismissButton.click();
        await expect(dismissButton).not.toBeVisible();
    }

    // Look for "Sign In" link and get its href
    const loginLink = page.getByRole('link', { name: /Sign In/i }).first();
    await expect(loginLink).toBeVisible({ timeout: 10000 });

    // Get the href and navigate directly (more robust for webkit)
    const href = await loginLink.getAttribute('href');
    expect(href).toBeTruthy();
    await page.goto(href!);

    // Verify redirected to auth/login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
});

