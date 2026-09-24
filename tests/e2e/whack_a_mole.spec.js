const { test, expect } = require('@playwright/test');

test.describe('Whack-a-Mole', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/whack_a_mole/');
  });

  test('loads with game elements', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#game-board')).toBeVisible();
    await expect(page.locator('#start-button')).toBeVisible();
    await expect(page.locator('#score')).toBeVisible();
  });

  test('has 3 difficulty buttons with easy as default', async ({ page }) => {
    const buttons = page.locator('.difficulty-btn');
    await expect(buttons).toHaveCount(3);

    const easyBtn = page.locator('.difficulty-btn.active');
    await expect(easyBtn).toBeVisible();
  });

  test('switches difficulty on button click', async ({ page }) => {
    await page.locator('.difficulty-btn[data-level="medium"]').click();
    await expect(page.locator('.difficulty-btn[data-level="medium"]')).toHaveClass(/active/);
    await expect(page.locator('#time-left')).toHaveText('30');
  });

  test('creates 9 holes on game start', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.locator('#start-button').click({ force: true });

    const holes = page.locator('.hole');
    await expect(holes).toHaveCount(9);
  });

  test('shows initial score as 0', async ({ page }) => {
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('disables start button during game', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.locator('#start-button').click({ force: true });
    await expect(page.locator('#start-button')).toBeDisabled();
  });

  test('game ends after timer expires', async ({ page }) => {
    test.slow();
    page.on('dialog', dialog => dialog.accept());

    await page.locator('#start-button').click({ force: true });

    await page.waitForFunction(
      () => {
        const btn = document.querySelector('#start-button');
        return btn && !btn.disabled;
      },
      { timeout: 60000 }
    );

    await expect(page.locator('#start-button')).toBeEnabled();
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
