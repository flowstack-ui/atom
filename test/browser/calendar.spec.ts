import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => { await page.goto("/__tests/dates"); });
test("calendar separates focus from selection and moves real focus", async ({ page }) => {
  const grid = page.getByRole("grid", { name: "Inline date" });
  await grid.getByRole("button", { name: "Today. Choose Saturday, September 5, 2026", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  await expect(grid.getByRole("button", { name: "Choose Sunday, September 6, 2026", exact: true })).toBeFocused();
  await expect(page.getByLabel("Selected date", { exact: true })).toHaveText("2026-09-05");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Selected date", { exact: true })).toHaveText("2026-09-06");
});
test("calendar supports month and year navigation", async ({ page }) => {
  await page.getByRole("button", { name: "Switch to month view" }).click();
  const grid = page.getByRole("grid", { name: "Inline date" });
  await expect(grid).toHaveAttribute("data-view", "month");
  await page.getByRole("button", { name: "Switch to year view" }).click();
  await expect(grid).toHaveAttribute("data-view", "year");
  await expect(grid.getByRole("button")).toHaveCount(10);
});

test("multiple months use unique IDs and reject unavailable range interiors", async ({ page }) => {
  const grids = page.getByRole("grid", { name: /^Range / });
  const ids = await grids.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  const grid = page.getByRole("grid", { name: "Range September" });
  await grid.locator('[data-value="2026-09-08"][role="button"]').click();
  await expect(grid.locator('[data-value="2026-09-12"][role="button"]')).toHaveAttribute("data-unavailable", "");
  await expect(page.getByLabel("Range value")).toHaveText("2026-09-08/");
  await grid.locator('[data-value="2026-09-09"][role="button"]').click();
  await expect(page.getByLabel("Range value")).toHaveText("2026-09-08/2026-09-09");
});

test("multiple selection toggles and Arabic days use locale digits", async ({ page }) => {
  const grid = page.getByRole("grid", { name: "Multiple dates" });
  const day = grid.locator('[data-value="2026-09-05"][role="button"]');
  await expect(day).toHaveAttribute("data-selected", "");
  await day.click();
  await expect(day).not.toHaveAttribute("data-selected");
  const arabic = page.getByRole("grid", { name: "Arabic calendar" });
  await expect(arabic).toHaveAttribute("dir", "rtl");
  await expect(arabic.locator('[data-value="2026-09-05"][role="button"]')).toHaveText("٥");
});
