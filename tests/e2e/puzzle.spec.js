const { test, expect } = require('@playwright/test');

test.describe('Jigsaw Puzzle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/puzzle/');
  });

  test('loads with puzzle areas and buttons', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#pieces-area')).toBeVisible();
    await expect(page.locator('#puzzle-board')).toBeVisible();
    await expect(page.locator('#shuffle-button')).toBeVisible();
    await expect(page.locator('#reset-button')).toBeVisible();
  });

  test('generates 9 puzzle pieces', async ({ page }) => {
    const pieces = page.locator('.puzzle-piece');
    await expect(pieces).toHaveCount(9);
  });

  test('generates 9 puzzle slots', async ({ page }) => {
    const slots = page.locator('.puzzle-slot');
    await expect(slots).toHaveCount(9);
  });

  test('pieces have background images', async ({ page }) => {
    const firstPiece = page.locator('.puzzle-piece').first();
    const bgImage = await firstPiece.evaluate(el =>
      window.getComputedStyle(el).backgroundImage
    );
    expect(bgImage).toContain('url');
  });

  test('shuffles pieces on shuffle button click', async ({ page }) => {
    const getPieceOrder = async () => {
      const pieces = page.locator('.puzzle-piece');
      const count = await pieces.count();
      const ids = [];
      for (let i = 0; i < count; i++) {
        ids.push(await pieces.nth(i).getAttribute('data-piece-id'));
      }
      return ids;
    };

    const before = await getPieceOrder();
    await page.locator('#shuffle-button').click();
    const after = await getPieceOrder();
    expect(after).not.toEqual(before);
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
