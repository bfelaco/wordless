import { test, expect } from '@playwright/test';

test.describe('Wordless', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the app title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Wordless' })).toBeVisible();
  });

  test('starts with word length 5 and 2309 matches', async ({ page }) => {
    await expect(page.locator('#wordLength')).toHaveValue('5');
    await expect(page.getByText('Match Count: 2309')).toBeVisible();
  });

  test('shows an empty 5-tile grid row', async ({ page }) => {
    const tiles = page.locator('[data-color]');
    await expect(tiles).toHaveCount(5);
  });

  test('Add Best Guess fills the row with letters', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Best Guess' }).click();
    const tiles = page.locator('[data-color]');
    await expect(tiles).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(tiles.nth(i)).not.toHaveText('');
    }
  });

  test('match count updates when a tile is marked absent', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Best Guess' }).click();
    const tiles = page.locator('[data-color]');
    // Wait for letters to appear, then click the first tile twice to mark it ABSENT
    await expect(tiles.nth(0)).not.toHaveText('');
    await tiles.nth(0).click(); // select
    await tiles.nth(0).click(); // cycle UNKNOWN → ABSENT
    await expect(page.getByText(/Match Count: (?!2309)\d+/)).toBeVisible();
  });

  test('changing word length resets the board to the new length', async ({ page }) => {
    await page.locator('#wordLength').fill('6');
    await page.locator('#wordLength').press('Tab');
    const tiles = page.locator('[data-color]');
    await expect(tiles).toHaveCount(6);
  });

  test('Help button shows help content with a Done button', async ({ page }) => {
    await page.getByRole('button', { name: 'Help' }).click();
    await expect(page.getByRole('heading', { name: 'Help' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  test('Done button dismisses help and returns to the board', async ({ page }) => {
    await page.getByRole('button', { name: 'Help' }).click();
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('button', { name: 'Add Best Guess' })).toBeVisible();
  });
});
