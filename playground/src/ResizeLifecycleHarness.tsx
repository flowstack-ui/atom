import { useState } from "react";
import { Editable } from "@flowstack-ui/atom/editable";
import { Collapsible } from "@flowstack-ui/atom/collapsible";

/** Test-owned geometry and motion; no visual recipe ships with Atom. */
export function ResizeLifecycleHarness() {
  const [mounted, setMounted] = useState(true);
  const [extra, setExtra] = useState(false);
  const text = "Responsive content wraps as its container changes width. ".repeat(12);
  return <main>
    <style>{`
      #resize-fixture { width: 75vw; max-width: 900px; font: 16px/24px sans-serif; }
      #resize-fixture textarea { box-sizing: border-box; width: 100%; font: inherit; }
      #resize-panel[data-state="closed"] { animation: resize-exit 180ms linear; }
      #resize-panel[data-state="open"]:not([data-initial-open]) { animation: resize-entry 180ms linear; }
      @keyframes resize-exit { from { height: var(--content-height); } to { height: 48px; } }
      @keyframes resize-entry { from { height: 48px; } to { height: var(--content-height); } }
    `}</style>
    <button onClick={() => setMounted(value => !value)}>Toggle fixtures</button>
    <button onClick={() => setExtra(value => !value)}>Change content</button>
    {mounted && <div id="resize-fixture">
      <Editable.Root defaultEdit autoResize defaultValue={text}>
        <Editable.Label>Responsive draft</Editable.Label>
        <Editable.Area><Editable.Preview /><Editable.Textarea /></Editable.Area>
      </Editable.Root>
      <Collapsible.Root collapsedHeight="48px" ids={{ content: "resize-panel" }}>
        <Collapsible.Trigger>Responsive disclosure</Collapsible.Trigger>
        <Collapsible.Content><div>{text}{extra && text}<button>Inside disclosure</button></div></Collapsible.Content>
      </Collapsible.Root>
    </div>}
  </main>;
}
