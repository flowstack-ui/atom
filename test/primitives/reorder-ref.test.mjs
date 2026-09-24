import { assert, test, React } from "../test-utils.mjs";
import { cloneAndMerge, renderElement } from "../../dist/_internal/utils/slot.js";

for (const legacy of [false, true]) {
  test(`reorder composition retains child/owner refs with ${legacy ? "React 18" : "React 19"} ref storage`, () => {
    const childRef = { current: null };
    const ownerRef = { current: null };
    let child = React.createElement("li", { ref: childRef });
    if (legacy) {
      const props = {};
      Object.defineProperty(props, "ref", { get() { throw new Error("React 18 warning getter was read"); } });
      child = { ...child, props, ref: childRef };
    }
    for (const merged of [cloneAndMerge(child, { ref: ownerRef }), renderElement(child, "li", { ref: ownerRef })]) {
      const element = {};
      merged.props.ref(element);
      assert.equal(childRef.current, element);
      assert.equal(ownerRef.current, element);
      merged.props.ref(null);
      assert.equal(childRef.current, null);
      assert.equal(ownerRef.current, null);
    }
  });
}
