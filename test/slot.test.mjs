import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { cloneAndMerge, composeRefs, renderElement } from "../dist/_internal/utils/slot.js";

test("composed refs preserve the null-detach path without returning cleanup", () => {
  const calls = [];
  const objectRef = { current: null };
  const ref = composeRefs(undefined, objectRef, value => { calls.push(value); });
  const host = {};
  assert.equal(ref(host), undefined);
  assert.equal(objectRef.current, host);
  assert.equal(ref(null), undefined);
  assert.equal(objectRef.current, null);
  assert.deepEqual(calls, [host, null]);
});

test("cleanup-returning refs clean up alongside ordinary and object refs", () => {
  const calls = [];
  const objectRef = { current: null };
  const host = {};
  const ref = composeRefs(
    value => { calls.push(["cleanup-ref", value]); return () => calls.push(["cleanup"]); },
    value => { calls.push(["ordinary-ref", value]); },
    objectRef,
  );
  const cleanup = ref(host);
  assert.equal(objectRef.current, host);
  cleanup();
  assert.equal(objectRef.current, null);
  assert.deepEqual(calls, [
    ["cleanup-ref", host], ["ordinary-ref", host], ["cleanup"], ["ordinary-ref", null],
  ]);
});

test("asChild and element rendering preserve both child and owner refs", () => {
  for (const compose of [
    (child, props) => cloneAndMerge(child, props),
    (child, props) => renderElement(child, "div", props),
  ]) {
    const childRef = { current: null };
    const ownerRef = { current: null };
    const element = compose(React.createElement("button", { ref: childRef }, "Save"), { ref: ownerRef });
    const host = {};
    element.props.ref(host);
    assert.equal(childRef.current, host);
    assert.equal(ownerRef.current, host);
    element.props.ref(null);
    assert.equal(childRef.current, null);
    assert.equal(ownerRef.current, null);
    assert.equal(element.props.children, "Save");
  }
});
