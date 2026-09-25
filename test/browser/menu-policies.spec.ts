import { expect, test } from "@playwright/test";

test("Menubar repositions when reopening retained exit content after adjacent handoff", async ({ page }) => {
  await page.goto("/__tests/menu-policies?owner=Menubar");
  // Consumer-authored exit motion keeps the same floating host mounted.
  await page.addStyleTag({ content: `
    @keyframes menu-exit { from { opacity: 1 } to { opacity: 0 } }
    [data-slot="menu-content"][data-state="closed"] { animation: menu-exit 5s linear; }
  ` });
  const bar = page.getByRole("menubar", { name: "Policy commands" });
  const file = bar.getByRole("menuitem", { name: "File", exact: true });
  const edit = bar.getByRole("menuitem", { name: "Edit", exact: true });
  const undo = page.getByRole("menuitem", { name: "Undo", exact: true });
  await file.click();
  await expect(page.getByRole("menu", { name: "Menubar policies" })).toBeVisible();
  await edit.hover();
  await expect(undo).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(edit).toBeFocused();
  await expect(edit).toHaveAttribute("aria-expanded", "false");
  await page.mouse.move(0, 0);
  await edit.click();
  await expect(edit).toHaveAttribute("aria-expanded", "true");
  await expect(undo).toBeVisible();
  await expect(undo.locator("..")).toHaveAttribute("data-positioned", "");
});

test("submenu repositions and restores keyboard entry during interrupted exit", async ({ page }) => {
  await page.goto("/__tests/menu-policies?owner=Menu");
  await page.addStyleTag({ content: `
    @keyframes submenu-exit { from { opacity: 1 } to { opacity: 0 } }
    [data-slot="menu-sub-content"][data-state="closed"] { animation: submenu-exit 5s linear; }
  ` });
  await page.getByRole("button", { name: "Controller open", exact: true }).click();
  const more = page.getByRole("menuitem", { name: "More", exact: true });
  const nested = page.getByRole("menuitem", { name: "Nested action", exact: true });
  await more.focus();
  await more.press("ArrowRight");
  await expect(nested).toBeFocused();
  await nested.press("Escape");
  await expect(more).toBeFocused();
  await more.press("ArrowRight");
  await expect(nested).toBeVisible();
  await expect(nested).toBeFocused();
});

for (const owner of ["Menu", "DropdownMenu", "ContextMenu", "Menubar"]) {
  test(`${owner} policy workbench exposes controller, selection and retained lifecycle`, async ({ page }) => {
    await page.goto(`/__tests/menu-policies?owner=${owner}`);
    await page.getByLabel("Retain content", { exact: true }).check();
    await page.getByLabel("Reject selection", { exact: true }).check();
    await page.getByRole("button", { name: "Controller open", exact: true }).click();
    const content = page.getByRole("menu", { name: `${owner} policies`, exact: true });
    await expect(content).toBeVisible();
    const choice = content.getByRole("menuitemcheckbox", { name: "Notifications" });
    await choice.click();
    await expect(choice).toHaveAttribute("aria-checked", "false");
    await expect(page.getByLabel("Event log")).toContainText("item:notify | root:notify");
    await page.keyboard.press("Escape");
    await expect(content).toBeHidden();
    await page.getByLabel("Reject selection", { exact: true }).uncheck();
    await page.getByRole("button", { name: "Controller open", exact: true }).click();
    await choice.click();
    await expect(choice).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Controller open", exact: true }).click();
    await expect(choice).toHaveAttribute("aria-checked", "true");
  });
}

test("Dropdown policy controls keep controlled highlight and invoking trigger identity", async ({ page }) => {
  await page.goto("/__tests/menu-policies?owner=DropdownMenu");
  await page.getByLabel("Controlled highlight", { exact: true }).check();
  await page.getByLabel("Reject highlight", { exact: true }).check();
  await page.getByRole("button", { name: "Second actions" }).click();
  const content=page.getByRole("menu", { name: "DropdownMenu policies" });
  await content.press("ArrowDown");
  await expect(page.getByTestId("controller-state")).toContainText('"highlight":"beta"');
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Second actions" })).toBeFocused();
});

test("Navigation policy workbench supports inline retained content and controller", async ({ page }) => {
  await page.goto("/__tests/menu-policies?owner=NavigationMenu");
  await page.getByLabel("Shared viewport", { exact: true }).uncheck();
  await page.getByLabel("Retain content", { exact: true }).check();
  await page.getByRole("button", { name: "Controller open", exact: true }).click();
  const draft=page.getByLabel("Retained draft", { exact: true });
  await draft.fill("Saved draft");
  await page.keyboard.press("Escape");
  await expect(draft).toBeHidden();
  await page.getByRole("button", { name: "Controller open", exact: true }).click();
  await expect(draft).toHaveValue("Saved draft");
  await expect(page.getByTestId("controller-state")).toHaveText("learn");
});

test("policy workbench is usable inside iframe and ShadowRoot", async ({ page }) => {
  await page.goto("/__tests/menu-policies?owner=NavigationMenu");
  await page.getByLabel("Iframe qualification", { exact: true }).check();
  const frame = page.frameLocator('iframe[title="Menu policy iframe"]');
  await frame.getByRole("button", { name: "Controller open", exact: true }).click();
  await expect(frame.getByRole("link", { name: "Guide", exact: true })).toBeVisible();
  await frame.getByRole("button", { name: "Controller close", exact: true }).click();
  await expect(frame.getByRole("link", { name: "Guide", exact: true })).toBeHidden();
  await page.getByLabel("ShadowRoot qualification", { exact: true }).check();
  const shadow = page.locator('section').filter({ has: page.getByLabel("ShadowRoot qualification", { exact: true }) });
  await shadow.getByRole("button", { name: "Controller open", exact: true }).click();
  await expect(shadow.getByRole("link", { name: "Guide", exact: true })).toBeVisible();
  await shadow.getByRole("button", { name: "Controller close", exact: true }).click();
  await expect(shadow.getByRole("link", { name: "Guide", exact: true })).toBeHidden();
});
