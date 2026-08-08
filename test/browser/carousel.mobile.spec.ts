import { expect, test } from "@playwright/test";
import { openScenario } from "./helpers/playground";

test("Carousel mobile viewport scroll selects the nearest full-width slide", async ({ page }) => {
  await openScenario(page, "Navigation", "Carousel");
  const root = page.locator("[data-slot='carousel-root']");
  const viewport = page.locator("[data-slot='carousel-viewport']");
  const slides = page.locator("[data-slot='carousel-slide']");

  await expect(viewport).toHaveCSS("overflow-x", "auto");
  const geometry = await viewport.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeGreaterThan(geometry.clientWidth * 2);

  await viewport.evaluate((element) => {
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" }));
    element.scrollTo({ left: element.clientWidth * 2, behavior: "instant" });
    element.dispatchEvent(new Event("scroll"));
  });
  await expect(root).toHaveAttribute("data-value", "hosting");
  await expect(slides.nth(1)).not.toHaveAttribute("aria-hidden", "true");

  const box = await root.boundingBox();
  expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
});
