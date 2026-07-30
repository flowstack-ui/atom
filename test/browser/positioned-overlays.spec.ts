import { expect, test, type Locator, type Page } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function pinToViewportEdge(element: Locator) {
  await element.evaluate((node) => {
    const target = node as HTMLElement;
    Object.assign(target.style, {
      bottom: "8px",
      insetInlineStart: "8px",
      position: "fixed",
      width: "min(320px, calc(100vw - 16px))",
      zIndex: "200",
    });
  });
}

async function expectWithinVisualViewport(page: Page, layer: Locator) {
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute("data-positioned", "");
  await expect.poll(() => layer.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const right = left + (viewport?.width ?? window.innerWidth);
    const bottom = top + (viewport?.height ?? window.innerHeight);
    return (
      bounds.left >= left - 1 &&
      bounds.top >= top - 1 &&
      bounds.right <= right + 1 &&
      bounds.bottom <= bottom + 1
    );
  })).toBe(true);
}

test("Combobox stays reachable when an edge anchor and viewport resize force repositioning", async ({ page }) => {
  await page.setViewportSize({ width: 520, height: 360 });
  await openScenario(page, "Selection", "Combobox");
  const input = page.getByRole("combobox");
  await pinToViewportEdge(input);
  await input.click();
  const content = page.locator("[data-slot='combobox-content']");
  await expectWithinVisualViewport(page, content);
  await expect(page.getByRole("listbox")).toBeVisible();

  await page.setViewportSize({ width: 360, height: 260 });
  await expectWithinVisualViewport(page, content);
});

test("Dropdown Menu stays reachable when an edge trigger and viewport resize force repositioning", async ({ page }) => {
  await page.setViewportSize({ width: 520, height: 360 });
  await openScenario(page, "Overlays", "Dropdown Menu");
  await page.addStyleTag({ content: ".playground-menu-content { max-height: var(--atom-menu-available-height, calc(100dvh - 16px)); overflow-y: auto; }" });
  const trigger = page.locator("[data-playground-dropdown-menu-trigger]");
  await pinToViewportEdge(trigger);
  await trigger.click();
  const menu = page.locator("[data-playground-menu-content]");
  await expect(menu).toBeVisible();
  await expectWithinVisualViewport(page, menu);

  await page.setViewportSize({ width: 360, height: 260 });
  await expectWithinVisualViewport(page, menu);
});
