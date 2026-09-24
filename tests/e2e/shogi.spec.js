const { test, expect } = require('@playwright/test');

test.describe('Shogi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/shogi/');
  });

  test('loads with game container and controls', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#game-board-container')).toBeVisible();
    await expect(page.locator('#new-game-btn')).toBeVisible();
    await expect(page.locator('#homeButton')).toBeVisible();
  });

  test('renders 81 squares on the board', async ({ page }) => {
    const squares = page.locator('.square');
    await expect(squares).toHaveCount(81);
  });

  test('displays initial pieces with kanji', async ({ page }) => {
    const pieces = page.locator('.piece');
    const count = await pieces.count();
    expect(count).toBeGreaterThan(0);

    const firstPieceText = await pieces.first().textContent();
    expect(firstPieceText.length).toBeGreaterThan(0);
  });

  test('selects a piece and shows highlights', async ({ page }) => {
    const sentePieceSquare = page.locator('.square').filter({ has: page.locator('.piece.sente') }).first();
    await sentePieceSquare.dispatchEvent('click');

    const highlights = page.locator('.valid-move-highlight');
    const count = await highlights.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shows valid move highlights on piece selection', async ({ page }) => {
    const highlightCheckbox = page.locator('#toggle-highlight-mode-checkbox');
    const isChecked = await highlightCheckbox.isChecked();
    if (!isChecked) {
      await highlightCheckbox.check();
    }

    const sentePiece = page.locator('.piece.sente').first();
    await sentePiece.click();

    const highlights = page.locator('.valid-move-highlight');
    const count = await highlights.count();
    expect(count).toBeGreaterThan(0);
  });

  test('resets game on New Game button click', async ({ page }) => {
    const sentePiece = page.locator('.piece.sente').first();
    await sentePiece.click();

    await page.locator('#new-game-btn').click();

    const selectedSquares = page.locator('.selected-piece-square');
    await expect(selectedSquares).toHaveCount(0);
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
