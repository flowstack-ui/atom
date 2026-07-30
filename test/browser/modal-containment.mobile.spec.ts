import { expect, test, type Locator, type Page } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function prepareScrollable(content: Locator) {
  await content.evaluate((element) => {
    const node = element as HTMLElement;
    node.style.height = "180px";
    node.style.overflowY = "auto";
    const filler = document.createElement("div");
    filler.style.height = "900px";
    filler.textContent = "Long modal content";
    node.prepend(filler);
    node.scrollTop = 80;
  });
}

async function dispatchTouchMove(target: Locator, startY: number, moveY: number) {
  return target.evaluate((element, points) => {
    const createTouch = (clientY: number) => new Touch({
      identifier: 1,
      target: element,
      clientX: 20,
      clientY,
    });
    const startTouch = createTouch(points.startY);
    element.dispatchEvent(new TouchEvent("touchstart", {
      bubbles: true,
      cancelable: true,
      touches: [startTouch],
      changedTouches: [startTouch],
    }));
    const moveTouch = createTouch(points.moveY);
    const move = new TouchEvent("touchmove", {
      bubbles: true,
      cancelable: true,
      touches: [moveTouch],
      changedTouches: [moveTouch],
    });
    element.dispatchEvent(move);
    return move.defaultPrevented;
  }, { startY, moveY });
}

async function expectTouchContainment(page: Page, content: Locator, background: Locator) {
  await expect(content).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await expect.poll(() => background.evaluate((element) => Boolean(element.closest("[inert]")))).toBe(true);
  await prepareScrollable(content);
  expect(await dispatchTouchMove(content, 120, 80)).toBe(false);
  expect(await dispatchTouchMove(background, 120, 80)).toBe(true);
}

test("mobile modal Dropdown Menu allows owned touch scrolling and blocks background touchmove", async ({ page }) => {
  await openScenario(page, "Overlays", "Dropdown Menu");
  const background = page.getByRole("heading", { level: 1, name: "Dropdown Menu" });
  await page.locator("[data-playground-dropdown-menu-trigger]").tap();
  const menu = page.locator("[data-playground-menu-content]");
  await expectTouchContainment(page, menu, background);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});

test("mobile modal Popover isolates background and allows owned touch scrolling", async ({ page }) => {
  await openScenario(page, "Overlays", "Popover");
  await page.getByRole("menuitem", { name: "State", exact: true }).tap();
  await page.getByRole("menuitemcheckbox", { name: "Modal", exact: true }).tap();
  const background = page.getByRole("heading", { level: 1, name: "Popover" });
  await page.locator("[data-playground-popover-trigger]").tap();
  const content = page.locator("[data-playground-popover-content]");
  await expectTouchContainment(page, content, background);
  await page.keyboard.press("Escape");
  await expect(content).toBeHidden();
});
