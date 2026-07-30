import { expect, type Page } from "@playwright/test";

export async function openScenario(
  page: Page,
  category: string,
  scenario: string,
) {
  await page.goto("/");
  await page.getByRole("menuitem", { name: category, exact: true }).click();
  await page.getByRole("menuitem", { name: scenario, exact: true }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: scenario, exact: true }),
  ).toBeVisible();
}
