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
  Field,
  Fieldset,
  Input,
  RadioGroup,
  Switch,
  markFieldPart,
  markFieldsetPart,
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

test("custom checkbox and switch values submit and restore uncontrolled defaults on reset", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => {
      root.render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement("form", { id: "preferences" }),
          React.createElement(Checkbox.Root, {
            defaultChecked: true,
            form: "preferences",
            name: "terms",
            value: "accepted",
            "aria-label": "Accept terms",
          }),
          React.createElement(Switch.Root, {
            defaultChecked: false,
            form: "preferences",
            name: "updates",
            value: "enabled",
            "aria-label": "Email updates",
          }),
        ),
      );
    });

    const form = container.querySelector("form");
    const [checkbox, switchControl] = container.querySelectorAll("button");
    assert.deepEqual(Array.from(new window.FormData(form).entries()), [["terms", "accepted"]]);

    await click(checkbox);
    await click(switchControl);
    assert.deepEqual(Array.from(new window.FormData(form).entries()), [["updates", "enabled"]]);

    await React.act(async () => form.reset());
    assert.equal(checkbox.getAttribute("aria-checked"), "true");
    assert.equal(switchControl.getAttribute("aria-checked"), "false");
    assert.deepEqual(Array.from(new window.FormData(form).entries()), [["terms", "accepted"]]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("required CheckboxGroup validates one-or-more while RadioGroup submits one value", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => {
      root.render(
        React.createElement(
          "form",
          null,
          React.createElement(
            Fieldset.Root,
            { id: "topics", required: true },
            React.createElement(Fieldset.Legend, null, "Topics"),
            React.createElement(Fieldset.Description, null, "Choose at least one."),
            React.createElement(
              CheckboxGroup.Root,
              { name: "topics" },
              React.createElement(CheckboxGroup.Item, { value: "news" }, "News"),
              React.createElement(CheckboxGroup.Item, { value: "events" }, "Events"),
            ),
          ),
          React.createElement(
            RadioGroup.Root,
            { name: "contact", defaultValue: "email", "aria-label": "Contact" },
            React.createElement(RadioGroup.Radio, { value: "email" }, "Email"),
            React.createElement(RadioGroup.Radio, { value: "phone" }, "Phone"),
          ),
        ),
      );
    });

    const form = container.querySelector("form");
    const group = container.querySelector('[data-slot="checkbox-group"]');
    assert.equal(group.getAttribute("aria-labelledby"), "topics-legend");
    assert.equal(group.getAttribute("aria-describedby"), "topics-description");
    assert.equal(form.checkValidity(), false);

    await click(container.querySelector('[data-slot="checkbox-group-item"]'));
    assert.equal(form.checkValidity(), true);
    assert.deepEqual(Array.from(new window.FormData(form).entries()), [
      ["topics", "news"],
      ["contact", "email"],
    ]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Field relationships survive hydration and conditional error removal", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  function Example({ invalid }) {
    return React.createElement(
      Field.Root,
      { id: "email", invalid },
      React.createElement(Field.Label, null, "Email"),
      React.createElement(Input.Root, { name: "email" }),
      React.createElement(Field.Description, null, "Use a work address."),
      React.createElement(Field.Error, null, "Invalid address."),
    );
  }

  try {
    await React.act(async () => root.render(React.createElement(Example, { invalid: true })));
    const input = container.querySelector("input");
    assert.equal(input.getAttribute("aria-describedby"), "email-description email-error");
    assert.equal(container.querySelector('[data-slot="field-error"]').hasAttribute("role"), false);

    await React.act(async () => root.render(React.createElement(Example, { invalid: false })));
    assert.equal(input.getAttribute("aria-describedby"), "email-description");
    assert.equal(container.querySelector('[data-slot="field-error"]'), null);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("asChild Field and Fieldset relationships survive hydration and conditional errors", async () => {
  const { container, cleanup } = installDom();
  let root;

  function Example({ invalid }) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Field.Root,
        { asChild: true, id: "account-email", invalid },
        React.createElement(
          "section",
          null,
          React.createElement(Field.Label, null, "Email"),
          React.createElement(Input.Root, { name: "email" }),
          React.createElement(Field.Description, null, "Use a work address."),
          React.createElement(Field.Error, null, "Invalid address."),
        ),
      ),
      React.createElement(
        Fieldset.Root,
        { asChild: true, id: "topics", invalid },
        React.createElement(
          "fieldset",
          null,
          React.createElement(Fieldset.Legend, null, "Topics"),
          React.createElement(Fieldset.Description, null, "Choose topics."),
          React.createElement(
            CheckboxGroup.Root,
            { name: "topics" },
            React.createElement(CheckboxGroup.Item, { value: "news" }, "News"),
          ),
          React.createElement(Fieldset.Error, null, "Choose a topic."),
        ),
      ),
    );
  }

  try {
    container.innerHTML = renderToStaticMarkup(
      React.createElement(Example, { invalid: true }),
    );

    const input = container.querySelector('input[name="email"]');
    const group = container.querySelector('[data-slot="checkbox-group"]');
    assert.equal(
      input.getAttribute("aria-describedby"),
      "account-email-description account-email-error",
    );
    assert.equal(
      group.getAttribute("aria-describedby"),
      "topics-description topics-error",
    );
    assert.equal(group.getAttribute("aria-labelledby"), "topics-legend");

    await React.act(async () => {
      root = hydrateRoot(
        container,
        React.createElement(Example, { invalid: true }),
      );
    });

    assert.equal(
      input.getAttribute("aria-describedby"),
      "account-email-description account-email-error",
    );
    assert.equal(
      group.getAttribute("aria-describedby"),
      "topics-description topics-error",
    );

    await React.act(async () => {
      root.render(React.createElement(Example, { invalid: false }));
    });

    assert.equal(input.getAttribute("aria-describedby"), "account-email-description");
    assert.equal(group.getAttribute("aria-describedby"), "topics-description");
    assert.equal(container.querySelectorAll('[data-slot$="-error"]').length, 0);
  } finally {
    if (root) await React.act(async () => root.unmount());
    cleanup();
  }
});

