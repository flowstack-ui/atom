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
    element.scrollTo({ left: 0, behavior: "instant" });
    element.dispatchEvent(new Event("scroll"));
  });
  await expect(root).toHaveAttribute("data-value", "company");
});

test("Carousel automatic rotation stops when focus enters", async ({ page }) => {
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
