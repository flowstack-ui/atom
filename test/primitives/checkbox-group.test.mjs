import { JSDOM } from "jsdom";
import { createRoot, hydrateRoot } from "react-dom/client";
import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Checkbox,
  CheckboxGroup,
  CheckboxGroupItem,
  CheckboxGroupItemDescription,
  CheckboxGroupItemLabel,
  CheckboxGroupParent,
  CheckboxGroupRoot,
  markCheckboxGroupItemPart,
  useCheckboxGroupContext,
} from "../../dist/index.js";

function installDom() {
  const dom = new JSDOM(
    "<!doctype html><html><body><div id=\"root\"></div></body></html>",
    { pretendToBeVisual: true, url: "https://example.test/" },
  );
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    HTMLElement: globalThis.HTMLElement,
    Element: globalThis.Element,
    Node: globalThis.Node,
    Event: globalThis.Event,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return {
    container: dom.window.document.getElementById("root"),
    cleanup() {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
      dom.window.close();
    },
  };
}

async function click(element) {
  await React.act(async () => {
    element.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  });
}

test("CheckboxGroupRoot renders group attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroupRoot,
      {
        value: ["cheese"],
        required: true,
        invalid: true,
        readOnly: true,
        orientation: "horizontal",
        "aria-label": "Toppings",
        id: "toppings",
        className: "group-class",
      },
      React.createElement("span", null, "Cheese"),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Toppings"/);
  assert.doesNotMatch(html, /aria-orientation=/);
  assert.doesNotMatch(html.split(">")[0], /aria-required=/);
  assert.match(html, /data-required=""/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /id="toppings"/);
  assert.match(html, /data-slot="checkbox-group"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /class="group-class"/);
});

test("CheckboxGroup namespace exposes its complete public anatomy", () => {
  assert.equal(CheckboxGroup.Root, CheckboxGroupRoot);
  assert.equal(CheckboxGroup.Item, CheckboxGroupItem);
  assert.equal(CheckboxGroup.ItemLabel, CheckboxGroupItemLabel);
  assert.equal(CheckboxGroup.ItemDescription, CheckboxGroupItemDescription);
  assert.equal(CheckboxGroup.Parent, CheckboxGroupParent);
});

test("CheckboxGroupParent renders deterministic unchecked mixed and checked state", () => {
  for (const [value, expected] of [
    [[], "false"],
    [["email"], "mixed"],
    [["email", "push"], "true"],
  ]) {
    const html = renderToStaticMarkup(
      React.createElement(
        CheckboxGroup.Root,
        { allValues: ["email", "push"], value, "aria-label": "Methods" },
        React.createElement(
          CheckboxGroup.Parent,
          { "aria-label": "Select all" },
          React.createElement(Checkbox.Indicator, { forceMount: true }, "mark"),
        ),
      ),
    );

    assert.match(html, /data-slot="checkbox-group-parent"/);
    assert.match(html, new RegExp(`aria-checked="${expected}"`));
    assert.doesNotMatch(html, /name=/);
  }
});

test("CheckboxGroupParent requires an explicit complete value set", () => {
  assert.throws(
    () => renderToStaticMarkup(
      React.createElement(
        CheckboxGroup.Root,
        { value: [], "aria-label": "Methods" },
        React.createElement(CheckboxGroup.Parent, { "aria-label": "Select all" }),
      ),
    ),
    /requires <CheckboxGroup.Root allValues=/,
  );
});

test("CheckboxGroupParent selects and clears declared values without deleting outside values", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  function Probe() {
    const context = useCheckboxGroupContext();
    return React.createElement("output", null, context.groupValues.join(","));
  }

  try {
    await React.act(async () => {
      root.render(
        React.createElement(
          CheckboxGroup.Root,
          {
            allValues: ["email", "push", "email"],
            defaultValue: ["outside"],
            onValueChange: (value) => changes.push(value),
          },
          React.createElement(CheckboxGroup.Parent, null, "Select all"),
          React.createElement(CheckboxGroup.Item, { value: "email" }, "Email"),
          React.createElement(CheckboxGroup.Item, { value: "push" }, "Push"),
          React.createElement(Probe),
        ),
      );
    });

    const parent = container.querySelector('[data-slot="checkbox-group-parent"]');
    assert.equal(parent.getAttribute("aria-checked"), "false");
    await click(parent);
    assert.equal(parent.getAttribute("aria-checked"), "true");
    assert.equal(container.querySelector("output").textContent, "outside,email,push");
    await click(parent);
    assert.equal(parent.getAttribute("aria-checked"), "false");
    assert.equal(container.querySelector("output").textContent, "outside");
    assert.deepEqual(changes, [
      ["outside", "email", "push"],
      ["outside"],
    ]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("CheckboxGroupParent inherits state and preserves Checkbox composition", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroup.Root,
      {
        allValues: ["email"],
        value: [],
        disabled: true,
        readOnly: true,
        invalid: true,
        "aria-label": "Methods",
      },
      React.createElement(
        CheckboxGroup.Parent,
        {
          asChild: true,
          className: "parent-class",
          "data-consumer": "parent",
        },
        React.createElement(
          "span",
          { className: "child-class" },
          React.createElement(Checkbox.Indicator, { forceMount: true }, "mark"),
          "Select all",
        ),
      ),
    ),
  );

  assert.match(html, /<span/);
  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /data-slot="checkbox-group-parent"/);
  assert.match(html, /data-consumer="parent"/);
  assert.match(html, /class="child-class parent-class"/);
  assert.match(html, /data-slot="checkbox-indicator"/);

  const renderHtml = renderToStaticMarkup(
    React.createElement(
      CheckboxGroup.Root,
      { allValues: ["email"], value: ["email"], "aria-label": "Methods" },
      React.createElement(
        CheckboxGroup.Parent,
        {
          render: (props) => React.createElement("div", props),
          "data-consumer": "render-parent",
        },
        "Select all",
      ),
    ),
  );
  assert.match(renderHtml, /<div[^>]*data-consumer="render-parent"/);
  assert.match(renderHtml, /role="checkbox"/);
  assert.match(renderHtml, /aria-checked="true"/);
});

