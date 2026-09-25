import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => { await page.goto("/__tests/steps"); });
test("Steps validates forward paths and preserves entered state", async ({ page }) => {
  await page.getByRole("textbox", { name: "Name" }).fill("Morgan");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.getByTestId("step")).toHaveText("0");
  await expect(page.getByTestId("blocked")).toHaveText("1");
  await page.getByRole("button", { name: "Allow forward" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByTestId("step")).toHaveText("1");
  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Morgan");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByTestId("completed")).toHaveText("1");
  await expect(page.getByText("Completed setup", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByTestId("step")).toHaveText("0");
});
test("Steps native keyboard, controlled composition and cancellation", async ({ page }) => {
  await page.getByRole("button", { name: "Controlled next" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("controlled-step")).toHaveText("1");
  await page.getByRole("button", { name: "External reset" }).click();
  await expect(page.getByTestId("controlled-step")).toHaveText("0");
  await page.getByRole("button", { name: "Prevented next" }).click();
  await expect(page.getByTestId("prevented-step")).toHaveText("0");
  await expect(page.getByRole("button", { name: "Disabled next" })).toBeDisabled();
  await expect(page.getByRole("tab")).toHaveCount(0);
});
test("Steps recovers focus when an action hides its mounted panel", async ({ page }) => {
  await page.getByRole("button", { name: "Allow forward" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next inside panel" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("group", { name: "Review", exact: true })).toBeFocused();
});
