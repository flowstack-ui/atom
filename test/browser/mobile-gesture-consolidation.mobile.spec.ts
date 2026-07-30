import { expect, test, type Locator } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function dispatchTouch(target: Locator, type: string, x: number, y: number) {
  await target.evaluate((element, details) => {
    const touch = { identifier: 1, target: element, clientX: details.x, clientY: details.y };
    const touches = Object.assign(details.type === "touchend" || details.type === "touchcancel" ? [] : [touch], {
      item: (index: number) => index === 0 && details.type !== "touchend" && details.type !== "touchcancel" ? touch : null,
    });
    const changedTouches = Object.assign([touch], {
      item: (index: number) => index === 0 ? touch : null,
    });
    const event = new Event(details.type, { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      changedTouches: { value: changedTouches },
      touches: { value: touches },
    });
    element.dispatchEvent(event);
  }, { type, x, y });
}

test("Tooltip long press opens once while movement cancels an abandoned gesture", async ({ page }) => {
  await openScenario(page, "Overlays", "Tooltip");
  const trigger = page.locator("[data-playground-tooltip-trigger]");
  const tooltip = page.locator("[data-playground-tooltip-content]");
  const box = await trigger.boundingBox();
  if (!box) throw new Error("Tooltip trigger has no browser geometry");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await dispatchTouch(trigger, "touchstart", x, y);
  await page.waitForTimeout(750);
  await expect(tooltip).toBeVisible();
  await dispatchTouch(trigger, "touchend", x, y);
  await expect(tooltip).toBeHidden({ timeout: 3500 });

  await dispatchTouch(trigger, "touchstart", x, y);
  await dispatchTouch(trigger, "touchmove", x + 24, y);
  await page.waitForTimeout(750);
  await expect(tooltip).toBeHidden();
});

test("Context Menu long press opens while movement cancels the pending fallback", async ({ page }) => {
  await openScenario(page, "Overlays", "Context Menu");
  const trigger = page.locator("[data-playground-context-menu-trigger]");
  const menu = page.locator("[data-playground-menu-content]");
  const box = await trigger.locator(":scope > *").first().boundingBox();
  if (!box) throw new Error("Context Menu trigger has no browser geometry");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await trigger.dispatchEvent("pointerdown", { pointerId: 31, pointerType: "touch", isPrimary: true, button: 0, clientX: x, clientY: y });
  await expect(trigger).toHaveAttribute("data-pressed", "");
  await page.waitForTimeout(750);
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");

  await trigger.dispatchEvent("pointerdown", { pointerId: 32, pointerType: "touch", isPrimary: true, button: 0, clientX: x, clientY: y });
  await trigger.dispatchEvent("pointermove", { pointerId: 32, pointerType: "touch", isPrimary: true, button: 0, clientX: x + 24, clientY: y });
  await page.waitForTimeout(750);
  await expect(menu).toBeHidden();
  await expect(trigger).not.toHaveAttribute("data-pressed");
});

test("Slider touch policy and cancellation preserve the pre-gesture value", async ({ page }) => {
  await openScenario(page, "Controls", "Slider");
  const track = page.locator("[data-slot='slider-track']");
  const thumb = page.getByRole("slider");
  await expect(track).toHaveCSS("touch-action", "pan-y");
  const initial = await thumb.getAttribute("aria-valuenow");
  const box = await track.boundingBox();
  if (!box) throw new Error("Slider track has no browser geometry");
  await track.evaluate((element) => {
    element.setPointerCapture = () => undefined;
    element.releasePointerCapture = () => undefined;
  });

  await track.dispatchEvent("pointerdown", { pointerId: 41, pointerType: "touch", isPrimary: true, button: 0, clientX: box.x + box.width * 0.8, clientY: box.y + box.height / 2 });
  await expect(thumb).not.toHaveAttribute("aria-valuenow", initial ?? "");
  await track.dispatchEvent("pointercancel", { pointerId: 41, pointerType: "touch", isPrimary: true, button: 0, clientX: box.x + box.width * 0.8, clientY: box.y + box.height / 2 });
  await expect(thumb).toHaveAttribute("aria-valuenow", initial ?? "40");
});

test("Rating drag and cancellation preserve touch scrolling and the pre-gesture value", async ({ page }) => {
  await openScenario(page, "Controls", "Rating");
  const rating = page.getByRole("slider", { name: "Rating" });
  const item = page.locator("[data-slot='rating-item'][data-value='5']");
  await expect(item).toHaveCSS("touch-action", "pan-y");
  const initial = await rating.getAttribute("aria-valuenow");
  const box = await item.boundingBox();
  if (!box) throw new Error("Rating item has no browser geometry");
  await item.evaluate((element) => {
    element.setPointerCapture = () => undefined;
    element.releasePointerCapture = () => undefined;
  });

  await item.dispatchEvent("pointerdown", { pointerId: 51, pointerType: "touch", isPrimary: true, buttons: 1, button: 0, clientX: box.x + box.width - 1, clientY: box.y + box.height / 2 });
  await expect(rating).toHaveAttribute("aria-valuenow", "5");
  await item.dispatchEvent("pointercancel", { pointerId: 51, pointerType: "touch", isPrimary: true, buttons: 0, button: 0, clientX: box.x + box.width - 1, clientY: box.y + box.height / 2 });
  await expect(rating).toHaveAttribute("aria-valuenow", initial ?? "3");
});

test("Swipeable Item preserves vertical scrolling and clears a cancelled touch reveal", async ({ page }) => {
  await openScenario(page, "Controls", "Swipeable Item");
  const root = page.locator("[data-playground-swipeable-root]");
  const content = page.locator("[data-playground-swipeable-content]");
  await expect(content).toHaveCSS("touch-action", "pan-y");
  const box = await content.boundingBox();
  if (!box) throw new Error("Swipeable Item content has no browser geometry");
  const startX = box.x + box.width * 0.75;
  const y = box.y + box.height / 2;

  await content.dispatchEvent("pointerdown", { pointerId: 61, pointerType: "touch", isPrimary: true, button: 0, clientX: startX, clientY: y });
  await content.dispatchEvent("pointermove", { pointerId: 61, pointerType: "touch", isPrimary: true, button: 0, clientX: startX - 72, clientY: y + 2 });
  await content.dispatchEvent("pointercancel", { pointerId: 61, pointerType: "touch", isPrimary: true, button: 0, clientX: startX - 72, clientY: y + 2 });
  await expect(root).toHaveAttribute("data-state", "closed");
  await expect(root).not.toHaveAttribute("data-dragging");

  await content.focus();
  await content.press("ArrowLeft");
  await expect(root).toHaveAttribute("data-state", "open");
  await content.press("Escape");
  await expect(root).toHaveAttribute("data-state", "closed");
});
