import { expect, test } from "@playwright/test";
import { openScenario } from "./helpers/playground";

test("Carousel controls and native scrolling select one accessible slide", async ({ page }) => {
  await openScenario(page, "Navigation", "Carousel");

  const root = page.locator("[data-slot='carousel-root']");
  const viewport = page.locator("[data-slot='carousel-viewport']");
  const slides = page.locator("[data-slot='carousel-slide']");
  await expect(viewport).toHaveAttribute("tabindex", "0");
  await expect(root).toHaveAttribute("data-value", "company");
  await expect(slides.nth(0)).not.toHaveAttribute("aria-hidden", "true");
  await expect(slides.nth(1)).toHaveAttribute("aria-hidden", "true");

  await page.getByRole("button", { name: "Next slide" }).click();
  await expect(root).toHaveAttribute("data-value", "hosting");
  await expect(slides.nth(0)).toHaveAttribute("aria-hidden", "true");
  await expect(slides.nth(1)).not.toHaveAttribute("aria-hidden", "true");

  await page.getByRole("button", { name: "Swifty products" }).click();
  await expect(root).toHaveAttribute("data-value", "products");
  await expect(page.getByRole("button", { name: "Swifty products" })).toHaveAttribute("aria-disabled", "true");

  await viewport.evaluate((element) => {
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" }));
    element.scrollTo({ left: element.clientWidth * 2, behavior: "instant" });
    element.dispatchEvent(new Event("scroll"));
  });
  await expect(root).toHaveAttribute("data-value", "hosting");
});

test("Carousel loop keeps Next moving forward across the last boundary", async ({ page }) => {
  await openScenario(page, "Navigation", "Carousel");

  const root = page.locator("[data-slot='carousel-root']");
  const viewport = page.locator("[data-slot='carousel-viewport']");
  await page.getByRole("button", { name: "Swifty products" }).click();
  await expect(root).toHaveAttribute("data-value", "products");
  await expect.poll(() => viewport.evaluate((element) => Math.abs(element.scrollLeft - element.clientWidth * 3))).toBeLessThan(2);
  await viewport.evaluate((element) => {
    const target = element as HTMLElement & { __carouselScrollPositions?: number[] };
    target.__carouselScrollPositions = [];
    target.addEventListener("scroll", () => {
      target.__carouselScrollPositions?.push(target.scrollLeft);
    }, { passive: true });
  });
  const before = await viewport.evaluate((element) => element.scrollLeft);

  await page.getByRole("button", { name: "Next slide" }).click();
  await expect(root).toHaveAttribute("data-value", "company");
  await expect.poll(() => viewport.evaluate((element) => {
    const target = element as HTMLElement & { __carouselScrollPositions?: number[] };
    return Math.max(target.scrollLeft, ...(target.__carouselScrollPositions ?? []));
  })).toBeGreaterThan(before);
  await expect.poll(() => viewport.evaluate((element) => Math.abs(element.scrollLeft - element.clientWidth))).toBeLessThan(2);
});

test("Carousel initial alignment remains stable after layout settles", async ({ page }) => {
  await openScenario(page, "Navigation", "Carousel");

  const viewport = page.locator("[data-slot='carousel-viewport']");
  await expect(page.locator("[data-slot='carousel-root']")).toHaveAttribute("data-initialized", "");
  await expect.poll(() => viewport.evaluate((element) =>
    Math.abs(element.scrollLeft - element.clientWidth))).toBeLessThan(2);
  await page.waitForTimeout(250);
  await expect.poll(() => viewport.evaluate((element) =>
    Math.abs(element.scrollLeft - element.clientWidth))).toBeLessThan(2);
});

test("Carousel pointer activation toggles once and keyboard focus stops rotation", async ({ page }) => {
  await openScenario(page, "Navigation", "Carousel");
  const root = page.locator("[data-slot='carousel-root']");
  const rotation = page.locator("[data-slot='carousel-rotation-control']");

  await rotation.click();
  await expect(root).toHaveAttribute("data-state", "paused");
  await expect(rotation).toHaveAttribute("aria-label", "Stop slide rotation");

  await page.mouse.move(0, 0);
  await expect(root).toHaveAttribute("data-state", "playing");

  await rotation.click();
  await expect(root).toHaveAttribute("data-state", "stopped");
  await expect(rotation).toHaveAttribute("aria-label", "Start slide rotation");

  await rotation.click();
  await page.mouse.move(0, 0);
  await expect(root).toHaveAttribute("data-state", "playing");

  await page.locator("[data-slot='carousel-viewport']").focus();
  await expect(root).toHaveAttribute("data-state", "stopped");
  await expect(rotation).toHaveAttribute("aria-label", "Start slide rotation");
});
