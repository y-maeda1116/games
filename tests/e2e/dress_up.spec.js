const { test, expect } = require('@playwright/test');

test.describe('Dress-Up Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/dress_up/');
  });

  test('loads with character image and wardrobe', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#character-image')).toBeVisible();
    await expect(page.locator('#wardrobe-area')).toBeVisible();
  });

  test('populates wardrobe with clothing items', async ({ page }) => {
    const items = page.locator('.wardrobe-item');
    await expect(items).toHaveCount(4);
  });

  test('has character select dropdown with options', async ({ page }) => {
    const options = page.locator('#character-select option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('changes character image on selection', async ({ page }) => {
    const initialSrc = await page.locator('#character-image').getAttribute('src');
    await page.locator('#character-select').selectOption({ index: 1 });
    const newSrc = await page.locator('#character-image').getAttribute('src');
    expect(newSrc).not.toBe(initialSrc);
  });

  test('resets outfit on reset button click', async ({ page }) => {
    await page.locator('#reset-button').click();
    const placedItems = page.locator('.snap-zone .placed-item');
    await expect(placedItems).toHaveCount(0);
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
