import { expect, test } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function openSwipeableItem(page: import("@playwright/test").Page) {
  await openScenario(page, "Controls", "Swipeable Item");
  return {
    root: page.locator("[data-playground-swipeable-root]"),
    content: page.locator("[data-playground-swipeable-content]"),
    start: page.locator("[data-playground-swipeable-actions-start]"),
    end: page.locator("[data-playground-swipeable-actions-end]"),
  };
}

test("pointer reveal settles, cancels, and preserves vertical pan policy", async ({ page }) => {
  const item = await openSwipeableItem(page);
  await expect(item.content).toHaveCSS("touch-action", "pan-y");
  const box = await item.content.boundingBox();
  if (!box) throw new Error("Swipeable Item content has no browser geometry");

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 72, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(item.root).toHaveAttribute("data-state", "open");
  await expect(item.root).toHaveAttribute("data-side", "end");
  await expect(item.end).not.toHaveAttribute("aria-hidden", "true");
  await expect(item.start).toHaveAttribute("aria-hidden", "true");

  await item.content.press("Escape");
  await expect(item.root).toHaveAttribute("data-state", "closed");
  await item.content.dispatchEvent("pointerdown", { pointerId: 41, pointerType: "touch", button: 0, clientX: 180, clientY: 60 });
  await item.content.dispatchEvent("pointermove", { pointerId: 41, pointerType: "touch", button: 0, clientX: 110, clientY: 62 });
  await item.content.dispatchEvent("pointercancel", { pointerId: 41, pointerType: "touch", button: 0, clientX: 110, clientY: 62 });
  await expect(item.root).toHaveAttribute("data-state", "closed");
  await expect(item.root).not.toHaveAttribute("data-dragging");
});

test("keyboard reveal ignores descendants and action activation closes", async ({ page }) => {
  const item = await openSwipeableItem(page);
  await item.content.focus();
  await item.content.press("ArrowLeft");
  await expect(item.root).toHaveAttribute("data-side", "end");
  await item.end.getByRole("button", { name: "Delete" }).click();
  await expect(item.root).toHaveAttribute("data-state", "closed");

  await item.content.evaluate((element) => {
    const input = document.createElement("input");
    input.setAttribute("aria-label", "Nested value");
    element.append(input);
  });
  const input = item.content.getByRole("textbox", { name: "Nested value" });
  await input.focus();
  await input.press("ArrowLeft");
  await expect(item.root).toHaveAttribute("data-state", "closed");
  await item.content.press("ArrowLeft");
  await input.press("Escape");
  await expect(item.root).toHaveAttribute("data-side", "end");
});

test("logical keyboard direction mirrors in RTL and disabled state blocks", async ({ page }) => {
  const item = await openSwipeableItem(page);
  await page.getByRole("menuitem", { name: "Layout", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Rtl", exact: true }).click();
  await item.content.focus();
  await item.content.press("ArrowRight");
  await expect(item.root).toHaveAttribute("data-side", "end");
  await item.content.press("Escape");

  await page.getByRole("menuitem", { name: "State", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Disabled", exact: true }).click();
  await item.content.press("ArrowRight");
  await expect(item.root).toHaveAttribute("data-state", "closed");
  await expect(item.content).toHaveAttribute("aria-disabled", "true");
});

test("settling can be re-grabbed from the presented position without jumping to its target", async ({ page }) => {
  const item = await openSwipeableItem(page);
  await item.content.evaluate((element) => { element.style.transitionDuration = "1s"; });
  await item.content.press("ArrowLeft");
  await expect(item.root).toHaveAttribute("data-settling");
  const sample = await item.content.evaluate(async (element) => {
    const offset = () => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const before = offset();
    const rect = element.getBoundingClientRect();
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 42, button: 0, clientX: rect.x + 140, clientY: rect.y + 40 }));
    element.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, cancelable: true, pointerId: 42, clientX: rect.x + 150, clientY: rect.y + 40 }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    return { before, after: offset(), transition: getComputedStyle(element).transitionProperty };
  });
  expect(Math.abs(sample.after - sample.before - 10)).toBeLessThan(3);
  expect(sample.transition).toBe("none");
  await item.content.dispatchEvent("pointercancel", { pointerId: 42 });
  await expect(item.root).not.toHaveAttribute("data-dragging");
});

test("open action resizing retargets and reduced motion ends active settlement", async ({ page }) => {
  const item = await openSwipeableItem(page);
  await item.content.evaluate(element => { element.style.transitionDuration = '1s'; });
  await item.content.press('ArrowLeft');
  await expect(item.root).toHaveAttribute('data-settling');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(item.root).not.toHaveAttribute('data-settling');
  const current = () => item.content.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41);
  const initialWidth = (await item.end.boundingBox())!.width;
  expect(Math.abs(await current() + initialWidth)).toBeLessThan(1);
  await item.end.evaluate(element => { element.style.width = '180px'; });
  await expect.poll(current).toBeCloseTo(-180, 0);
  await item.content.press('Escape');
  await expect.poll(current).toBeCloseTo(0, 0);
});
