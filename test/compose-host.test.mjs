import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { composeHost } from "../dist/compose-host.js";

test("composeHost preserves child props and orders both handlers", () => {
  const calls = [];
  const host = composeHost(React.createElement("div", { className: "child", title: "child", style: { color: "red" }, onClick: () => calls.push("child") }, "content"), {
    className: "owner", title: undefined, style: { padding: 1 }, onClick: () => calls.push("owner"),
  });
  host.props.onClick();
  assert.deepEqual(calls, ["owner", "child"]);
  assert.equal(host.props.className, "child owner");
  assert.equal(host.props.children, "content");
  assert.equal(host.props.title, "child");
  assert.deepEqual(host.props.style, { color: "red", padding: 1 });
});

test("composeHost preserves cleanup and object refs", () => {
  const calls = []; const objectRef = { current: null };
  const host = composeHost(React.createElement("div", { ref: () => { calls.push("mount"); return () => calls.push("cleanup"); } }), { ref: objectRef });
  const node = {}; const detach = host.props.ref(node);
  assert.equal(objectRef.current, node);
  detach();
  assert.equal(objectRef.current, null);
  assert.deepEqual(calls, ["mount", "cleanup"]);
});

test("composeHost rejects fragments and multiple hosts", () => {
  assert.throws(() => composeHost(React.createElement(React.Fragment), {}), /non-Fragment/);
  assert.throws(() => composeHost([React.createElement("div"), React.createElement("div")], {}));
});
