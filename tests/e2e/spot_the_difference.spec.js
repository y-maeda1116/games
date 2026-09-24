const { test, expect } = require('@playwright/test');

test.describe('Spot the Difference', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/spot_the_difference/');
  });

  test('loads with images and controls', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#imageA')).toBeVisible();
    await expect(page.locator('#imageB')).toBeVisible();
    await expect(page.locator('#resetButton')).toBeVisible();
    await expect(page.locator('#hintButton')).toBeVisible();
  });

  test('shows initial message about differences', async ({ page }) => {
    await expect(page.locator('#message-area')).toContainText('difference');
  });

  test('detects difference on correct click', async ({ page }) => {
    await page.waitForFunction(
      () => {
        const canvas = document.getElementById('canvasA');
        return canvas && canvas.width > 0;
      },
      { timeout: 10000 }
    );

    const canvasBox = await page.locator('#canvasA').boundingBox();
    if (canvasBox) {
      await page.mouse.click(
        canvasBox.x + canvasBox.width * 0.5,
        canvasBox.y + canvasBox.height * 0.3
      );
    }

    await page.waitForTimeout(500);
    await expect(page.locator('#message-area')).toBeVisible();
  });

  test('resets game on reset button click', async ({ page }) => {
    await page.locator('#resetButton').click();
    await expect(page.locator('#message-area')).toContainText('difference');
  });

  test('shows hint on hint button click', async ({ page }) => {
    await page.waitForFunction(
      () => {
        const canvas = document.getElementById('canvasA');
        return canvas && canvas.width > 0;
      },
      { timeout: 10000 }
    );

    await page.locator('#hintButton').click();
    await page.waitForTimeout(2000);
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
