import { expect, test, type Locator, type Page } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function makeScrollable(content: Locator) {
  await content.evaluate((element) => {
    const node = element as HTMLElement;
    node.style.height = "180px";
    node.style.overflowY = "auto";
    const filler = document.createElement("div");
    filler.style.height = "900px";
    filler.textContent = "Long modal content";
    node.prepend(filler);
  });
}

async function expectModalContainment(page: Page, content: Locator, background: Locator) {
  await expect(content).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await expect.poll(() => background.evaluate((element) => Boolean(element.closest("[inert]")))).toBe(true);
  expect(await content.evaluate((element) => Boolean(element.closest("[inert]")))).toBe(false);

  await makeScrollable(content);
  await content.hover();
  await page.mouse.wheel(0, 240);
  await expect.poll(() => content.evaluate((element) => (element as HTMLElement).scrollTop)).toBeGreaterThan(0);

  const pageScroll = await page.evaluate(() => window.scrollY);
  await content.evaluate((element) => {
    const node = element as HTMLElement;
    node.scrollTop = node.scrollHeight;
  });
  await page.mouse.wheel(0, 240);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);
}

test("modal scroll lock preserves sticky descendants at a nonzero page offset", async ({ page }) => {
  await openScenario(page, "Overlays", "Dialog");
  const trigger = page.locator("[data-playground-dialog-trigger]");
  const before = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>("#root");
    if (!root) throw new Error("Expected playground root");
    root.style.minHeight = `${Math.max(document.documentElement.scrollHeight, 1800)}px`;
    const probe = document.createElement("div");
    probe.dataset.testid = "sticky-scroll-lock-probe";
    Object.assign(probe.style, {
      height: "1px",
      position: "sticky",
      top: "0px",
    });
    root.prepend(probe);
    window.scrollTo(0, 400);
    return {
      scrollY: window.scrollY,
      y: probe.getBoundingClientRect().y,
    };
  });
  expect(before.scrollY).toBeGreaterThan(0);
  expect(before.y).toBe(0);

  await trigger.evaluate((element) => (element as HTMLElement).click());
  const content = page.locator("[data-playground-dialog-content]");
  await expect(content).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");

  const locked = await page.evaluate(() => {
    const probe = document.querySelector<HTMLElement>("[data-testid='sticky-scroll-lock-probe']");
    if (!probe) throw new Error("Expected sticky probe");
    return {
      scrollY: window.scrollY,
      y: probe.getBoundingClientRect().y,
    };
  });
  expect(locked).toEqual(before);

  await page.keyboard.press("Escape");
  await expect(content).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  expect(await page.evaluate(() => window.scrollY)).toBe(before.scrollY);
});

test("modal Dropdown Menu scrolls internally and restores background containment", async ({ page }) => {
  await openScenario(page, "Overlays", "Dropdown Menu");
  const background = page.getByRole("heading", { level: 1, name: "Dropdown Menu" });
  const trigger = page.locator("[data-playground-dropdown-menu-trigger]");
  await trigger.click();
  const menu = page.locator("[data-playground-menu-content]");
  await expectModalContainment(page, menu, background);

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  expect(await background.evaluate((element) => Boolean(element.closest("[inert]")))).toBe(false);
});

test("modal Popover isolates its background while long content remains scrollable", async ({ page }) => {
  await openScenario(page, "Overlays", "Popover");
  await page.getByRole("menuitem", { name: "State", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Modal", exact: true }).click();
  const background = page.getByRole("heading", { level: 1, name: "Popover" });
  await page.locator("[data-playground-popover-trigger]").click();
  const content = page.locator("[data-playground-popover-content]");
  await expectModalContainment(page, content, background);

  await page.keyboard.press("Escape");
  await expect(content).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  expect(await background.evaluate((element) => Boolean(element.closest("[inert]")))).toBe(false);
});