test("marked styled parts keep server relationships through hydration", async () => {
  const { container, cleanup } = installDom();
  let root;
  const StyledDescription = markFieldPart(
    React.forwardRef((props, ref) => React.createElement(Field.Description, {
      ...props,
      className: "styled-field-description",
      ref,
    })),
    "description",
  );
  const StyledError = markFieldPart(
    React.forwardRef((props, ref) => React.createElement(Field.Error, {
      ...props,
      className: "styled-field-error",
      ref,
    })),
    "error",
  );
  const StyledLegend = markFieldsetPart(
    React.forwardRef((props, ref) => React.createElement(Fieldset.Legend, {
      ...props,
      className: "styled-fieldset-legend",
      ref,
    })),
    "legend",
  );
  const StyledFieldsetDescription = markFieldsetPart(
    React.forwardRef((props, ref) => React.createElement(Fieldset.Description, {
      ...props,
      className: "styled-fieldset-description",
      ref,
    })),
    "description",
  );
  const StyledFieldsetError = markFieldsetPart(
    React.forwardRef((props, ref) => React.createElement(Fieldset.Error, {
      ...props,
      className: "styled-fieldset-error",
      ref,
    })),
    "error",
  );

  function Example({ invalid }) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Field.Root,
        { id: "styled-email", invalid },
        React.createElement(Field.Label, null, "Email"),
        React.createElement(Input.Root, { name: "email" }),
        React.createElement(StyledDescription, null, "Use a work address."),
        React.createElement(StyledError, null, "Invalid address."),
      ),
      React.createElement(
        Fieldset.Root,
        { id: "styled-topics", invalid },
        React.createElement(StyledLegend, null, "Topics"),
        React.createElement(StyledFieldsetDescription, null, "Choose topics."),
        React.createElement(
          CheckboxGroup.Root,
          { name: "topics" },
          React.createElement(CheckboxGroup.Item, { value: "news" }, "News"),
        ),
        React.createElement(StyledFieldsetError, null, "Choose a topic."),
      ),
    );
  }

  try {
    container.innerHTML = renderToStaticMarkup(
      React.createElement(Example, { invalid: true }),
    );

    const input = container.querySelector('input[name="email"]');
    const group = container.querySelector('[data-slot="checkbox-group"]');
    assert.equal(
      input.getAttribute("aria-describedby"),
      "styled-email-description styled-email-error",
    );
    assert.equal(group.getAttribute("aria-labelledby"), "styled-topics-legend");
    assert.equal(
      group.getAttribute("aria-describedby"),
      "styled-topics-description styled-topics-error",
    );

    await React.act(async () => {
      root = hydrateRoot(container, React.createElement(Example, { invalid: true }));
    });

    assert.equal(
      input.getAttribute("aria-describedby"),
      "styled-email-description styled-email-error",
    );
    assert.equal(
      group.getAttribute("aria-describedby"),
      "styled-topics-description styled-topics-error",
    );

    await React.act(async () => {
      root.render(React.createElement(Example, { invalid: false }));
    });

    assert.equal(input.getAttribute("aria-describedby"), "styled-email-description");
    assert.equal(group.getAttribute("aria-describedby"), "styled-topics-description");
  } finally {
    if (root) await React.act(async () => root.unmount());
    cleanup();
  }
});
