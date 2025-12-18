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

    // Dismiss onboarding if visible
    const dismissButton = page.getByRole('button', { name: /Close onboarding/i });
    if (await dismissButton.count() > 0 && await dismissButton.isVisible()) {
        await dismissButton.click();
        await expect(dismissButton).not.toBeVisible();
    }

    // Look for "Sign In"
    const loginLink = page.getByRole('link', { name: /Sign In/i }).first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    // Verify redirected to auth/login
    await expect(page).toHaveURL(/\/auth\/login/);
});
