import { expect, test, type Locator, type Page } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function expectWithinVisualViewport(page: Page, layer: Locator) {
  await expect(layer).toBeVisible();
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

test("consumer safe-area and application offsets keep an actionable Toast reachable", async ({ page }) => {
  await openScenario(page, "Overlays", "Toast");
  const input = page.locator("input[aria-label='Lower-page field']");
  await page.evaluate(() => {
    const field = document.createElement("input");
    field.setAttribute("aria-label", "Lower-page field");
    Object.assign(field.style, {
      bottom: "8px",
      insetInlineStart: "8px",
      position: "fixed",
    });
    document.body.append(field);
  });
  await input.tap();
  await expect(input).toBeFocused();

  await page.locator("[data-playground-toast-show]").evaluate((element) => {
    (element as HTMLButtonElement).click();
  });
  const viewport = page.locator("[data-playground-toast-viewport]");
  await expect(viewport).toBeVisible();
  await viewport.evaluate((element) => {
    const node = element as HTMLElement;
    node.style.setProperty("--app-toast-bottom-offset", "48px");
    node.style.bottom = "calc(env(safe-area-inset-bottom, 0px) + var(--app-toast-bottom-offset) + 16px)";
    node.style.insetInline = "16px";
    node.style.width = "auto";
  });
  await expect(input).toBeFocused();
  const toast = page.locator("[data-playground-toast-root]");
  await expectWithinVisualViewport(page, toast);
  await page.setViewportSize({ width: 740, height: 360 });
  await expectWithinVisualViewport(page, toast);
  await toast.getByRole("button", { name: "Undo change", exact: true }).tap();
  await expect(toast).toBeHidden();
});
