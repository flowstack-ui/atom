import { useState } from "react";
import { Splitter, useSplitter, createSplitterRegistry } from "@flowstack-ui/atom/splitter";

export function SplitterRegressionHarness() {
  const [single, setSingle] = useState(false);
  const [mounted, setMounted] = useState(false);
  const delayed = useSplitter({ panels: [{ id: "a" }, { id: "b" }], defaultSizes: { a: "10rem" } });
  const [registry] = useState(() => createSplitterRegistry());
  const store = useSplitter({ panels: single ? [{ id: "a" }] : [{ id: "a", minSize: 20 }, { id: "b", minSize: 20, collapsible: true }] });
  return <section>
    <button onClick={() => setMounted(value => !value)}>Toggle delayed provider</button>
    {mounted && <Splitter.RootProvider value={delayed} style={{ width: 800, height: 100 }}>
      <Splitter.Panel panelId="a">Delayed A</Splitter.Panel>
      <Splitter.ResizeTrigger before="a" after="b" aria-label="Delayed boundary" />
      <Splitter.Panel panelId="b">Delayed B</Splitter.Panel>
    </Splitter.RootProvider>}
    <button onClick={() => store.collapsePanel("b")}>Collapse trailing</button>
    <button onClick={store.resetSizes}>Reset regression</button>
    <button onClick={() => setSingle(value => !value)}>Toggle panel collection</button>
    <Splitter.RootProvider value={store} data-testid="regression-split" style={{ width: 800, height: 200 }}>
      <Splitter.Panel panelId="a">A</Splitter.Panel>
      {!single && <><Splitter.ResizeTrigger before="a" after="b" aria-label="Regression boundary" /><Splitter.Panel panelId="b"><input aria-label="Trailing input" /></Splitter.Panel></>}
    </Splitter.RootProvider>
    <Splitter.Root registry={registry} data-testid="shared-outer" panels={[{ id: "left", minSize: 20 }, { id: "right", minSize: 20 }]} style={{ width: 800, height: 300 }}>
      <Splitter.Panel panelId="left">Left</Splitter.Panel>
      <Splitter.ResizeTrigger before="left" after="right" aria-label="Shared vertical boundary"><span style={{ position: "absolute", inset: "0 -12px" }} /></Splitter.ResizeTrigger>
      <Splitter.Panel panelId="right"><Splitter.Root registry={registry} orientation="vertical" panels={[{ id: "top", minSize: 20 }, { id: "bottom", minSize: 20 }]} style={{ height: "100%" }}>
        <Splitter.Panel panelId="top">Top</Splitter.Panel>
        <Splitter.ResizeTrigger before="top" after="bottom" aria-label="Shared horizontal boundary"><span style={{ position: "absolute", inset: "-12px 0" }} /></Splitter.ResizeTrigger>
        <Splitter.Panel panelId="bottom">Bottom</Splitter.Panel>
      </Splitter.Root></Splitter.Panel>
    </Splitter.Root>
    <Splitter.Root data-testid="tall-split" panels={[{ id: "a" }, { id: "b" }]} style={{ width: 800, height: 1600, marginTop: 100 }}>
      <Splitter.Panel panelId="a">Tall A</Splitter.Panel>
      <Splitter.ResizeTrigger before="a" after="b" aria-label="Tall boundary"><span style={{ position: "absolute", inset: "0 -12px" }} /></Splitter.ResizeTrigger>
      <Splitter.Panel panelId="b">Tall B</Splitter.Panel>
    </Splitter.Root>
  </section>;
}
