import { expect, test } from "@playwright/test";
import { openScenario } from "./helpers/playground";

test("mobile context exposes touch input and keeps a Dialog operable", async ({
  page,
}) => {
  await openScenario(page, "Overlays", "Dialog");

  const capabilities = await page.evaluate(() => ({
    coarsePointer: matchMedia("(pointer: coarse)").matches,
    maxTouchPoints: navigator.maxTouchPoints,
    viewport: {
      height: window.visualViewport?.height ?? window.innerHeight,
      width: window.visualViewport?.width ?? window.innerWidth,
    },
  }));
  expect(
    capabilities.coarsePointer || capabilities.maxTouchPoints > 0,
  ).toBe(true);
  expect(capabilities.viewport.height).toBeGreaterThan(0);
  expect(capabilities.viewport.width).toBeGreaterThan(0);

  await page.locator("[data-playground-dialog-trigger]").tap();
  const dialog = page.getByRole("dialog", { name: "Project settings" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");

  const visibleBounds = await dialog.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const viewport = window.visualViewport;
    return {
      bottom: bounds.bottom,
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      viewportHeight: viewport?.height ?? window.innerHeight,
      viewportWidth: viewport?.width ?? window.innerWidth,
    };
  });
  expect(visibleBounds.bottom).toBeGreaterThan(0);
  expect(visibleBounds.right).toBeGreaterThan(0);
  expect(visibleBounds.top).toBeLessThan(visibleBounds.viewportHeight);
  expect(visibleBounds.left).toBeLessThan(visibleBounds.viewportWidth);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator("[data-playground-dialog-trigger]")).toBeFocused();
});

test("mobile touch opens Select and commits an option", async ({ page }) => {
  await openScenario(page, "Selection", "Select");

  const trigger = page.locator("[data-playground-select-trigger]");
  await trigger.tap();
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const options = listbox.locator("[role='option']:not([aria-disabled='true'])");
  await expect(options.first()).toBeVisible();
  await options.first().tap();
  await expect(listbox).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("mobile Select preserves inherited RTL across its portal", async ({ page }) => {
  await openScenario(page, "Selection", "Select");

  const trigger = page.locator("[data-playground-select-trigger]");
  await trigger.evaluate((element) =>
    element.closest(".select-field")?.setAttribute("dir", "rtl"),
  );
  await expect(trigger).toHaveCSS("direction", "rtl");
  await trigger.tap();

  const listbox = page.getByRole("listbox");
  await expect(listbox).toHaveCSS("direction", "rtl");
  const [triggerBox, listboxBox] = await Promise.all([
    trigger.boundingBox(),
    listbox.boundingBox(),
  ]);
  expect(triggerBox).not.toBeNull();
  expect(listboxBox).not.toBeNull();
  expect(Math.abs(
    (triggerBox!.x + triggerBox!.width) -
    (listboxBox!.x + listboxBox!.width),
  )).toBeLessThanOrEqual(2);
});
