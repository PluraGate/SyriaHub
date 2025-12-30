import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables to get Supabase URL
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Mock User Data
const MOCK_USER = {
    id: 'test-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    user_metadata: { name: 'Test User' },
    app_metadata: { provider: 'email' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

test.describe('Functional Regression: Content Creation', () => {

    test.beforeEach(async ({ page }) => {
        // Calculate Storage Key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        let storageKey = 'supabase.auth.token'; // Fallback
        if (supabaseUrl) {
            const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1];
            if (projectRef) {
                storageKey = `sb-${projectRef}-auth-token`;
            }
        }
        console.log(`[DEBUG] Supabase URL: ${supabaseUrl}`);
        console.log(`[DEBUG] Computed Storage Key: ${storageKey}`);

        // 1. Seed LocalStorage with Session AND Bypass Onboarding
        await page.addInitScript(({ key, user }) => {
            console.log(`[DEBUG] Injecting session into key: ${key}`);
            window.localStorage.setItem('syriahub_epistemic_onboarding_shown', 'true');

            const session = {
                access_token: "mock-access-token",
                token_type: "bearer",
                expires_in: 3600,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                refresh_token: "mock-refresh-token",
                user: user
            };
            window.localStorage.setItem(key, JSON.stringify(session));
        }, { key: storageKey, user: MOCK_USER });

        // Monitor requests
        page.on('request', request => {
            if (request.url().includes('supabase')) {
                console.log(`[NETWORK] ${request.method()} ${request.url()}`);
            }
        });

        // Monitor Browser Console
        page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));

        // 2. Mock Supabase Auth (User Session)
        // Matches any Supabase project URL ending in /auth/v1/user
        await page.route('**/auth/v1/user', async route => {
            console.log('[DEBUG] Fulfilling Auth Mock');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_USER)
            });
        });

        // 3. Mock Database Operations (Posts)
        await page.route('**/rest/v1/posts*', async route => {
            const method = route.request().method();

            if (method === 'POST') {
                // Mock Creation
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({ ...MOCK_USER, id: 'new-post-123' })
                });
            } else if (method === 'PATCH') {
                // Mock Update (Autosave / Edit)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 'existing-post-123' })
                });
            } else if (method === 'GET') {
                const url = route.request().url();
                console.log(`[DEBUG] GET Request for Posts: ${url}`);
                // Mock Fetching Single Post
                // Check if it's a specific post fetch
                if (url.includes('existing-post-123')) {
                    console.log('[DEBUG] Intercepted Existing Post Fetch');
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            id: 'existing-post-123',
                            title: 'Existing Post Title',
                            content: 'Existing content for editing.',
                            content_type: 'article',
                            tags: ['test', 'edit'],
                            cover_image_url: 'https://example.com/cover.png',
                            user_id: MOCK_USER.id,
                            created_at: new Date().toISOString(), // Fresh post
                            updated_at: new Date().toISOString()
                        })
                    });
                    return;
                }
                await route.continue();
            } else {
                await route.continue();
            }
        });

        // 4. Mock Citations and Resources (Prevent 404s if checked)
        await page.route('**/rest/v1/citations*', async route => {
            await route.fulfill({ status: 200, body: '[]' });
        });

        await page.route('**/rest/v1/resource_post_links*', async route => {
            await route.fulfill({ status: 200, body: '[]' });
        });

        // 5. Mock Groups (Return empty list to avoid null check errors)
        await page.route('**/rest/v1/groups*', async route => {
            await route.fulfill({ status: 200, body: '[]' });
        });

        // 6. Mock Storage Upload (Post Images)
        await page.route('**/storage/v1/object/**', async route => {
            const method = route.request().method();
            const url = route.request().url();
            console.log(`[DEBUG] Storage Request: ${method} ${url}`);

            if (method === 'POST' && url.includes('post_images')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ Key: 'covers/test-user-id/mock-image.png' })
                });
            } else {
                await route.continue();
            }
        });
    });

    test('authenticated user can access editor and create a post', async ({ page }) => {
        // Set Test Bypass Keys
        await page.addInitScript(() => {
            window.localStorage.setItem('syriahub_epistemic_onboarding_shown', 'true');
            window.localStorage.setItem('syriahub_test_auth_bypass', 'true');
        });

        // Navigate to Editor
        await page.goto('/en/editor');

        // Verify Auth Bypass worked
        await expect(page.getByRole('heading', { name: /Sign In/i })).not.toBeVisible();
        await expect(page.getByRole('heading', { name: /Write New Post/i })).toBeVisible();

        // Fill Title
        const titleInput = page.getByLabel('Title');
        await titleInput.fill('Functional Test Post');

        // Check if Visual Editor is active (default)
        const toggleButton = page.getByText(/Visual Editor/i);
        if (await toggleButton.isVisible()) {
            await toggleButton.click(); // Toggle to Markdown
        }

        // Now look for the textarea
        const contentArea = page.locator('textarea[name="content"]');
        await expect(contentArea).toBeVisible();
        await contentArea.fill('This is a test content derived from automation.');

        // Fill Tags
        await page.getByLabel('Tags').fill('testing, automation');

        // Click Publish
        const publishBtn = page.getByRole('button', { name: /Publish/i });
        await expect(publishBtn).toBeEnabled();

        // Click Publish
        await publishBtn.click();

        // Expect Success Toast
        // Check URL after delay (code has 1.5s delay)
        await page.waitForTimeout(3000);

        const url = page.url();
        console.log('[DEBUG] Final URL:', url);

        // Assert we navigated away from editor
        // We accept /post/... OR /feed OR error page, but mostly check we left editor
        if (url.includes('/editor')) {
            console.log('[DEBUG] Failed to redirect from editor');
        }
        await expect(page).not.toHaveURL(/editor/);
    });

    test('authenticated user can save a draft', async ({ page }) => {
        // Set Test Bypass Keys
        await page.addInitScript(() => {
            window.localStorage.setItem('syriahub_epistemic_onboarding_shown', 'true');
            window.localStorage.setItem('syriahub_test_auth_bypass', 'true');
        });

        // Navigate to Editor
        await page.goto('/en/editor');

        // Verify Editor is loaded
        await expect(page.getByRole('heading', { name: /Write New Post/i })).toBeVisible();

        // Fill Title
        await page.getByLabel('Title').fill('Draft Test Post');

        // Fill Content (Textarea mode)
        const toggleButton = page.getByText(/Visual Editor/i);
        if (await toggleButton.isVisible()) {
            await toggleButton.click();
        }
        await page.locator('textarea[name="content"]').fill('This is a draft content.');

        // Click Save Draft
        const draftBtn = page.getByRole('button', { name: /Save Draft/i });
        await expect(draftBtn).toBeEnabled();
        await draftBtn.click();

        // Expect Success Toast
        await expect(page.getByText('Draft saved successfully.')).toBeVisible({ timeout: 10000 });

        // Should redirect to Feed (based on current implementation)
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/\/feed/);
    });

    test('authenticated user triggers autosave when typing', async ({ page }) => {
        // Set Test Bypass Keys
        await page.addInitScript(() => {
            window.localStorage.setItem('syriahub_epistemic_onboarding_shown', 'true');
            window.localStorage.setItem('syriahub_test_auth_bypass', 'true');
        });

        // Navigate to Editor
        await page.goto('/en/editor');

        // Fill Title
        await page.getByLabel('Title').fill('Autosave Test Post');

        // Type in content to trigger autosave (debounce is usually 1-3s)
        const toggleButton = page.getByText(/Visual Editor/i);
        if (await toggleButton.isVisible()) {
            await toggleButton.click();
        }
        await page.locator('textarea[name="content"]').fill('Typing content to trigger autosave...');

        // Wait for potential debounce and request
        await page.waitForTimeout(3000);

        // Verify "Saved" indicator appears
        // The text comes from en.json, likely "Saved" or "Saved x ago".
        // We'll search for "Saved" loosely.
        await expect(page.getByText(/Saved/i)).toBeVisible();
    });

    test('authenticated user can upload a cover image', async ({ page }) => {
        // Set Test Bypass Keys
        await page.addInitScript(() => {
            window.localStorage.setItem('syriahub_epistemic_onboarding_shown', 'true');
            window.localStorage.setItem('syriahub_test_auth_bypass', 'true');
        });

        // Navigate to Editor
        await page.goto('/en/editor');

        // Locate File Input
        // The input is hidden, so we need to locate it carefully.
        // Based on CoverImageUpload.tsx, it's <input type="file" ... className="hidden" />
        // We can use setInputFiles on the label or button trigger if we can find it,
        // or directly on the hidden input if Playwright allows (setInputFiles works on hidden inputs too).

        // Create a dummy image buffer
        const buffer = Buffer.from('this is a test image', 'utf-8');
        const file = {
            name: 'test-cover.png',
            mimeType: 'image/png',
            buffer
        };

        // Trigger Upload
        // We look for the "Add Cover Image" text or the button
        await page.setInputFiles('input[type="file"]', file);

        // Expect Success Toast
        await expect(page.getByText('Cover image uploaded successfully')).toBeVisible({ timeout: 10000 });

        // Verify "Remove" button appears (indicating image is set)
        // In compact mode or full Preview mode, the remove button (Trash or X) appears.
        // We'll look for a button with an X icon or "Remove" text.
        // Or simpler: The "Add Cover Image" text should disappear or change to "Change Cover".
        await expect(page.getByText('Change Cover')).toBeVisible();
    });

});
