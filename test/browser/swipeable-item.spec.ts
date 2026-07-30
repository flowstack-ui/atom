import { expect, test } from "@playwright/test";

async function openSwipeableItem(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("menuitem", { name: "Controls", exact: true }).click();
  await page.getByRole("menuitem", { name: "Swipeable Item", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Swipeable Item" })).toBeVisible();
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
