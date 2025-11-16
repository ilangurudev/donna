import { expect, test } from "@playwright/test";

test("should navigate to login page", async ({ page }) => {
  await page.goto("/");

  // Should redirect to login
  await expect(page).toHaveURL(/.*login/);
  await expect(page.getByText("Welcome to Donna")).toBeVisible();
});
