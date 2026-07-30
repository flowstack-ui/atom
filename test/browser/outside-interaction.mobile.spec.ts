import { expect, test } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function pointOutside(
  page: import("@playwright/test").Page,
  locators: import("@playwright/test").Locator[],
) {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Expected a fixed browser-test viewport");
  const boxes = await Promise.all(locators.map((locator) => locator.boundingBox()));
  const candidates = [
    { x: 8, y: 8 },
    { x: viewport.width - 8, y: 8 },
    { x: 8, y: viewport.height - 8 },
    { x: viewport.width - 8, y: viewport.height - 8 },
  ];
  const point = candidates.find((candidate) => boxes.every((box) => !box || (
    candidate.x < box.x ||
    candidate.x > box.x + box.width ||
    candidate.y < box.y ||
    candidate.y > box.y + box.height
  )));
  if (!point) throw new Error("Expected a viewport point outside the open layer");
  return point;
}

test("mobile tap dismisses Combobox only after outside activation", async ({ page }) => {
  await openScenario(page, "Selection", "Combobox");
  const input = page.getByRole("combobox");
  const listbox = page.getByRole("listbox");
  await input.tap();
  await expect(listbox).toBeVisible();

  await page.getByRole("heading", { level: 1, name: "Combobox" }).tap();
  await expect(listbox).toBeHidden();
});

test("mobile tap dismisses Dropdown Menu at a verified outside point", async ({
  page,
}) => {
  await openScenario(page, "Overlays", "Dropdown Menu");
  const trigger = page.locator("[data-playground-dropdown-menu-trigger]");
  const menu = page.locator("[data-playground-menu-content]");
  await trigger.tap();
  await expect(menu).toBeVisible();

  const point = await pointOutside(page, [menu, trigger]);
  await page.touchscreen.tap(point.x, point.y);
  await expect(menu).toBeHidden();
});
