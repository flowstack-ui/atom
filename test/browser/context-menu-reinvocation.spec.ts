import { expect, test } from "@playwright/test";
import { openScenario } from "./helpers/playground";

test("Context Menu re-invokes at the latest secondary-click point", async ({ page }) => {
  await openScenario(page, "Overlays", "Context Menu");
  const trigger = page.locator("[data-playground-context-menu-trigger]");
  const target = trigger.locator(":scope > *").first();
  const menu = page.locator("[data-playground-menu-content][data-state=open]");
  const targetBox = await target.boundingBox();
  if (!targetBox) throw new Error("Context Menu trigger has no browser geometry");

  await page.evaluate(() => {
    (window as Window & { contextMenuDefaults?: boolean[] }).contextMenuDefaults = [];
    document.addEventListener("contextmenu", (event) => {
      (window as Window & { contextMenuDefaults?: boolean[] }).contextMenuDefaults?.push(
        event.defaultPrevented,
      );
    });
  });

  const firstPoint = {
    x: targetBox.x + 24,
    y: targetBox.y + targetBox.height / 2,
  };
  const secondPoint = {
    x: targetBox.x + targetBox.width - 24,
    y: targetBox.y + targetBox.height / 2,
  };
  await page.mouse.click(firstPoint.x, firstPoint.y, { button: "right" });
  await expect(menu).toBeVisible();
  const firstMenuBox = await menu.boundingBox();

  await page.mouse.click(secondPoint.x, secondPoint.y, { button: "right" });
  await expect(menu).toBeVisible();
  const secondMenuBox = await menu.boundingBox();
  expect(firstMenuBox).not.toBeNull();
  expect(secondMenuBox).not.toBeNull();
  expect(Math.abs(secondMenuBox!.x - firstMenuBox!.x)).toBeGreaterThan(20);
  expect(await page.evaluate(() => (
    (window as Window & { contextMenuDefaults?: boolean[] }).contextMenuDefaults
  ))).not.toContain(false);
});

test("one activation outside an open submenu dismisses the complete menu tree", async ({
  page,
}) => {
  await openScenario(page, "Overlays", "Context Menu");
  const target = page
    .locator("[data-playground-context-menu-trigger]")
    .locator(":scope > *")
    .first();
  const targetBox = await target.boundingBox();
  if (!targetBox) throw new Error("Context Menu trigger has no browser geometry");
  await page.mouse.click(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { button: "right" },
  );

  const parent = page.locator("[data-playground-menu-content][data-state=open]");
  await expect(parent).toBeVisible();
  const subTrigger = page.locator("[data-playground-menu-sub-trigger]");
  await subTrigger.focus();
  await subTrigger.press("ArrowRight");
  const submenu = page.locator("[data-playground-menu-sub-content][data-state=open]");
  await expect(submenu).toBeVisible();

  await page.mouse.click(8, 8);
  await expect(submenu).toBeHidden();
  await expect(parent).toBeHidden();
});
