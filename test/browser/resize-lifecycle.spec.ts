import { expect, test, type Page } from "@playwright/test";

async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().map(animation => animation.finished));
    for (let frame = 0; frame < 4; frame++) await new Promise(requestAnimationFrame);
  });
}

test("initial partial disclosure and editable reflow settle without observer errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [1280, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/__tests/resize-lifecycle");
    await expect(page.locator("#resize-panel")).toHaveAttribute("inert", "");
    await settle(page);
    await expect.poll(async () => (await page.locator("#resize-panel").boundingBox())!.height).toBe(48);
    for (const size of ["95%", "40%", "80%", "55%"]) {
      await page.locator("#resize-fixture").evaluate((element, value) => { element.style.width = value; }, size);
      await expect.poll(() => page.locator("textarea").evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
      await settle(page);
      expect(errors).toEqual([]);
    }
    await page.getByRole("button", { name: "Responsive disclosure", exact: true }).click();
    await settle(page);
    const initialHeight = (await page.locator("#resize-panel").boundingBox())!.height;
    expect(initialHeight).toBeGreaterThan(48);
    await page.getByRole("button", { name: "Change content" }).click();
    await settle(page);
    expect((await page.locator("#resize-panel").boundingBox())!.height).toBeGreaterThan(initialHeight);
    await page.getByRole("button", { name: "Responsive disclosure", exact: true }).click();
    await settle(page);
    expect((await page.locator("#resize-panel").boundingBox())!.height).toBe(48);
    expect(errors).toEqual([]);
  }
});

test("pending resize work is harmless across removal and remount", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/__tests/resize-lifecycle");
  await settle(page);
  for (let round = 0; round < 3; round++) {
    await page.evaluate(() => {
      document.querySelector<HTMLElement>("#resize-fixture")!.style.width = "30%";
      document.querySelector<HTMLButtonElement>("button")!.click();
    });
    await expect(page.locator("#resize-fixture")).toHaveCount(0);
    await settle(page);
    await page.getByRole("button", { name: "Toggle fixtures" }).click();
    await expect(page.locator("textarea")).toBeVisible();
    await settle(page);
  }
  expect(errors).toEqual([]);
});
