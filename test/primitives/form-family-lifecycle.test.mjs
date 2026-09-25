import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Field, Fieldset, Form, Input } from "../../dist/index.js";

test("independent field validity clears without group feedback; reset invalidates pending submission", async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: "http://localhost" });
  const keys = ["window", "document", "HTMLElement", "Element", "HTMLInputElement", "HTMLTextAreaElement", "HTMLSelectElement", "MutationObserver", "Node", "Event", "IS_REACT_ACT_ENVIRONMENT"];
  const descriptors = keys.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key] });
  const h = React.createElement;
  const root = createRoot(document.getElementById("root"));
  try {
    const fields = invalid => h(Fieldset.Root, { id: "group" },
      h(Fieldset.Legend, null, "Group"),
      h(Field.Root, { id: "first", invalid }, h(Field.Label, null, "First"), h(Input.Root)),
      h(Field.Root, { id: "second" }, h(Field.Label, null, "Second"), h(Input.Root)));
    await act(async () => root.render(fields(true)));
    assert.equal(document.getElementById("second").hasAttribute("data-invalid"), false);
    assert.equal(document.getElementById("group").hasAttribute("data-invalid"), true);
    await act(async () => root.render(fields(false)));
    assert.equal(document.getElementById("group").hasAttribute("data-invalid"), false);
    let finish;
    const pending = new Promise(resolve => { finish = resolve; });
    await act(async () => root.render(h(Form.Root, { preventDefaultOnSubmit: true, onSubmit: () => pending }, h("button", {type:"submit"}, "Save"))));
    const form = document.querySelector("form");
    await act(async () => form.dispatchEvent(new Event("submit", {bubbles:true,cancelable:true})));
    assert.equal(form.hasAttribute("data-submitting"), true);
    await act(async () => form.reset());
    await act(async () => finish());
    assert.equal(form.hasAttribute("data-submitted"), false);
    assert.equal(form.hasAttribute("data-submitting"), false);

    const completions = [];
    await act(async () => root.render(h(Form.Root, {preventDefaultOnSubmit:true, onSubmit:()=>new Promise(resolve=>completions.push(resolve))},h("button",{type:"submit"},"Save"))));
    await act(async () => form.dispatchEvent(new Event("submit", {bubbles:true,cancelable:true})));
    await act(async () => form.dispatchEvent(new Event("submit", {bubbles:true,cancelable:true})));
    await act(async () => completions[0]());
    assert.equal(form.hasAttribute("data-submitting"), true, "older completion cannot finish a newer submission");
    assert.equal(form.hasAttribute("data-submitted"), false);
    await act(async () => completions[1]());
    assert.equal(form.hasAttribute("data-submitting"), false);
    assert.equal(form.hasAttribute("data-submitted"), true);

    let validate;
    let submitted = 0;
    await act(async () => root.render(h(Form.Root,{preventDefaultOnSubmit:true,validateOnSubmit:()=>new Promise(resolve=>{validate=resolve;}),onSubmit:()=>{submitted++;}},h("button",{type:"submit"},"Save"))));
    await act(async () => form.dispatchEvent(new Event("submit", {bubbles:true,cancelable:true})));
    await act(async () => form.reset());
    await act(async () => validate(true));
    assert.equal(submitted,0,"reset invalidates pending validation before application submit");
    assert.equal(form.hasAttribute("data-submitted"),false);

    let submittedForm;
    let submittedValue;
    await act(async () => root.render(h(Form.Root, {
      validateOnSubmit: () => Promise.resolve(true),
      onSubmit: event => {
        submittedForm = event.currentTarget;
        if (submittedForm) submittedValue = new dom.window.FormData(submittedForm).get("name");
      },
    }, h("input", { name: "name", defaultValue: "Ada" }))));
    await act(async () => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    assert.ok(submittedForm === form, "async validation preserves the form for the accepted submit callback");
    assert.equal(submittedValue, "Ada");
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    keys.forEach((key, index) => descriptors[index] ? Object.defineProperty(globalThis, key, descriptors[index]) : delete globalThis[key]);
  }
});
