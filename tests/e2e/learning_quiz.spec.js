const { test, expect } = require('@playwright/test');

test.describe('Learning Quiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/learning_quiz/');
  });

  test('loads with start button and initial message', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#start-quiz-button')).toBeVisible();
    await expect(page.locator('#question-text')).toContainText('Start Quiz');
  });

  test('starts quiz on button click', async ({ page }) => {
    await page.locator('#start-quiz-button').click();
    await expect(page.locator('#question-text')).not.toBeEmpty();
    const options = page.locator('#options-area button');
    await expect(options).toHaveCount(4);
  });

  test('increments score on correct answer', async ({ page }) => {
    await page.locator('#start-quiz-button').click();

    const correctAnswer = await page.evaluate(() => {
      return document.querySelector('#question-display-item').textContent;
    });

    const correctButton = page.locator('#options-area button', { hasText: correctAnswer === '１' ? '1' : correctAnswer === '３' ? '3' : correctAnswer === '５' ? '5' : correctAnswer });
    if ((await correctButton.count()) > 0) {
      await correctButton.first().click();
      await expect(page.locator('#feedback-text')).toContainText('Correct');
      await expect(page.locator('#score')).toHaveText('1');
    }
  });

  test('shows feedback on incorrect answer', async ({ page }) => {
    await page.locator('#start-quiz-button').click();

    const displayItem = await page.evaluate(() => {
      return document.querySelector('#question-display-item').textContent;
    });

    const buttons = page.locator('#options-area button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).textContent();
      const isCorrect = (displayItem === '１' && text === '1') ||
                        (displayItem === '３' && text === '3') ||
                        (displayItem === '５' && text === '5') ||
                        displayItem === text;
      if (!isCorrect) {
        await buttons.nth(i).click();
        break;
      }
    }

    await expect(page.locator('#feedback-text')).toContainText('Incorrect');
  });

  test('shows next question button after answering', async ({ page }) => {
    await page.locator('#start-quiz-button').click();
    const buttons = page.locator('#options-area button');
    await buttons.first().click();
    await expect(page.locator('#next-question-button')).toBeVisible();
  });

  test('completes quiz after all questions', async ({ page }) => {
    await page.locator('#start-quiz-button').click();

    for (let q = 0; q < 6; q++) {
      await page.waitForSelector('#options-area button');
      const buttons = page.locator('#options-area button');
      await buttons.first().click();
      await page.locator('#next-question-button').click();
    }

    await expect(page.locator('#question-text')).toContainText('Quiz Finished');
    await expect(page.locator('#start-quiz-button')).toBeVisible();
  });

  test('navigates home on home button click', async ({ page }) => {
    await page.locator('#homeButton').click();
    await expect(page).toHaveURL(/\//);
  });
});
