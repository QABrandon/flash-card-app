import { test, expect } from '@playwright/test';

test('shows deck list and displays cards on click', async ({ page }) => {
  await page.goto('/');

  // Both decks should be visible in the sidebar
  await expect(page.getByText('JavaScript Basics')).toBeVisible();
  await expect(page.getByText('React Hooks')).toBeVisible();

  // Clicking a deck loads its cards
  await page.getByText('JavaScript Basics').click();
  await expect(page.getByText('What is a closure?')).toBeVisible();
});
