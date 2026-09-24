const { test, expect } = require('@playwright/test');

test.describe('Drawing Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/drawing/');
  });

  test('loads with canvas and toolbar', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#drawingCanvas')).toBeVisible();
    await expect(page.locator('#toolbar')).toBeVisible();
  });

  test('canvas has correct dimensions', async ({ page }) => {
    const width = await page.locator('#drawingCanvas').evaluate(el => el.width);
    const height = await page.locator('#drawingCanvas').evaluate(el => el.height);
    expect(width).toBe(800);
    expect(height).toBe(600);
  });

  test('selects brush tool by default', async ({ page }) => {
    await expect(page.locator('#brush')).toHaveClass(/active/);
  });

  test('switches to eraser on click', async ({ page }) => {
    await page.locator('#eraser').click();
    await expect(page.locator('#eraser')).toHaveClass(/active/);
    await expect(page.locator('#brush')).not.toHaveClass(/active/);
  });

  test('selects a preset color', async ({ page }) => {
    const redBtn = page.locator('.color-btn').first();
    await redBtn.click();
    await expect(redBtn).toHaveClass(/selected/);
  });

  test('undo button is enabled after initial canvas save', async ({ page }) => {
    const isDisabled = await page.locator('#undo').isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('redo button starts disabled', async ({ page }) => {
    const isDisabled = await page.locator('#redo').isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('clears canvas on clear button click', async ({ page }) => {
    const before = await page.locator('#drawingCanvas').evaluate(el => el.toDataURL());
    await page.locator('#clear').click();
    const after = await page.locator('#drawingCanvas').evaluate(el => el.toDataURL());
    expect(before).toBe(after);
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
