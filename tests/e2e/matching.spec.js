const { test, expect } = require('@playwright/test');

test.describe('Matching Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/matching/');
  });

  test('loads with title and key elements', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#game-board')).toBeVisible();
    await expect(page.locator('#reset-button')).toBeVisible();
    await expect(page.locator('#homeButton')).toBeVisible();
  });

  test('renders cards on easy difficulty (12 cards)', async ({ page }) => {
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(12);
  });

  test('flips a card on click', async ({ page }) => {
    const card = page.locator('.card').first();
    await card.click();
    await expect(card).toHaveClass(/flipped/);
  });

  test('detects a matching pair', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();

    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(await cards.nth(i).getAttribute('data-item'));
    }

    const firstItem = items[0];
    const matchIndex = items.indexOf(firstItem, 1);

    await cards.nth(0).click();
    await cards.nth(matchIndex).click();

    await expect(cards.nth(0)).toHaveClass(/matched/);
    await expect(cards.nth(matchIndex)).toHaveClass(/matched/);
  });

  test('shows win message when all pairs matched', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();

    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(await cards.nth(i).getAttribute('data-item'));
    }

    const matched = new Set();
    for (let i = 0; i < count && matched.size < count / 2; i++) {
      if (matched.has(items[i])) continue;

      const matchIndex = items.indexOf(items[i], i + 1);
      matched.add(items[i]);

      await cards.nth(i).click();
      await cards.nth(matchIndex).click();
      await page.waitForTimeout(100);
    }

    await expect(page.locator('#message-area')).toContainText(/You Win|勝ち/);
  });

  test('resets the game on reset button click', async ({ page }) => {
    const card = page.locator('.card').first();
    await card.click();
    await expect(card).toHaveClass(/flipped/);

    await page.locator('#reset-button').click();
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(12);
    await expect(cards.first()).not.toHaveClass(/flipped/);
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
