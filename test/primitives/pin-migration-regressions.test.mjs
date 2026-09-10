import { JSDOM } from "jsdom";
import { assert, test, React } from "../test-utils.mjs";
import { PinInput } from "../../dist/pin-input.js";
const h = React.createElement;
async function mounted(options, run) {
  const dom = new JSDOM("<form><div id='app'></div></form>", {
    pretendToBeVisual: true,
  });
  const keys = [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "Element",
    "Node",
    "IS_REACT_ACT_ENVIRONMENT",
  ];
  const descriptors = keys.map((key) => [
    key,
    Object.getOwnPropertyDescriptor(globalThis, key),
  ]);
  for (const key of keys)
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key],
    });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("app"));
  let api;
  const render = async (next = options) =>
    React.act(async () =>
      root.render(
        h(
          PinInput.Root,
          { length: 4, ...next },
          h(PinInput.Context, null, (value) => {
            api = value;
            return null;
          }),
          ...Array.from({ length: 4 }, (_, index) =>
            h(PinInput.Input, { key: index, index }),
          ),
        ),
      ),
    );
  try {
    await render();
    await run(
      [...document.querySelectorAll("input:not([type=hidden])")],
      document.querySelector("form"),
      dom.window,
      () => api,
      render,
    );
  } finally {
    await React.act(async () => root.unmount());
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
}
test("middle-cell deletion preserves later positions", async () =>
  mounted({ defaultValue: ["1", "2", "3", "4"] }, async (inputs, form, win) => {
    await React.act(async () =>
      inputs[1].dispatchEvent(
        new win.KeyboardEvent("keydown", {
          key: "Delete",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    assert.deepEqual(
      inputs.map((input) => input.value),
      ["1", "", "3", "4"],
    );
  }));
test("completion and autosubmit see committed form data exactly once", async () => {
  let completed = [];
  await mounted(
    {
      name: "code",
      required: true,
      autoSubmit: true,
      onComplete: (value) => completed.push(value),
    },
    async (inputs, form, win, api) => {
      const submitted = [];
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitted.push(new win.FormData(form).get("code"));
      });
      await React.act(async () => api().setValue(["0", "1", "2", "3"]));
      assert.deepEqual(submitted, ["0123"]);
      assert.deepEqual(completed, ["0123"]);
      await React.act(async () => api().setValue(["0", "1", "2", "3"]));
      assert.equal(completed.length, 1);
    },
  );
});
test("controlled refusal and external replacement never complete", async () => {
  let completed = 0;
  const options = { value: [], onComplete: () => completed++ };
  await mounted(options, async (inputs, form, win, api, render) => {
    await React.act(async () => api().setValue(["1", "2", "3", "4"]));
    assert.equal(api().complete, false);
    await render({ ...options, value: ["1", "2", "3", "4"] });
    assert.equal(completed, 0);
  });
});
test("controller sequential writes preserve holes and disabled/readonly prohibit writes", async () =>
  mounted({}, async (inputs, form, win, api, render) => {
    await React.act(async () => {
      api().setValueAtIndex(0, "0");
      api().setValueAtIndex(2, "7");
    });
    assert.deepEqual(api().value, ["0", "", "7", ""]);
    await render({ disabled: true });
    await React.act(async () => api().clearValue());
    assert.deepEqual(api().value, ["0", "", "7", ""]);
    await render({ readOnly: true });
    await React.act(async () => api().setValue(["1", "2", "3", "4"]));
    assert.deepEqual(api().value, ["0", "", "7", ""]);
  }));
test("invalid paste is atomic and sanitizer supports formatted OTP", async () => {
  const rejected = [];
  await mounted(
    {
      defaultValue: ["1"],
      sanitizeValue: (value) => value.replaceAll("-", ""),
      onValueInvalid: (details) => rejected.push(details),
    },
    async (inputs, form, win, api) => {
      const paste = async (value) =>
        React.act(async () => {
          const event = new win.Event("paste", {
            bubbles: true,
            cancelable: true,
          });
          Object.defineProperty(event, "clipboardData", {
            value: { getData: () => value },
          });
          inputs[0].dispatchEvent(event);
        });
      await paste("12x4");
      assert.deepEqual(api().value, ["1", "", "", ""]);
      assert.equal(rejected.length, 1);
      await paste("01-23");
      assert.deepEqual(api().value, ["0", "1", "2", "3"]);
    },
  );
});
test("native mobile deletion clears a single position", async () =>
  mounted(
    { defaultValue: ["1", "2", "3", "4"] },
    async (inputs, form, win, api) => {
      await React.act(async () => {
        inputs[1].value = "";
        inputs[1].dispatchEvent(
          new win.InputEvent("input", {
            bubbles: true,
            inputType: "deleteContentBackward",
          }),
        );
      });
      assert.deepEqual(api().value, ["1", "", "3", "4"]);
    },
  ));
test("typing with selection disabled replaces the current character", async () =>
  mounted(
    { defaultValue: ["1", "2"], selectOnFocus: false },
    async (inputs, form, win, api) => {
      await React.act(async () => {
        inputs[0].value = "17";
        inputs[0].dispatchEvent(
          new win.InputEvent("input", {
            bubbles: true,
            inputType: "insertText",
            data: "7",
          }),
        );
      });
      assert.deepEqual(api().value, ["7", "2", "", ""]);
    },
  ));
test("RTL arrows follow logical cell order and completion blur is retained", async () =>
  mounted(
    { dir: "rtl", blurOnComplete: true },
    async (inputs, form, win, api) => {
      await React.act(async () => {
        inputs[0].focus();
        inputs[0].dispatchEvent(
          new win.KeyboardEvent("keydown", {
            key: "ArrowLeft",
            bubbles: true,
            cancelable: true,
          }),
        );
      });
      assert.equal(document.activeElement, inputs[1]);
      await React.act(async () => api().setValue(["1", "2", "3", "4"]));
      assert.equal(inputs.includes(document.activeElement), false);
    },
  ));
test("prevented reset retains edits", async () =>
  mounted({ defaultValue: ["1"] }, async (inputs, form, win, api) => {
    form.addEventListener("reset", (event) => event.preventDefault());
    await React.act(async () => api().setValueAtIndex(0, "9"));
    await React.act(async () => form.reset());
    assert.equal(api().value[0], "9");
  }));
test("IME does not advance or delete until committed", async () =>
  mounted({ type: "alphabetic" }, async (inputs, form, win, api) => {
    await React.act(async () => {
      inputs[0].focus();
      inputs[0].dispatchEvent(
        new win.CompositionEvent("compositionstart", { bubbles: true }),
      );
      inputs[0].value = "a";
      inputs[0].dispatchEvent(
        new win.InputEvent("input", {
          bubbles: true,
          isComposing: true,
          data: "a",
        }),
      );
      inputs[0].dispatchEvent(
        new win.KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          isComposing: true,
        }),
      );
    });
    assert.equal(document.activeElement, inputs[0]);
    assert.equal(api().valueAsString, "");
    await React.act(async () =>
      inputs[0].dispatchEvent(
        new win.CompositionEvent("compositionend", {
          bubbles: true,
          data: "a",
        }),
      ),
    );
    assert.equal(api().value[0], "a");
    assert.equal(document.activeElement, inputs[1]);
  }));
test("required checks the whole code", async () =>
  mounted({ defaultValue: ["1"], required: true }, async (inputs) => {
    assert.equal(inputs[0].validity.valid, false);
  }));
test("nameless native reset restores initial cells", async () =>
  mounted({ defaultValue: ["1", "2", "3", "4"] }, async (inputs, form, win) => {
    await React.act(async () =>
      inputs[3].dispatchEvent(
        new win.KeyboardEvent("keydown", {
          key: "Delete",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    await React.act(async () => form.reset());
    assert.deepEqual(
      inputs.map((input) => input.value),
      ["1", "2", "3", "4"],
    );
  }));
