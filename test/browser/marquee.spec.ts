import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/__tests/marquee"); });
const state = async (page: import("@playwright/test").Page, name: string) => JSON.parse(await page.getByLabel(`${name} state`, { exact: true }).innerText());
test("Marquee measures speed, inert copies and physical directions", async ({ page }) => {
  const root = page.getByRole("region", { name: "Continuous content", exact: true });
  await expect(root).toHaveAttribute("data-state", "playing");
  const before = await root.locator("[data-original]").evaluate(n => new DOMMatrix(getComputedStyle(n).transform).m41);
  await page.waitForTimeout(150);
  const after = await root.locator("[data-original]").evaluate(n => new DOMMatrix(getComputedStyle(n).transform).m41);
  expect(Math.abs(after - before)).toBeGreaterThan(10); expect(Math.abs(after - before)).toBeLessThan(35);
  await expect(root.locator("[data-replica]").first()).toHaveAttribute("inert", "");
  await expect(root.locator("[data-replica] a")).toHaveCount(0);
  for (const name of ["Right", "RTL", "Down", "Reverse"]) await expect(page.getByRole("region", { name: `${name} content`, exact: true })).toHaveAttribute("data-reversed", "");
  await expect(page.getByRole("region", { name: "Up content", exact: true })).not.toHaveAttribute("data-reversed");
  expect((await state(page, "Continuous")).copies).toBeLessThan(50);
});
test("Marquee manual hover focus and reduced-motion reasons do not override each other", async ({ page }) => {
  const root = page.getByRole("region", { name: "Continuous content", exact: true });
  await expect(root).toHaveAttribute("data-state", "playing");
  await page.getByRole("button", { name: "Pause Continuous", exact: true }).click();
  await root.hover(); await page.mouse.move(0, 0);
  expect((await state(page, "Continuous")).requested).toBe(true);
  await root.locator("[data-original] a").focus();
  await expect(root).toHaveAttribute("data-static", "");
  expect((await state(page, "Continuous")).reasons).toContain("focus");
  await expect(root.locator("[data-replica]")).toHaveCount(0);
  await page.getByRole("button", { name: "Resume Continuous", exact: true }).click();
  await expect(root).toHaveAttribute("data-state", "playing");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(root).toHaveAttribute("data-static", "");
  expect(await root.locator("[data-slot=marquee-viewport]").evaluate(n => getComputedStyle(n).overflow)).toBe("auto");
});
test("Marquee finite lifecycle counts once, ignores child animation, and restarts", async ({ page }) => {
  await expect.poll(async () => (await state(page, "Finite")).ends).toBe(1);
  expect((await state(page, "Finite")).loops).toBe(3);
  await page.getByRole("button", { name: "Restart Finite", exact: true }).click();
  await page.getByRole("region", { name: "Finite content", exact: true }).locator("[data-original] a").dispatchEvent("animationiteration", { bubbles: true });
  await expect.poll(async () => (await state(page, "Finite")).ends).toBe(2);
  expect((await state(page, "Finite")).loops).toBe(6);
});
test("Marquee static safety fallbacks and hidden measurement recovery", async ({ page }) => {
  const unsafe = page.getByRole("region", { name: "Unsafe content", exact: true });
  await expect(unsafe).toHaveAttribute("data-static", "");
  await expect(unsafe.locator("[data-replica]")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "No replicas content", exact: true })).toHaveAttribute("data-static", "");
  await page.getByRole("button", { name: "Visibility Hidden", exact: true }).click();
  await expect(page.getByRole("region", { name: "Hidden content", exact: true })).toHaveAttribute("data-state", "playing");
  await page.getByRole("button", { name: "Content Continuous", exact: true }).click();
  await expect.poll(async () => (await state(page, "Continuous")).distance).toBeGreaterThan(400);
});

