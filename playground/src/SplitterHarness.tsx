import { useState } from "react";
import { Splitter } from "@flowstack-ui/atom/splitter";
import { Button } from "@flowstack-ui/atom/button";

export function SplitterHarness() {
  const [vertical, setVertical] = useState(false), [rtl, setRtl] = useState(false), [disabled, setDisabled] = useState(false);
  const [ends, setEnds] = useState(0), [cancelled, setCancelled] = useState(false);
  return <section><h1>Splitter behavior</h1>
    <Button.Root onClick={() => setVertical(v => !v)}>Switch axis</Button.Root>
    <Button.Root onClick={() => setRtl(v => !v)}>Switch direction</Button.Root>
    <Button.Root onClick={() => setDisabled(v => !v)}>Disable resizing</Button.Root>
    <output data-testid="ends">{ends}</output><output data-testid="cancelled">{String(cancelled)}</output>
    <Splitter.Root data-testid="split" panels={[{ id: "files", minSize: 20, collapsible: true }, { id: "editor", minSize: 20 }]}
      defaultSizes={{ files: 40, editor: 60 }} orientation={vertical ? "vertical" : "horizontal"} dir={rtl ? "rtl" : "ltr"} disabled={disabled}
      style={{ width: 800, height: 300 }} onResizeEnd={d => { setEnds(n => n + 1); setCancelled(d.cancelled); }}>
      <Splitter.Panel panelId="files"><input aria-label="File name" defaultValue="draft" /></Splitter.Panel>
      <Splitter.ResizeTrigger before="files" after="editor" aria-label="Files size">
        <span style={{ position: "absolute", width: 24, height: 24, left: -12, top: 0, background: "gray" }} />
      </Splitter.ResizeTrigger>
      <Splitter.Panel panelId="editor"><iframe title="Editor frame" srcDoc="<p>Editor</p>" />
        <Splitter.Root panels={[{ id: "preview" }, { id: "console" }]} style={{ height: 80 }}>
          <Splitter.Panel panelId="preview">Preview</Splitter.Panel><Splitter.ResizeTrigger before="preview" after="console" aria-label="Nested preview" /><Splitter.Panel panelId="console">Console</Splitter.Panel>
        </Splitter.Root>
      </Splitter.Panel>
      <Splitter.Context>{s => <><Button.Root style={{ position: "absolute", top: 350 }} onClick={s.resetSizes}>Reset sizes</Button.Root><Button.Root style={{ position: "absolute", top: 380 }} onClick={() => s.collapsePanel("files")}>Collapse files</Button.Root></>}</Splitter.Context>
    </Splitter.Root>
    <Splitter.Root data-testid="controlled" panels={[{ id: "one" }, { id: "two" }]} sizes={{ one: 50, two: 50 }} style={{ width: 800, height: 100 }}>
      <Splitter.Panel panelId="one">Controlled</Splitter.Panel><Splitter.ResizeTrigger before="one" after="two" aria-label="Rejected size" /><Splitter.Panel panelId="two">Parent rejects changes</Splitter.Panel>
    </Splitter.Root>
  </section>;
}
