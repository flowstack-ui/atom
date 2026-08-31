import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/__tests/color-picker");
  await expect(page.getByRole("heading", { name: "Color Picker browser harness" })).toBeVisible();
});

test("Color Picker shares area, channels, formats, native input, and presets", async ({ page }) => {
  const root = page.locator("[data-slot='color-picker']").first();
  const value = page.getByTestId("color-value");
  const completion = page.getByTestId("completion-count");
  const areaThumb = root.locator("[data-slot='color-picker-area-thumb']");
  const alphaThumb = root.locator("[data-slot='color-picker-channel-slider-thumb'][data-channel='alpha']");

  await expect(areaThumb).toHaveAttribute("aria-roledescription", "2d slider");
  const areaBefore = await areaThumb.getAttribute("aria-valuetext");
  await areaThumb.focus();
  await page.keyboard.press("ArrowRight");
  await expect(areaThumb).not.toHaveAttribute("aria-valuetext", areaBefore ?? "");

  const alphaBefore = Number(await alphaThumb.getAttribute("aria-valuenow"));
  await alphaThumb.focus();
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => Number(await alphaThumb.getAttribute("aria-valuenow"))).toBeLessThan(alphaBefore);
  await root.locator("[data-slot='color-picker-area']").click({ position: { x: 80, y: 80 } });
  await expect.poll(async () => Number(await completion.textContent())).toBeGreaterThan(0);

  await root.locator("[data-slot='color-picker-format-trigger']").click();
  await expect(root.locator("[data-slot='color-picker-format-trigger']")).toHaveText("HSBA");
  await expect(value).toContainText("hsba");

  const preset = root.locator("[data-slot='color-picker-swatch-trigger']").nth(2);
  await preset.click();
  await expect(preset).toHaveAttribute("data-state", "checked");
  await expect(root.locator("[data-slot='color-picker-input']")).toHaveValue("#E8590C");

  const native = root.locator("[data-slot='color-picker-native-input']");
  await native.evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = "#445566";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
  });
  await expect(root.locator("[data-slot='color-picker-input']")).toHaveValue("#445566");
});

test("Color Picker popup closes after a preset and restores its trigger", async ({ page }) => {
  const popupRoot = page.locator("[data-slot='color-picker']").nth(1);
  const trigger = popupRoot.locator("[data-slot='color-picker-trigger']");
  const content = popupRoot.locator("[data-slot='color-picker-content']");

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(content).toBeVisible();
  await content.locator("[data-slot='color-picker-swatch-trigger']").first().click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(content).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Color Picker mirrors horizontal keyboard movement in RTL", async ({ page }) => {
  const rtlRoot = page.locator("[data-slot='color-picker']").nth(2);
  const thumb = rtlRoot.locator("[data-slot='color-picker-channel-slider-thumb']");
  const before = Number(await thumb.getAttribute("aria-valuenow"));
  await thumb.focus();
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => Number(await thumb.getAttribute("aria-valuenow"))).toBeGreaterThan(before);
});

test("Color Picker is reachable through the normal Atom workbench", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("menuitem", { name: "Selection", exact: true }).click();
  await page.getByRole("menuitem", { name: "Color Picker" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Color Picker" })).toBeVisible();
  await expect(page.locator("[data-slot='color-picker']")).toBeVisible();
  await expect(page.getByRole("menubar", { name: "Color Picker controls" })).toBeVisible();
  await page.getByRole("tab", { name: "Source" }).click();
  await expect(page.getByRole("region", { name: "Canvas source" }).locator("pre")).toContainText("<ColorPicker.Root");
});
