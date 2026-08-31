import { expect, test } from "@playwright/test";

test("Color Picker area and alpha slider accept emulated touch without page gestures", async ({ page }) => {
  await page.goto("/__tests/color-picker");
  const root = page.locator("[data-slot='color-picker']").first();
  const area = root.locator("[data-slot='color-picker-area']");
  const alpha = root.locator("[data-slot='color-picker-channel-slider'][data-channel='alpha']");
  const value = page.getByTestId("color-value");
  const before = await value.textContent();

  await area.tap({ position: { x: 48, y: 48 } });
  await expect(value).not.toHaveText(before ?? "");

  const afterArea = await value.textContent();
  await alpha.tap({ position: { x: 24, y: 7 } });
  await expect(value).not.toHaveText(afterArea ?? "");
  await expect(page.getByTestId("completion-count")).not.toHaveText("0");
});