test("Marquee resize updates coverage and explicit pause freezes motion", async ({ page }) => {
  const root = page.getByRole("region", { name: "Continuous content", exact: true });
  await expect(root).toHaveAttribute("data-state", "playing");
  await page.getByRole("button", { name: "Resize Continuous", exact: true }).click();
  await expect.poll(async () => (await state(page, "Continuous")).copies).toBe(2);
  await page.getByRole("button", { name: "Pause Continuous", exact: true }).click();
  const read = () => root.locator("[data-original]").evaluate(n => getComputedStyle(n).transform);
  await root.locator("[data-original]").evaluate(async n => { await Promise.all(n.getAnimations().map(animation => animation.ready)); await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); });
  const before = await read(); await page.waitForTimeout(150); expect(await read()).toBe(before);
});

test("Marquee adds synchronized coverage to a paused lane without waiting for a loop", async ({ page }) => {
  const root = page.getByRole("region", { name: "Continuous content", exact: true });
  await expect(root).toHaveAttribute("data-state", "playing");
  await page.getByRole("button", { name: "Pause Continuous", exact: true }).click();
  await root.evaluate(node => {
    const original = node.querySelector<HTMLElement>("[data-original]")!;
    original.getAnimations()[0].currentTime = 500;
    const distance = parseFloat((node as HTMLElement).style.getPropertyValue("--atom-marquee-distance"));
    const viewport = node.querySelector<HTMLElement>("[data-slot=marquee-viewport]")!;
    viewport.style.width = `${distance * 3.5}px`;
    viewport.style.maxWidth = "none";
  });
  await expect(root.locator("[data-replica]")).toHaveCount(4);
  const times = await root.locator("[data-replica]").evaluateAll(nodes => nodes.map(n => Number(n.getAnimations()[0].currentTime)));
  for (const time of times) expect(time).toBeCloseTo(500, 0);
});

test("Marquee reduced-motion initial load never leaves hidden original links", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.reload();
  const root = page.getByRole("region", { name: "Continuous content", exact: true });
  await expect(root).toHaveAttribute("data-static", "");
  await expect(root.locator("[data-replica]")).toHaveCount(0);
  await expect(root.getByRole("link", { name: "First story" })).toBeVisible();
  const viewport = root.locator("[data-slot=marquee-viewport]");
  await expect(viewport).toHaveAttribute("tabindex", "0");
  await viewport.focus();
  await expect(viewport).toBeFocused();
  expect((await state(page, "Continuous")).loops).toBe(0);
});

test("Marquee keeps running replicas synchronized during expansion", async ({ page }) => {
  const root = page.getByRole("region", { name: "Continuous content", exact: true });
  await expect(root).toHaveAttribute("data-state", "playing");
  await root.evaluate(node => {
    const distance = parseFloat((node as HTMLElement).style.getPropertyValue("--atom-marquee-distance"));
    const viewport = node.querySelector<HTMLElement>("[data-slot=marquee-viewport]")!;
    viewport.style.width = `${distance * 3.5}px`;
    viewport.style.maxWidth = "none";
  });
  await expect(root.locator("[data-replica]")).toHaveCount(4);
  await expect.poll(() => root.evaluate(node => {
    const original = node.querySelector("[data-original]")!.getAnimations()[0];
    return Array.from(node.querySelectorAll("[data-replica]"), copy =>
      Math.abs(Number(copy.getAnimations()[0].currentTime) - Number(original.currentTime)),
    ).every(delta => delta < 2);
  })).toBe(true);
  await expect(root).toHaveAttribute("data-state", "playing");
});

test("Marquee falls back to usable originals without animation inspection", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(Element.prototype, "getAnimations", { value: undefined, configurable: true }));
  await page.reload();
  const root = page.getByRole("region", { name: "Continuous content", exact: true });
  await expect(root).toHaveAttribute("data-static", "");
  await expect(root.locator("[data-replica]")).toHaveCount(0);
  await expect(root.getByRole("link", { name: "First story" })).toBeVisible();
});

test("Marquee originals remain usable when animation CSS is disabled", async ({ page }) => {
  await page.addStyleTag({ content: "[data-original], [data-replica] { animation: none !important; }" });
  const root = page.getByRole("region", { name: "Continuous content", exact: true });
  const link = root.getByRole("link", { name: "First story" });
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toBeVisible();
  await expect(root).toHaveAttribute("data-static", "");
  await expect(root.locator("[data-replica]")).toHaveCount(0);
});
