import { test, expect } from "@playwright/test";

test("touch keeps selection and secondary actions separate from row activation", async ({ page }) => {
  await page.goto("/__tests/record-selection");
  await page.getByRole("checkbox", { name: "Select alpha", exact: true }).tap();
  await expect(page.getByLabel("Selected", { exact: true })).toHaveText("alpha");
  await expect(page.getByLabel("Opened", { exact: true })).toHaveText("0");
  await page.getByTestId("space-alpha").tap();
  await expect(page.getByLabel("Opened", { exact: true })).toHaveText("1");
  await page.getByRole("button", { name: "Receipt alpha", exact: true }).tap();
  await expect(page.getByLabel("Actions", { exact: true })).toHaveText("1");
  await expect(page.getByLabel("Opened", { exact: true })).toHaveText("1");
  await page.getByTestId("row-alpha").dispatchEvent("pointercancel");
  await page.getByTestId("space-alpha").dispatchEvent("click", { button: 0 });
  await expect(page.getByLabel("Opened", { exact: true })).toHaveText("1");
  await page.getByTestId("space-alpha").tap();
  await expect(page.getByLabel("Opened", { exact: true })).toHaveText("2");
});
