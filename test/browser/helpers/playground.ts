import { expect, type Page } from "@playwright/test";

export async function openScenario(
  page: Page,
  category: string,
  scenario: string,
) {
  await page.goto("/");
  await page.getByRole("menuitem", { name: category, exact: true }).click();
  const heading = page.getByRole("heading", { level: 1, name: scenario, exact: true });
  if (await heading.isVisible()) {
    await page.keyboard.press("Escape");
    return;
  }
  const categoryMenu = page.getByRole("menu", { name: category, exact: true });
  await expect(categoryMenu).toBeVisible();
  const exactItem = categoryMenu.getByRole("menuitem", { name: scenario, exact: true });
  if (await exactItem.count()) {
    await exactItem.click();
  } else {
    await categoryMenu.getByRole("menuitem", { name: scenario, exact: false }).click();
  }
  await expect(heading).toBeVisible();
}
