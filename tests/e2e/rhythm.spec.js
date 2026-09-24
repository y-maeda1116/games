const { test, expect } = require('@playwright/test');

test.describe('Rhythm Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/rhythm/');
  });

  test('loads with lanes and start button', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#lane-0')).toBeVisible();
    await expect(page.locator('#lane-1')).toBeVisible();
    await expect(page.locator('#lane-2')).toBeVisible();
    await expect(page.locator('#lane-3')).toBeVisible();
    await expect(page.locator('#start-button')).toBeVisible();
  });

  test('displays initial score as 0', async ({ page }) => {
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('disables start button on game start', async ({ page }) => {
    await page.locator('#start-button').click();
    await expect(page.locator('#start-button')).toBeDisabled();
  });

  test('generates notes after game starts', async ({ page }) => {
    test.slow();
    await page.locator('#start-button').click();

    await page.waitForFunction(
      () => document.querySelectorAll('.note').length > 0,
      { timeout: 10000 }
    );

    const notes = page.locator('.note');
    const count = await notes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('ends game and shows score', async ({ page }) => {
    test.slow();
    page.on('dialog', dialog => dialog.accept());

    await page.locator('#start-button').click();

    await page.waitForFunction(
      () => {
        const btn = document.querySelector('#start-button');
        return btn && !btn.disabled;
      },
      { timeout: 30000 }
    );

    await expect(page.locator('#start-button')).toBeEnabled();
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
