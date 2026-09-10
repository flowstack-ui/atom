import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => { await page.goto("/__tests/dates"); });
test("segment editing submits canonical values and reset restores defaults", async ({ page }) => {
  const day = page.getByRole("group", { name: "Birthday", exact: true }).getByRole("spinbutton", { name: "Day", exact: true });
  await day.focus();
  await page.keyboard.press("ArrowUp");
  await expect(day).toHaveText("6");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByLabel("Submitted values")).toContainText('"birthday":"2026-09-06"');
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(day).toHaveText("5");
});

test("required validation focuses the visible segment and datetime retains its zone", async ({ page }) => {
  await page.getByRole("button", { name: "Validate required date" }).click();
  await expect(page.getByRole("group", { name: "Required date" }).getByRole("spinbutton", { name: "Month", exact: true })).toBeFocused();
  const hour = page.getByRole("group", { name: "Zoned appointment" }).getByRole("spinbutton", { name: "Hour", exact: true });
  await hour.focus(); await page.keyboard.press("ArrowUp");
  await expect(page.locator('input[name="zoned"]')).toHaveValue("2026-09-05T15:30:00-04:00[America/New_York]");
});
test("range endpoint label focuses its own segments", async ({ page }) => {
  await page.getByText("End", { exact: true }).click();
  await expect(page.getByRole("group", { name: "End", exact: true }).getByRole("spinbutton", { name: "Month", exact: true })).toBeFocused();
});
