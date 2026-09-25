import { expect, test } from "@playwright/test";

test("selection workbench exposes independent scope and source", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("menuitem", { name: "Utilities", exact: true }).click();
  await page.getByRole("menu", { name: "Utilities", exact: true }).getByRole("menuitem", { name: "Selection", exact: true }).click();
  await page.getByRole("checkbox", { name: "Select alpha", exact: true }).click();
  await expect(page.locator(".panel-footer").filter({ hasText: "1 selected" })).toBeVisible();
  await page.getByRole("button", { name: "Select scope", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "Select gamma", exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Clear selection", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "Select alpha", exact: true })).not.toBeChecked();
});

test("delegation workbench keeps secondary actions independent", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("menuitem", { name: "Utilities", exact: true }).click();
  await page.getByRole("menuitem", { name: "Action Delegate", exact: true }).click();
  const host = page.locator("[data-playground-record-host]");
  await expect(host).not.toHaveAttribute("tabindex");
  await host.getByRole("button", { name: "Secondary action", exact: true }).click();
  expect(new URL(page.url()).hash).toBe("");
  await host.getByText("Click the record text to open its actual link.", { exact: true }).click();
  await expect(page).toHaveURL(/#record-workbench-destination$/);
});
