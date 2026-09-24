import { useState } from "react";
import * as React from "react";
import { Collapsible, useCollapsible } from "@flowstack-ui/atom/collapsible";
import "./collapsible-harness.css";
export function CollapsibleHarness() {
  const [exits, setExits] = useState(0);
  const api = useCollapsible({
    defaultOpen: true,
    onExitComplete: () => setExits((value) => value + 1),
    ids: { content: "outer-panel", trigger: "outer-trigger" },
  });
  return (
    <main>
      <button onClick={() => api.setOpen(false)}>External close</button>
      <button onClick={() => api.setOpen(true)}>External open</button>
      <output aria-label="Exits">{exits}</output>
      <Collapsible.RootProvider value={api}>
        <Collapsible.Trigger>Outer toggle</Collapsible.Trigger>
        <Collapsible.Indicator />
        <Collapsible.Content className="collapsible-harness-motion">
          <button onClick={() => api.setOpen(false)}>Close inside</button>
          <Collapsible.Root defaultOpen>
            <Collapsible.Trigger>Inner toggle</Collapsible.Trigger>
            <Collapsible.Indicator />
            <Collapsible.Content>
              <p>Inner content</p>
            </Collapsible.Content>
          </Collapsible.Root>
        </Collapsible.Content>
      </Collapsible.RootProvider>
      <Collapsible.Root
        collapsedHeight="48px"
        ids={{ content: "partial-panel" }}
      >
        <Collapsible.Trigger asChild>
          <button>Preview toggle</button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div style={{ height: 150 }}>
            <button>Preview action</button>
            <p>Preview text</p>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
      <button>After preview</button>
      <Collapsible.Root orientation="horizontal" collapsedWidth="32px">
        <Collapsible.Trigger>Width preview</Collapsible.Trigger>
        <Collapsible.Content><div style={{ width: 180 }}>Horizontal preview</div></Collapsible.Content>
      </Collapsible.Root>
      <Collapsible.Root unmountOnExit={false}>
        <Collapsible.Trigger>Retained note</Collapsible.Trigger>
        <Collapsible.Content><input aria-label="Retained note input" /></Collapsible.Content>
      </Collapsible.Root>
      {Boolean((React as unknown as { Activity?: unknown }).Activity) && (
        <Collapsible.Root hideMode="activity" lazyMount={false} unmountOnExit={false}>
          <Collapsible.Trigger>Activity note</Collapsible.Trigger>
          <Collapsible.Content><input aria-label="Activity note input" /></Collapsible.Content>
        </Collapsible.Root>
      )}
      <Collapsible.Root disabled>
        <Collapsible.Trigger asChild>
          <button>Disabled composed</button>
        </Collapsible.Trigger>
        <Collapsible.Content>Unavailable</Collapsible.Content>
      </Collapsible.Root>
    </main>
  );
}
