import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "../../dist/index.js";

test("Accordion primitives render linked trigger and panel", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AccordionRoot,
      { defaultValue: "shipping", className: "accordion-class" },
      React.createElement(
        AccordionItem,
        { value: "shipping", className: "item-class" },
        React.createElement(
          AccordionHeader,
          { as: "h4", className: "header-class", style: { color: "red" } },
          React.createElement(AccordionTrigger, { className: "trigger-class" }, "Shipping"),
        ),
        React.createElement(AccordionContent, { className: "content-class" }, "Ships tomorrow"),
      ),
    ),
  );

  assert.match(html, /data-slot="accordion-root"/);
  assert.match(html, /class="accordion-class"/);
  assert.match(html, /data-slot="accordion-item"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /class="item-class"/);
  assert.match(html, /<h4/);
  assert.match(html, /data-slot="accordion-header"/);
  assert.match(html, /class="header-class"/);
  assert.match(html, /style="color:red"/);
  assert.match(html, /data-slot="accordion-trigger"/);
  assert.doesNotMatch(html, /<button[^>]*role="button"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-controls="[^"]+-content"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /class="trigger-class"/);
  assert.match(html, /data-slot="accordion-content"/);
  assert.match(html, /role="region"/);
  assert.match(html, /aria-labelledby="[^"]+-trigger"/);
  assert.match(html, /class="content-class"/);
  assert.doesNotMatch(html, /animation:none/);
  assert.doesNotMatch(html, /height:auto/);
  assert.match(html, /Ships tomorrow/);
});

test("AccordionTrigger asChild exposes button semantics", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AccordionRoot,
      { defaultValue: "shipping" },
      React.createElement(
        AccordionItem,
        { value: "shipping" },
        React.createElement(
          AccordionHeader,
          null,
          React.createElement(
            AccordionTrigger,
            { asChild: true },
            React.createElement("div", { "data-testid": "accordion-trigger" }, "Shipping"),
          ),
        ),
        React.createElement(AccordionContent, null, "Ships tomorrow"),
      ),
    ),
  );

  assert.match(html, /<div[^>]*data-testid="accordion-trigger"/);
  assert.match(html, /role="button"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /tabindex="0"/);
});

test("AccordionRoot multiple mode accepts array values", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AccordionRoot,
      { type: "multiple", defaultValue: ["shipping", "billing"] },
      React.createElement(
        AccordionItem,
        { value: "shipping" },
        React.createElement(
          AccordionHeader,
          null,
          React.createElement(AccordionTrigger, null, "Shipping"),
        ),
        React.createElement(AccordionContent, null, "Shipping content"),
      ),
      React.createElement(
        AccordionItem,
        { value: "billing" },
        React.createElement(
          AccordionHeader,
          null,
          React.createElement(AccordionTrigger, null, "Billing"),
        ),
        React.createElement(AccordionContent, null, "Billing content"),
      ),
    ),
  );

  assert.equal(html.match(/aria-expanded="true"/g)?.length, 2);
  assert.match(html, /Shipping content/);
  assert.match(html, /Billing content/);
});

test("AccordionContent keepMounted renders closed content as hidden", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AccordionRoot,
      null,
      React.createElement(
        AccordionItem,
        { value: "shipping" },
        React.createElement(
          AccordionHeader,
          null,
          React.createElement(AccordionTrigger, null, "Shipping"),
        ),
        React.createElement(AccordionContent, { keepMounted: true }, "Shipping content"),
      ),
    ),
  );

  assert.match(html, /data-slot="accordion-content"/);
  assert.match(html, /hidden=""/);
});

test("AccordionRoot source uses Collection for trigger keyboard navigation", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/accordion/AccordionRoot.tsx", packageRoot),
    "utf8",
  );
  const triggerSource = await readFile(
    new URL("src/primitives/accordion/AccordionTrigger.tsx", packageRoot),
    "utf8",
  );
  const itemSource = await readFile(
    new URL("src/primitives/accordion/AccordionItem.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useCollection<string, HTMLButtonElement>\(\)/);
  assert.match(rootSource, /registerCollectionTrigger\(itemValue, element, \{ disabled: triggerDisabled \}\)/);
  assert.match(rootSource, /getNextCollectionTrigger\(itemValue, direction\)\?\.value \?\? null/);
  assert.match(triggerSource, /group\.registerTrigger\(item\.value, element, item\.disabled\)/);
  assert.match(triggerSource, /group\.getNextTriggerValue\(item\.value, "next"\)/);
  assert.doesNotMatch(rootSource, /triggerRefs/);
  assert.doesNotMatch(rootSource, /itemValues/);
  assert.doesNotMatch(rootSource, /disabledItems/);
  assert.doesNotMatch(itemSource, /registerDisabledItem/);
});
