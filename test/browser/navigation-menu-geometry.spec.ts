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

test("Navigation Menu Viewport exposes Root-relative active-trigger geometry", async ({ page }) => {
  await openScenario(page, "Navigation", "Navigation Menu");

  const root = page.locator("[data-playground-navigation-root]");
  const viewport = page.locator("[data-playground-navigation-viewport='primary']");
  const learn = root.getByRole("button", { name: "Learn" });

  await learn.click();
  await expect(viewport).toHaveAttribute("data-state", "open");
  await expectRootRelativeGeometry(root, learn, viewport);

  const overview = root.getByRole("button", { name: "Overview" });
  await overview.click();
  await expect(overview).toHaveAttribute("aria-expanded", "true");
  await expect(viewport).toHaveAttribute("data-state", "open");
  await expectRootRelativeGeometry(root, overview, viewport);
});
