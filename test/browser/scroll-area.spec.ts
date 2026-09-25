import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/__tests/scroll-area-parity");
});
test("track clicks and pointer cancellation release drag ownership", async ({
  page,
}) => {
  const viewport = page.getByRole("region", { name: "Scrollable records" });
  const track = page.locator(
    '[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]',
  );
  await expect(viewport).toHaveAttribute("data-custom-ready", "");
  const box = (await track.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.7);
  await page.mouse.down();
  await expect(track).toHaveAttribute("data-dragging", "");
  await expect
    .poll(() => viewport.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await track.dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  await expect(track).not.toHaveAttribute("data-dragging", "");
});
test("custom tracks reflect native geometry, controller edges and resizing", async ({
  page,
}) => {
  const viewport = page.getByRole("region", { name: "Scrollable records" });
  await expect(viewport).toHaveAttribute("data-custom-ready", "");
  await expect(viewport).toHaveAttribute("data-overflow-x", "");
  await page.getByRole("button", { name: "Bottom", exact: true }).click();
  await expect(viewport).toHaveAttribute("data-at-bottom", "");
  const thumb = page.locator(
    '[data-slot="scroll-area-thumb"][data-orientation="vertical"]',
  );
  const box = (await thumb.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 4, box.y - 150, { steps: 8 });
  await page.mouse.up();
  await expect(viewport).not.toHaveAttribute("data-at-bottom", "");
  await expect(thumb).not.toHaveAttribute("data-dragging", "");
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await expect(viewport).not.toHaveAttribute("data-overflow-y", "");
});
test("RTL physical edges, keyboard native scrolling and reduced motion", async ({
  page,
}) => {
  const viewport = page.getByRole("region", { name: "Scrollable records" });
  await page.getByRole("button", { name: "Direction", exact: true }).click();
  await page.getByRole("button", { name: "Left", exact: true }).click();
  await expect(viewport).toHaveAttribute("data-at-left", "");
  await page.getByRole("button", { name: "Right", exact: true }).click();
  await expect(viewport).toHaveAttribute("data-at-right", "");
  await viewport.focus();
  await page.keyboard.press("PageDown");
  await expect
    .poll(() => viewport.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await expect(
    page.locator(
      '[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]',
    ),
  ).not.toHaveAttribute("data-scrolling", "");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Animate top", exact: true }).click();
  await expect(viewport).toHaveAttribute("data-at-top", "");
});

test("hidden/revealed geometry, interrupted motion and unmount recover without focus theft", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const viewport = page.getByRole("region", { name: "Scrollable records" });
  await page.getByRole("button", { name: "Visibility", exact: true }).click();
  await expect(viewport).toBeHidden();
  await page.getByRole("button", { name: "Visibility", exact: true }).click();
  await expect(viewport).toHaveAttribute("data-overflow-y", "");
  const animate = page.getByRole("button", {
    name: "Animate bottom",
    exact: true,
  });
  await animate.focus();
  await animate.press("Enter");
  await expect
    .poll(() => viewport.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(5);
  await expect(animate).toBeFocused();
  await viewport.dispatchEvent("wheel", { deltaY: -1 });
  const stopped = await viewport.evaluate((el) => el.scrollTop);
  // Wait beyond the requested duration to prove no delayed snap-back.
  await page.waitForTimeout(1300);
  expect(Math.abs(await viewport.evaluate((el) => el.scrollTop) - stopped)).toBeLessThanOrEqual(1);
  await animate.click();
  await page.getByRole("button", { name: "Mount", exact: true }).click();
  await expect(viewport).toHaveCount(0);
  await page.getByRole("button", { name: "Mount", exact: true }).click();
  await expect(viewport).toHaveAttribute("data-custom-ready", "");
  await page.getByRole("button", { name: "Bottom", exact: true }).click();
  await expect(viewport).toHaveAttribute("data-at-bottom", "");
  expect(errors).toEqual([]);
});
