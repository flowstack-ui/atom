import { expect, test } from "@playwright/test";

test("menu and submenu stay in the trigger's iframe document", async ({ page }) => {
  await page.goto("/__tests/menu-scroll");
  const frame = page.frameLocator('iframe[title="Menu document"]');
  const trigger = frame.getByRole("button", { name: "Frame actions" });
  await trigger.focus();
  await trigger.press("ArrowDown");
  await expect(frame.getByRole("menuitem", { name: "Copy in frame", exact: true })).toBeFocused();
  await expect(frame.getByTestId("frame-arrow")).toBeVisible();
  await expect(frame.getByTestId("frame-arrow")).toHaveCSS("fill", "rgb(90, 20, 60)");
  await frame.getByRole("menuitem", { name: "Copy in frame", exact: true }).press("ArrowDown");
  await frame.getByRole("menuitem", { name: "More in frame", exact: true }).press("ArrowRight");
  const nested = frame.getByRole("menuitem", { name: "Nested in frame", exact: true });
  await expect(nested).toBeFocused();
  await expect(frame.getByTestId("frame-portal-host").getByRole("menuitem", { name: "Nested in frame" })).toBeFocused();
  await nested.press("Escape");
  await frame.getByRole("menuitem", { name: "More in frame", exact: true }).press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
});

for (const direction of ["ltr", "rtl"]) {
  for (const invocation of ["pointer", "keyboard"]) {
    test(`${direction} ${invocation}: bottom-edge opening and item reveal stay menu-local`, async ({ page }) => {
      await page.goto("/__tests/menu-scroll");
      await page.evaluate((dir) => {
        document.documentElement.dir = dir;
        window.scrollTo(0, 100);
        // Any call is forbidden: this native API may scroll ancestors.
        Element.prototype.scrollIntoView = () => { throw new Error("Unbounded menu scrolling"); };
      }, direction);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const trigger = page.getByRole("button", { name: "Account" });
      const offsets = () => page.evaluate(() => [window.scrollX, window.scrollY, document.querySelector('[data-testid="ancestor"]')!.scrollTop]);
      const baseline = await offsets();
      for (let opening = 0; opening < 2; opening++) {
        if (invocation === "pointer") {
          await trigger.click();
          await expect(page.getByRole("menu").first()).toBeFocused();
          await page.keyboard.press("ArrowDown");
        }
        else {
          await trigger.focus();
          await page.keyboard.press("ArrowDown");
        }
        await expect(page.getByRole("menuitem", { name: "Profile", exact: true })).toBeFocused();
        const root = page.getByRole("menu").first();
        await expect(root).toHaveAttribute("data-positioned", "");
        const arrow = page.getByTestId("menu-arrow");
        await expect(arrow).toBeVisible();
        await expect(arrow).toHaveCSS("fill", "rgb(20, 60, 100)");
        await root.evaluate(element => {
          element.style.removeProperty("--test-menu-arrow-fill");
          element.ownerDocument.documentElement.style.setProperty("--test-menu-arrow-fill", "rgb(10, 80, 40)");
        });
        await expect(arrow).toHaveCSS("fill", "rgb(10, 80, 40)");
        await root.evaluate(element => element.ownerDocument.documentElement.style.setProperty("--test-menu-arrow-fill", "rgb(60, 20, 90)"));
        await expect(arrow).toHaveCSS("fill", "rgb(60, 20, 90)");
        await root.evaluate(element => {
          element.style.setProperty("--test-menu-arrow-fill", "rgb(20, 60, 100)");
          element.ownerDocument.documentElement.style.removeProperty("--test-menu-arrow-fill");
        });
        expect(await arrow.evaluate(element => element.parentElement === document.querySelector('[role="menu"]')?.parentElement)).toBe(true);
        await expect(root.locator("..")).toHaveCSS("z-index", "83");
        await root.evaluate(element => { element.style.fontSize = "1.25em"; });
        await expect.poll(() => root.evaluate(element => {
          const ancestor = element.parentElement!.parentElement!;
          return Number.parseFloat(getComputedStyle(element).fontSize) / Number.parseFloat(getComputedStyle(ancestor).fontSize);
        })).toBe(1.25);
        await root.evaluate(element => { element.style.removeProperty("font-size"); });
        // A local appearance override may change while the popup remains open.
        await root.evaluate(element => element.style.setProperty("--test-menu-arrow-fill", "rgb(90, 30, 60)"));
        await expect(arrow).toHaveCSS("fill", "rgb(90, 30, 60)");
        await root.evaluate(element => element.style.setProperty("--test-menu-arrow-fill", "rgb(20, 60, 100)"));
        await expect(arrow).toHaveCSS("fill", "rgb(20, 60, 100)");
        await page.keyboard.press("End");
        await expect(page.getByRole("menuitem", { name: "Item 19", exact: true })).toBeFocused();
        await expect.poll(() => root.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        await page.keyboard.press("Home");
        await expect.poll(() => root.evaluate((el) => el.scrollTop)).toBe(0);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
        await expect(page.getByRole("menuitem", { name: "Nested 0", exact: true })).toBeFocused();
        await page.keyboard.press("End");
        await expect(page.getByRole("menuitem", { name: "Nested 19", exact: true })).toBeFocused();
        const nested = page.getByRole("menu").last();
        await expect(page.getByTestId("submenu-arrow")).toBeVisible();
        await expect.poll(() => nested.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await expect(trigger).toBeFocused();
        expect(await offsets()).toEqual(baseline);
      }
      expect(errors).toEqual([]);
    });
  }
}
