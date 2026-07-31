import { expect, test } from "@playwright/test";
import { openScenario } from "./helpers/playground.js";

test("Accordion measures entering content before its first animation frame", async ({ page }) => {
  await openScenario(page, "Navigation", "Accordion");

  const initiallyOpenContent = page.locator("[data-slot='accordion-content'][data-state='open']");
  await expect(initiallyOpenContent).toHaveAttribute("data-initial-open", "");

  const result = await page.getByRole("button", { name: /How does state behave/ }).evaluate(async (trigger) => {
    trigger.click();
    const frameHeights: number[] = [];
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const content = trigger.closest("[data-slot='accordion-item']")?.querySelector<HTMLElement>("[data-slot='accordion-content']");
    const firstFrameHeight = content?.style.getPropertyValue("--content-height") ?? "";

    await new Promise<void>((resolve) => {
      const startedAt = performance.now();
      const sample = () => {
        if (content) frameHeights.push(content.getBoundingClientRect().height);
        if (performance.now() - startedAt >= 240) {
          resolve();
          return;
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    return { firstFrameHeight, frameHeights };
  });

  expect(result.firstFrameHeight).toMatch(/^\d+(?:\.\d+)?px$/);
  await expect(page.getByRole("button", { name: /How does state behave/ })
    .locator("xpath=ancestor::*[@data-slot='accordion-item']")
    .locator("[data-slot='accordion-content']"))
    .not.toHaveAttribute("data-initial-open", "");
  expect(result.frameHeights.at(-1)).toBeGreaterThan(0);
  for (let index = 1; index < result.frameHeights.length; index += 1) {
    expect(result.frameHeights[index] + 1).toBeGreaterThanOrEqual(result.frameHeights[index - 1]);
  }
});

test("Collapsible measures entering content during the opening commit", async ({ page }) => {
  await openScenario(page, "Navigation", "Collapsible");

  const firstFrameHeight = await page.locator("[data-playground-collapsible-trigger]").evaluate(async (trigger) => {
    trigger.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const content = trigger.parentElement?.querySelector<HTMLElement>("[data-slot='collapsible-content']");
    return content?.style.getPropertyValue("--content-height") ?? "";
  });

  expect(firstFrameHeight).toMatch(/^\d+(?:\.\d+)?px$/);
  await expect(page.locator("[data-slot='collapsible-content']"))
    .not.toHaveAttribute("data-initial-open", "");
});
