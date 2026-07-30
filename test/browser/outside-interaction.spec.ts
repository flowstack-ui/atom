import { expect, test, type Locator, type Page } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function pointOutside(page: Page, locators: Locator[]) {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Expected a fixed browser-test viewport");
  const boxes = await Promise.all(locators.map((locator) => locator.boundingBox()));
  const candidates = [
    { x: 8, y: 8 },
    { x: viewport.width - 8, y: 8 },
    { x: 8, y: viewport.height - 8 },
    { x: viewport.width - 8, y: viewport.height - 8 },
    { x: viewport.width / 2, y: 8 },
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

async function openDropdownMenu(page: Page) {
  const trigger = page.locator("[data-playground-dropdown-menu-trigger]");
  await trigger.click();
  const menu = page.locator("[data-playground-menu-content]");
  await expect(menu).toBeVisible();
  return { menu, trigger };
}

test("Dropdown Menu dismisses on release while preserving drag cancellation", async ({
  page,
}) => {
  await openScenario(page, "Overlays", "Dropdown Menu");
  const { menu, trigger } = await openDropdownMenu(page);
  const point = await pointOutside(page, [menu, trigger]);

  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await expect(menu).toBeVisible();
  await page.mouse.up();
  await expect(menu).toBeHidden();

  await trigger.click();
  await expect(menu).toBeVisible();
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 24, point.y);
  await page.mouse.up();
  await expect(menu).toBeVisible();

  await page.mouse.click(point.x, point.y);
  await expect(menu).toBeHidden();
});

test("Combobox keeps its destination activation when outside dismissal commits", async ({
  page,
}) => {
  await openScenario(page, "Selection", "Combobox");
  const input = page.getByRole("combobox");
  const listbox = page.getByRole("listbox");
  await input.click();
  await expect(listbox).toBeVisible();

  const outside = page.getByRole("heading", { level: 1, name: "Combobox" });
  await outside.click();
  await expect(listbox).toBeHidden();
  await expect(outside).toBeVisible();
});
