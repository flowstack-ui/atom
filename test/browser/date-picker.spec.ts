import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => { await page.goto("/__tests/dates"); });
test("popup selection shares input value and returns focus to the trigger", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Choose appointment" });
  await trigger.click();
  const popup = page.getByRole("dialog", { name: "Appointment calendar" });
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(popup.getByRole("button", { name: "Today. Choose Saturday, September 5, 2026", exact: true })).toBeFocused();
  await popup.getByRole("button", { name: "Choose Tuesday, September 8, 2026", exact: true }).click();
  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByLabel("Submitted values")).toContainText('"appointment":"2026-09-08"');
});

test("disabled and read-only pickers cannot open; nested Escape closes only the calendar", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Disabled date picker" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Read-only date picker" })).toBeDisabled();
  await page.getByRole("button", { name: "Open booking dialog" }).click();
  await page.getByRole("button", { name: "Choose nested date" }).click();
  const popup = page.getByRole("dialog", { name: "Nested calendar" });
  await expect(popup.locator('[data-slot="calendar-day"][tabindex="0"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Booking", exact: true })).toBeVisible();
});
test("Escape dismisses without committing a focused date", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Choose appointment" });
  await trigger.click();
  const popup = page.getByRole("dialog", { name: "Appointment calendar" });
  await expect(popup.getByRole("button", { name: "Today. Choose Saturday, September 5, 2026", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(popup.getByRole("button", { name: "Choose Sunday, September 6, 2026", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("group", { name: "Appointment", exact: true }).getByRole("spinbutton", { name: "Day", exact: true })).toHaveText("dd");
});
