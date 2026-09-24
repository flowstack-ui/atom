import { expect, test, type Page } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function openReorder(page: Page) {
  await openScenario(page, "Controls", "Reorder");
  return {
    root: page.locator("[data-playground-reorder-root]"),
    items: page.locator("[data-playground-reorder-item]"),
    announcer: page.locator("[data-slot='drag-drop-announcer']"),
  };
}

async function order(page: Page) {
  return page.locator("[data-playground-reorder-item]").evaluateAll((items) =>
    items.map((item) => item.getAttribute("data-value")),
  );
}

test("direct movement controls update controlled order and preserve focus", async ({ page }) => {
  const scenario = await openReorder(page);
  const later = page.getByRole("button", { name: "Move Request approval later" });
  await later.focus();
  await later.press("Enter");
  await expect.poll(() => order(page)).toEqual(["verify", "deploy", "approve", "notify"]);
  await expect(later).toBeFocused();

  await expect(page.getByRole("button", { name: "Move Verify production earlier", exact: true })).toBeDisabled();
  await expect.poll(() => order(page)).toEqual(["verify", "deploy", "approve", "notify"]);
});

test("keyboard movement commits, reverses, and cancels without losing keyed focus", async ({ page }) => {
  const scenario = await openReorder(page);
  const handle = page.getByRole("button", { name: "Move Request approval", exact: true });
  await handle.focus();
  await handle.press("Space");
  await expect(scenario.items.filter({ has: handle })).toHaveAttribute("data-dragging", "");
  await handle.press("ArrowDown");
  await expect(scenario.announcer).toHaveText("Request approval will move to position 3 of 4.");
  await handle.press("ArrowUp");
  await expect(scenario.announcer).toHaveText("Request approval will move to position 2 of 4.");
  await handle.press("Space");
  await expect.poll(() => order(page)).toEqual(["verify", "approve", "deploy", "notify"]);
  await expect(handle).toBeFocused();

  await handle.press("Space");
  await handle.press("End");
  await handle.press("Escape");
  await expect.poll(() => order(page)).toEqual(["verify", "approve", "deploy", "notify"]);
  await expect(scenario.announcer).toHaveText("Request approval movement cancelled.");

  await handle.press("Space");
  await handle.press("End");
  await handle.press("Enter");
  await expect.poll(() => order(page)).toEqual(["verify", "deploy", "notify", "approve"]);
  await expect(handle).toBeFocused();
});

test("mouse drag commits on valid release and cancels outside all targets", async ({ page }) => {
  await openReorder(page);
  const verifyHandle = page.getByRole("button", { name: "Move Verify production", exact: true });
  const deployItem = page.locator("[data-playground-reorder-item='deploy']");
  const handleBox = await verifyHandle.boundingBox();
  const targetBox = await deployItem.boundingBox();
  if (!handleBox || !targetBox) throw new Error("Reorder scenario has no browser geometry");

  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height * 0.75, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => order(page)).toEqual(["approve", "deploy", "verify", "notify"]);

  const movedBox = await verifyHandle.boundingBox();
  if (!movedBox) throw new Error("Moved handle has no browser geometry");
  await page.mouse.move(movedBox.x + movedBox.width / 2, movedBox.y + movedBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(2, 2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => order(page)).toEqual(["approve", "deploy", "verify", "notify"]);
});

test("horizontal keyboard movement mirrors in RTL and unavailable states block controls", async ({ page }) => {
  const scenario = await openReorder(page);
  await page.getByRole("menuitem", { name: "Layout", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Horizontal", exact: true }).click();
  await expect(scenario.root).toHaveAttribute("data-orientation", "horizontal");
  await page.keyboard.press("Escape");
  await page.getByRole("menuitem", { name: "Layout", exact: true }).click();
  const rtl = page.getByRole("menuitemradio", { name: "Rtl", exact: true });
  await expect(rtl).toBeVisible();
  await rtl.click();
  await expect(page.locator(".playground-reorder-stage")).toHaveAttribute("dir", "rtl");

  const handle = page.getByRole("button", { name: "Move Request approval", exact: true });
  await handle.focus();
  await handle.press("Space");
  await handle.press("ArrowLeft");
  await handle.press("Space");
  await expect.poll(() => order(page)).toEqual(["verify", "deploy", "approve", "notify"]);

  await page.keyboard.press("Escape");
  await page.getByRole("menuitem", { name: "State", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Read only", exact: true }).click();
  await expect(page.getByRole("button", { name: "Move Verify production", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Move Verify production later" })).toBeDisabled();
});

test("grid moves through both axes without changing DOM until commit", async ({ page }) => {
  const scenario = await openReorder(page);
  await page.getByRole("menuitem", { name: "Layout", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Grid", exact: true }).click();
  await page.keyboard.press("Escape");
  const handle = page.getByRole("button", { name: "Move Verify production", exact: true });
  await handle.focus();
  await handle.press("Space");
  await handle.press("ArrowDown");
  await expect(scenario.announcer).toHaveText("Verify production will move to position 3 of 4.");
  await expect.poll(() => order(page)).toEqual(["verify", "approve", "deploy", "notify"]);
  await expect.poll(() => scenario.items.nth(2).evaluate(node => parseFloat((node as HTMLElement).style.getPropertyValue("--atom-reorder-y")))).not.toBe(0);
  await expect(handle).toBeFocused();
  await handle.press("Enter");
  await expect.poll(() => order(page)).toEqual(["approve", "deploy", "verify", "notify"]);
  await expect(handle).toBeFocused();
});

test("wrapping unequal widths project actual positions and restore CSS order", async ({ page }) => {
  const scenario = await openReorder(page);
  await page.getByRole("menuitem", { name: "Layout", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Grid", exact: true }).click();
  await page.keyboard.press("Escape");
  await scenario.root.evaluate(root => {
    Object.assign((root as HTMLElement).style, { display: "flex", alignItems: "flex-start", flexWrap: "wrap", width: "700px" });
    [...root.children].forEach((node, index) => { if (node instanceof HTMLElement) Object.assign(node.style, { width: [260, 380, 310, 240][index] + "px", boxSizing: "border-box", flexShrink: "0" }); });
  });
  const handle = page.getByRole("button", { name: "Move Verify production", exact: true });
  await handle.focus();
  await handle.press("Space");
  await handle.press("End");
  const projected = await scenario.items.evaluateAll(nodes => nodes.map(node => {
    const element = node as HTMLElement;
    return { value: element.dataset.value, x: element.offsetLeft + parseFloat(element.style.getPropertyValue("--atom-reorder-x")), y: element.offsetTop + parseFloat(element.style.getPropertyValue("--atom-reorder-y")), order: element.style.order };
  }));
  expect(projected.every(entry => entry.order === "")).toBe(true);
  await handle.press("Enter");
  const actual = await scenario.items.evaluateAll(nodes => nodes.map(node => ({ value: (node as HTMLElement).dataset.value, x: (node as HTMLElement).offsetLeft, y: (node as HTMLElement).offsetTop })));
  for (const entry of projected.filter(entry => entry.value !== "verify")) {
    expect(actual.find(value => value.value === entry.value)).toMatchObject({ x: entry.x, y: entry.y });
  }
  await expect(handle).toBeFocused();
});