test("CheckboxGroup structured item relationships are present in server markup", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroup.Root,
      { value: ["email"], "aria-label": "Methods" },
      React.createElement(
        CheckboxGroup.Item,
        { id: "method-email", value: "email" },
        React.createElement(
          CheckboxGroup.ItemLabel,
          { id: "consumer-label-id" },
          "Email",
        ),
        React.createElement(
          CheckboxGroup.ItemDescription,
          { id: "consumer-description-id" },
          "Recommended for notices.",
        ),
      ),
    ),
  );

  assert.match(html, /id="method-email"/);
  assert.match(html, /aria-labelledby="method-email-label"/);
  assert.match(html, /aria-describedby="method-email-description"/);
  assert.match(html, /id="method-email-label"/);
  assert.match(html, /data-slot="checkbox-group-item-label"/);
  assert.match(html, /id="method-email-description"/);
  assert.match(html, /data-slot="checkbox-group-item-description"/);
  assert.doesNotMatch(html, /consumer-label-id|consumer-description-id/);
});

test("CheckboxGroup structured parts support fragments arrays and composition", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroup.Root,
      { value: [], "aria-label": "Methods" },
      React.createElement(
        CheckboxGroup.Item,
        { id: "method-sms", value: "sms" },
        React.createElement(
          React.Fragment,
          null,
          [
            React.createElement(
              CheckboxGroup.ItemLabel,
              {
                asChild: true,
                className: "label-class",
                "data-consumer": "label",
                key: "label",
              },
              React.createElement("strong", null, "SMS"),
            ),
            React.createElement(
              CheckboxGroup.ItemDescription,
              {
                className: "description-class",
                "data-consumer": "description",
                key: "description",
                render: (props) => React.createElement("small", props),
              },
              "Carrier rates apply.",
            ),
          ],
        ),
      ),
    ),
  );

  assert.match(html, /aria-labelledby="method-sms-label"/);
  assert.match(html, /aria-describedby="method-sms-description"/);
  assert.match(html, /<strong[^>]*id="method-sms-label"/);
  assert.match(html, /data-slot="checkbox-group-item-label"/);
  assert.match(html, /data-consumer="label"/);
  assert.match(html, /class="label-class"/);
  assert.match(html, /<small[^>]*id="method-sms-description"/);
  assert.match(html, /data-slot="checkbox-group-item-description"/);
  assert.match(html, /data-consumer="description"/);
  assert.match(html, /class="description-class"/);
});

test("CheckboxGroup plain items keep content naming without generated relationships", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroup.Root,
      { value: [], "aria-label": "Methods" },
      React.createElement(
        CheckboxGroup.Item,
        { id: "plain-push", value: "push" },
        "Push alerts",
      ),
    ),
  );

  assert.match(html, />Push alerts<\/button>/);
  assert.doesNotMatch(html, /aria-labelledby=/);
  assert.doesNotMatch(html, /aria-describedby=/);
});

