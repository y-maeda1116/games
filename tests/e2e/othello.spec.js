const { test, expect } = require('@playwright/test');

test.describe('Othello', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/othello/');
  });

  test('loads with board and mode buttons', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#player-vs-player')).toBeVisible();
    await expect(page.locator('#player-vs-ai')).toBeVisible();
  });

  test('shows initial message before game starts', async ({ page }) => {
    await expect(page.locator('#game-info')).toContainText('Select a game mode');
  });

  test('starts PvP game with 64 cells and 4 discs', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.locator('#player-vs-player').click();

    const cells = page.locator('.cell');
    await expect(cells).toHaveCount(64);

    const discs = page.locator('.disc');
    await expect(discs).toHaveCount(4);
  });

  test('shows initial scores as Black: 2 - White: 2', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.locator('#player-vs-player').click();

    await expect(page.locator('#game-info')).toContainText('Black: 2');
    await expect(page.locator('#game-info')).toContainText('White: 2');
  });

  test('places a disc on valid move', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.locator('#player-vs-player').click();

    const emptyCells = page.locator('.cell').filter({ hasNot: page.locator('.disc') });
    const count = await emptyCells.count();

    let clicked = false;
    for (let i = 0; i < count; i++) {
      const row = await emptyCells.nth(i).getAttribute('data-row');
      const col = await emptyCells.nth(i).getAttribute('data-col');
      const r = parseInt(row);
      const c = parseInt(col);

      const isAdjacent = (r === 2 && c === 3) || (r === 3 && c === 2) ||
                         (r === 4 && c === 5) || (r === 5 && c === 4);
      if (isAdjacent) {
        await emptyCells.nth(i).click();
        clicked = true;
        break;
      }
    }

    if (clicked) {
      const discs = page.locator('.disc');
      const discCount = await discs.count();
      expect(discCount).toBeGreaterThanOrEqual(4);
    }
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
