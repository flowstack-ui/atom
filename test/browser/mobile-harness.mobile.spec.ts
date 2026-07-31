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

test("mobile Dropdown Menu preserves inherited RTL across its portals", async ({
  page,
}) => {
  await openScenario(page, "Overlays", "Dropdown Menu");

  await page.addStyleTag({
    content: `
      [data-playground-dropdown-menu-trigger] {
        position: fixed;
        inset: 4rem auto auto 50%;
        width: 5rem;
      }
      [data-playground-menu-content] {
        width: 18.75rem;
      }
      [data-playground-menu-sub-content] {
        width: 13.75rem;
      }
    `,
  });
  const trigger = page.locator("[data-playground-dropdown-menu-trigger]");
  await trigger.evaluate((element) => element.setAttribute("dir", "rtl"));
  await expect(trigger).toHaveCSS("direction", "rtl");
  await trigger.tap();

  const menu = page.locator("[data-playground-menu-content]");
  await expect(menu).toHaveCSS("direction", "rtl");

  const subTrigger = page.locator("[data-playground-menu-sub-trigger]");
  await subTrigger.focus();
  await subTrigger.press("ArrowLeft");
  const subMenu = page.locator("[data-playground-menu-sub-content]");
  await expect(subMenu).toBeVisible();
  await expect(subMenu).toHaveCSS("direction", "rtl");
  await expect(subMenu).toHaveAttribute("data-side", /^(top|bottom)$/);
  const subMenuBounds = await subMenu.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    return {
      bottom: bounds.bottom,
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      viewportBottom: top + (viewport?.height ?? window.innerHeight),
      viewportLeft: left,
      viewportRight: left + (viewport?.width ?? window.innerWidth),
      viewportTop: top,
    };
  });
  expect(subMenuBounds.left).toBeGreaterThanOrEqual(subMenuBounds.viewportLeft - 1);
  expect(subMenuBounds.right).toBeLessThanOrEqual(subMenuBounds.viewportRight + 1);
  expect(subMenuBounds.top).toBeGreaterThanOrEqual(subMenuBounds.viewportTop - 1);
  expect(subMenuBounds.bottom).toBeLessThanOrEqual(subMenuBounds.viewportBottom + 1);
});
