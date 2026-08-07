import { expect, test, type Locator } from "@playwright/test";
import { openScenario } from "./helpers/playground.js";

async function expectRootRelativeGeometry(
  root: Locator,
  trigger: Locator,
  viewport: Locator,
) {
  const [rootBox, triggerBox, geometry] = await Promise.all([
    root.boundingBox(),
    trigger.boundingBox(),
    viewport.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        left: style.getPropertyValue("--atom-navigation-menu-trigger-left"),
        top: style.getPropertyValue("--atom-navigation-menu-trigger-top"),
        width: style.getPropertyValue("--atom-navigation-menu-trigger-width"),
        height: style.getPropertyValue("--atom-navigation-menu-trigger-height"),
      };
    }),
  ]);

  if (!rootBox || !triggerBox) {
    throw new Error("Navigation Menu geometry is not measurable.");
  }

  expect(Number.parseFloat(geometry.left)).toBeCloseTo(triggerBox.x - rootBox.x, 1);
  expect(Number.parseFloat(geometry.top)).toBeCloseTo(triggerBox.y - rootBox.y, 1);
  expect(Number.parseFloat(geometry.width)).toBeCloseTo(triggerBox.width, 1);
  expect(Number.parseFloat(geometry.height)).toBeCloseTo(triggerBox.height, 1);
}

async function expectResolvedHorizontalViewport(
  root: Locator,
  trigger: Locator,
  viewport: Locator,
) {
  await viewport.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  const [rootBox, triggerBox, viewportBox, position] = await Promise.all([
    root.boundingBox(),
    trigger.boundingBox(),
    viewport.boundingBox(),
    viewport.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        left: style.getPropertyValue("--atom-navigation-menu-viewport-left"),
        availableWidth: style.getPropertyValue("--atom-navigation-menu-viewport-available-width"),
      };
    }),
  ]);

  if (!rootBox || !triggerBox || !viewportBox) {
    throw new Error("Navigation Menu viewport position is not measurable.");
  }

  const triggerCenter = triggerBox.x + triggerBox.width / 2;
  expect(viewportBox.x).toBeCloseTo(rootBox.x + Number.parseFloat(position.left), 1);
  expect(triggerCenter).toBeGreaterThanOrEqual(viewportBox.x);
  expect(triggerCenter).toBeLessThanOrEqual(viewportBox.x + viewportBox.width);
  expect(Number.parseFloat(position.availableWidth)).toBeGreaterThanOrEqual(viewportBox.width);
}

test("Navigation Menu Viewport exposes Root-relative active-trigger geometry", async ({ page }) => {
  await openScenario(page, "Navigation", "Navigation Menu");

  const root = page.locator("[data-playground-navigation-root]");
  const viewport = page.locator("[data-playground-navigation-viewport='primary']");
  const learn = root.getByRole("button", { name: "Learn" });

  await learn.click();
  await expect(viewport).toHaveAttribute("data-state", "open");
  await expectRootRelativeGeometry(root, learn, viewport);
  await expectResolvedHorizontalViewport(root, learn, viewport);

  const overview = root.getByRole("button", { name: "Overview" });
  await overview.click();
  await expect(overview).toHaveAttribute("aria-expanded", "true");
  await expect(viewport).toHaveAttribute("data-state", "open");
  await expectRootRelativeGeometry(root, overview, viewport);
  await expectResolvedHorizontalViewport(root, overview, viewport);
});

test("Navigation Menu Viewport stays connected at a narrow visible edge", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await openScenario(page, "Navigation", "Navigation Menu");

  const root = page.locator("[data-playground-navigation-root]");
  const viewport = page.locator("[data-playground-navigation-viewport='primary']");
  const learn = root.getByRole("button", { name: "Learn" });

  await learn.click();
  await expect(viewport).toHaveAttribute("data-state", "open");
  await expectResolvedHorizontalViewport(root, learn, viewport);

  const viewportBox = await viewport.boundingBox();
  if (!viewportBox) throw new Error("Navigation Menu viewport is not measurable.");
  expect(viewportBox.x).toBeGreaterThanOrEqual(7);
  expect(viewportBox.x + viewportBox.width).toBeLessThanOrEqual(633);
});