test("CheckboxGroup complete parts forward their DOM refs", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const parentRef = React.createRef();
  const itemRef = React.createRef();
  const labelRef = React.createRef();
  const descriptionRef = React.createRef();

  try {
    await React.act(async () => {
      root.render(
        React.createElement(
          CheckboxGroup.Root,
          { allValues: ["email"], value: [], "aria-label": "Methods" },
          React.createElement(
            CheckboxGroup.Parent,
            { ref: parentRef },
            "Select all",
          ),
          React.createElement(
            CheckboxGroup.Item,
            { ref: itemRef, value: "email" },
            React.createElement(
              CheckboxGroup.ItemLabel,
              { ref: labelRef },
              "Email",
            ),
            React.createElement(
              CheckboxGroup.ItemDescription,
              { ref: descriptionRef },
              "Account notices",
            ),
          ),
        ),
      );
    });

    assert.equal(parentRef.current.tagName, "BUTTON");
    assert.equal(itemRef.current.tagName, "BUTTON");
    assert.equal(labelRef.current.tagName, "SPAN");
    assert.equal(descriptionRef.current.tagName, "SPAN");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("CheckboxGroup structured item respects native ARIA and marked wrappers", () => {
  const StyledLabel = markCheckboxGroupItemPart(
    function StyledLabel(props) {
      return React.createElement(CheckboxGroup.ItemLabel, props);
    },
    "label",
  );
  const StyledDescription = markCheckboxGroupItemPart(
    function StyledDescription(props) {
      return React.createElement(CheckboxGroup.ItemDescription, props);
    },
    "description",
  );
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroup.Root,
      { value: [], "aria-label": "Methods" },
      React.createElement(
        CheckboxGroup.Item,
        {
          id: "method-push",
          value: "push",
          "aria-labelledby": "custom-label",
          "aria-describedby": "custom-description",
        },
        React.createElement(StyledLabel, null, "Push"),
        React.createElement(StyledDescription, null, "Fast alerts"),
      ),
    ),
  );

  assert.match(html, /aria-labelledby="custom-label"/);
  assert.match(html, /aria-describedby="custom-description"/);
});

test("CheckboxGroup conditional item description stays correct across hydration", async () => {
  const { container, cleanup } = installDom();
  let root;
  function Example({ described }) {
    return React.createElement(
      CheckboxGroup.Root,
      { value: [], "aria-label": "Methods" },
      React.createElement(
        CheckboxGroup.Item,
        { id: "conditional-email", value: "email" },
        React.createElement(CheckboxGroup.ItemLabel, null, "Email"),
        described
          ? React.createElement(CheckboxGroup.ItemDescription, null, "Fast")
          : null,
      ),
    );
  }

  try {
    container.innerHTML = renderToStaticMarkup(
      React.createElement(Example, { described: true }),
    );
    const item = container.querySelector('[data-slot="checkbox-group-item"]');
    assert.equal(item.getAttribute("aria-describedby"), "conditional-email-description");

    await React.act(async () => {
      root = hydrateRoot(container, React.createElement(Example, { described: true }));
    });
    assert.equal(item.getAttribute("aria-describedby"), "conditional-email-description");

    await React.act(async () => {
      root.render(React.createElement(Example, { described: false }));
    });
    assert.equal(item.hasAttribute("aria-describedby"), false);
  } finally {
    if (root) await React.act(async () => root.unmount());
    cleanup();
  }
});

test("CheckboxGroupItem renders group-owned checked state and indicator", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroup.Root,
      {
        value: ["cheese"],
        name: "toppings",
        form: "order-form",
        "aria-label": "Toppings",
      },
      React.createElement(
        CheckboxGroup.Item,
        { value: "cheese", className: "item-class" },
        React.createElement(Checkbox.Indicator, null, "check"),
      ),
    ),
  );

  assert.match(html, /role="group"/);
  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-slot="checkbox-group-item"/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-value="cheese"/);
  assert.match(html, /class="item-class"/);
  assert.match(html, /data-slot="checkbox-indicator"/);
  assert.match(html, />check<\/span>/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /name="toppings"/);
  assert.match(html, /value="cheese"/);
  assert.match(html, /form="order-form"/);
  assert.match(html, /checked=""/);
});

test("CheckboxGroupItem inherits disabled readonly invalid and required state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroupRoot,
      {
        value: [],
        name: "toppings",
        disabled: true,
        readOnly: true,
        invalid: true,
        required: true,
        "aria-label": "Toppings",
      },
      React.createElement(CheckboxGroupItem, { value: "cheese" }, "Cheese"),
    ),
  );

  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(
    html,
    /<button id="[^"]+" type="button" role="checkbox" aria-checked="false" aria-disabled="true" aria-required="true" aria-readonly="true" aria-invalid="true" disabled=""/,
  );
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /<input type="checkbox" aria-hidden="true" tabindex="-1" required=""/);
  assert.doesNotMatch(html, /<input[^>]*readonly=/);
});

test("CheckboxGroupRoot provides selected values through context", () => {
  function CheckboxGroupProbe() {
    const context = useCheckboxGroupContext();
    return React.createElement(
      "output",
      null,
      [
        context.groupValues.join(","),
        context.isItemChecked("cheese") ? "checked" : "unchecked",
        context.orientation,
      ].join("|"),
    );
  }

  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroupRoot,
      { value: ["cheese"], orientation: "horizontal", "aria-label": "Toppings" },
      React.createElement(CheckboxGroupProbe),
    ),
  );

  assert.match(html, /<output>cheese\|checked\|horizontal<\/output>/);
});
