const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test('loads and displays the title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('displays all 10 game links', async ({ page }) => {
    await page.goto('/');
    const gameLinks = page.locator('a[href*="games/"]');
    await expect(gameLinks).toHaveCount(10);
  });
});
