import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => { await page.goto("/__tests/action-bar"); });
test("opening preserves focus and the selection region remains interactive", async ({ page }) => {
  const opener = page.getByRole("button", { name: "Select files", exact: true });
  await opener.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Selected file actions" })).toBeVisible();
  await expect(opener).toBeFocused();
  await page.getByRole("button", { name: "Select another file" }).click();
  await expect(page.getByRole("dialog", { name: "Selected file actions" })).toBeVisible();
  await expect(page.locator('[data-slot="popover-focus-guard"]')).toHaveCount(0);
});
test("Escape cancellation and retained-state reopening", async ({ page }) => {
  await page.getByLabel("Prevent Escape").check();
  await page.getByRole("button", { name: "Select files", exact: true }).click();
  await page.getByRole("textbox", { name: "Draft note" }).fill("Keep this note");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Selected file actions" })).toBeVisible();
  await page.getByRole("button", { name: "Close actions" }).click();
  await expect(page.getByRole("dialog", { name: "Selected file actions" })).toBeHidden();
  await page.getByRole("button", { name: "Select files", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Draft note" })).toHaveValue("Keep this note");
});
test("nested dialog Escape dismisses only the dialog", async ({ page }) => {
  await page.getByRole("button", { name: "Select files", exact: true }).click();
  await page.getByRole("button", { name: "Delete files", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Confirm deletion" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Confirm deletion" })).toBeHidden();
  await expect(page.getByRole("dialog", { name: "Selected file actions" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete files", exact: true })).toBeFocused();
});
test("outside action dismisses and preserves destination focus", async ({ page }) => {
  await page.getByRole("button", { name: "Select files", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Selected file actions" })).toBeVisible();
  const outside = page.getByRole("button", { name: "Outside action" });
  await outside.focus();
  await expect(page.getByRole("dialog", { name: "Selected file actions" })).toBeHidden();
  await expect(outside).toBeFocused();
});
