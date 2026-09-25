import { JSDOM } from "jsdom";
import { assert, test } from "../test-utils.mjs";
import { revealMenuItem } from "../../dist/_internal/primitives/menu/revealItem.js";

test("Menu reveal scrolls a nested viewport but never the menu's ancestors", () => {
  const dom = new JSDOM('<div id="outside"><div id="menu"><div id="viewport"><div id="item"></div></div></div></div>');
  const { document } = dom.window;
  const [outside, menu, viewport, item] = ["outside", "menu", "viewport", "item"].map(id => document.getElementById(id));
  for (const el of [outside, viewport]) {
    el.style.overflowY = "auto";
    Object.defineProperties(el, { clientHeight: { value: 100 }, scrollHeight: { value: 500 } });
    el.getBoundingClientRect = () => ({ top: 0, left: 0, right: 100, bottom: 100 });
  }
  item.getBoundingClientRect = () => ({ top: 150, bottom: 180, left: 0, right: 40 });
  revealMenuItem(item, menu);
  assert.equal(viewport.scrollTop, 80);
  assert.equal(outside.scrollTop, 0);
  revealMenuItem(outside, menu);
  assert.equal(outside.scrollTop, 0);
  item.getBoundingClientRect = () => ({ top: 10, bottom: 40, left: 0, right: 40 });
  revealMenuItem(item, menu);
  assert.equal(viewport.scrollTop, 80, "already visible items do not move");
  dom.window.close();
});
