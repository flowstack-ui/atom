import { expect, test } from "@playwright/test";
import { openScenario } from "./helpers/playground";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openScenario(page, "Data", "Marquee");
});

test("regular workbench exposes default motion and persistent pause", async ({ page }) => {
  const root = page.getByRole("region", { name: "Workbench partner strip" });
  await expect(root).toHaveAttribute("data-state", "playing");
  await expect(root.locator("[data-original] [data-playground-marquee-part^=item-]")).toHaveCount(4);
  await page.getByRole("button", { name: "Pause strip", exact: true }).click();
  await expect(root).toHaveAttribute("data-state", "paused");
  await page.getByRole("button", { name: "Resume strip", exact: true }).click();
  await expect(root).toHaveAttribute("data-state", "playing");
});

test("regular workbench reduced-motion originals remain keyboard reachable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const root = page.getByRole("region", { name: "Workbench partner strip" });
  await expect(root).toHaveAttribute("data-static", "");
  const viewport = root.locator("[data-playground-marquee-part=viewport]");
  await viewport.focus();
  await expect(viewport).toBeFocused();
  await expect(root.locator("[data-replica]")).toHaveCount(0);
});
