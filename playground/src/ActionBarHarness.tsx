import { useRef, useState } from "react";
import { ActionBar } from "@flowstack-ui/atom/action-bar";
import { Dialog } from "@flowstack-ui/atom/dialog";

/** Headless interaction evidence; paint intentionally belongs to Brick. */
export function ActionBarHarness() {
  const [open, setOpen] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [blockEscape, setBlockEscape] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  return <main>
    <h1>ActionBar behavior</h1>
    <div ref={region}>
      <button type="button" onClick={() => setOpen(true)}>Select files</button>
      <button type="button">Select another file</button>
      <label><input type="checkbox" checked={persistent} onChange={e => setPersistent(e.target.checked)} />Keep selection region interactive</label>
      <label><input type="checkbox" checked={blockEscape} onChange={e => setBlockEscape(e.target.checked)} />Prevent Escape</label>
    </div>
    <button type="button">Outside action</button>
    <ActionBar.Root open={open} onOpenChange={setOpen} unmountOnExit={false}
      persistentElements={persistent ? [() => region.current] : []}
      onEscapeKeyDown={event => { if (blockEscape) event.preventDefault(); }}>
      <ActionBar.Portal>
        <ActionBar.Content aria-label="Selected file actions">
          <ActionBar.SelectionTrigger>Two selected files</ActionBar.SelectionTrigger>
          <label>Draft note<input aria-label="Draft note" /></label>
          <Dialog.Root>
            <Dialog.Trigger>Delete files</Dialog.Trigger>
            <Dialog.Portal><Dialog.Content aria-label="Confirm deletion">
              <Dialog.Title>Delete selected files?</Dialog.Title>
              <Dialog.Close>Cancel deletion</Dialog.Close>
            </Dialog.Content></Dialog.Portal>
          </Dialog.Root>
          <ActionBar.CloseTrigger>Close actions</ActionBar.CloseTrigger>
        </ActionBar.Content>
      </ActionBar.Portal>
    </ActionBar.Root>
  </main>;
}
