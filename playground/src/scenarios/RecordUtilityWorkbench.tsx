import {createContext,useContext,useState,type ReactNode} from "react";
import {useSelection,useSelectionCheckbox,type SelectionState} from "@flowstack-ui/atom/selection";
import {ActionDelegate} from "@flowstack-ui/atom/action-delegate";
import {Checkbox} from "@flowstack-ui/atom/checkbox";
import {Button} from "@flowstack-ui/atom/button";
import {ControlToolbar,ToolbarGroup,MenuCheckboxControl} from "../WorkbenchPrimitives";
const keys=["alpha","beta","gamma"];
function useModel() {
  const [disabled,setDisabled]=useState(false),[readOnly,setReadOnly]=useState(false);
  const [reverse,setReverse]=useState(false);
  const [log,setLog]=useState<string[]>([]);
  const selection=useSelection({orderedKeys:reverse?[...keys].reverse():keys,disabled,readOnly,onSelectionChange:next=>setLog(previous=>[...previous.slice(-19),"Selected: "+(next.join(", ")||"none")])});
  return {reverse,setReverse,selection,disabled,setDisabled,readOnly,setReadOnly,log,setLog};
}
const Context=createContext<ReturnType<typeof useModel>|null>(null);
function useModelContext(){const state=useContext(Context);if(!state)throw new Error("Record workbench provider missing");return state;}
export function RecordUtilityProvider({children}:{children:ReactNode}) {const model=useModel();return <Context.Provider value={model}>{children}</Context.Provider>;}
export function RecordUtilityToolbar({delegate}:{delegate:boolean}) {
  const s=useModelContext();
  return <ControlToolbar label="Record utility controls"><ToolbarGroup title="State" value="state">
    <MenuCheckboxControl label="Disabled" value="disabled" checked={s.disabled} onChange={s.setDisabled}/>
    {!delegate && <MenuCheckboxControl label="Read only" value="readOnly" checked={s.readOnly} onChange={s.setReadOnly}/>}
    {!delegate && <MenuCheckboxControl label="Reverse order" value="reverse" checked={s.reverse} onChange={s.setReverse}/>}
  </ToolbarGroup></ControlToolbar>;
}
function Item({value,selection}:{value:string;selection:SelectionState}) {
  const binding=useSelectionCheckbox({selection,value,rangeSelection:true});
  return <li><Checkbox.Root {...binding} aria-label={`Select ${value}`}/>{value}</li>;
}
export function RecordUtilityCanvas({delegate}:{delegate:boolean}) {
  const s=useModelContext();
  if(delegate) return <ActionDelegate targetId="record-workbench-open" disabled={s.disabled}><article data-playground-record-host="">
    <p>Click the record text to open its actual link.</p>
    <a id="record-workbench-open" href="#record-workbench-destination" onClick={()=>s.setLog(previous=>[...previous,"Opened record"])}>Open record</a>
    <Button.Root onPress={()=>s.setLog(previous=>[...previous,"Secondary action"])}>Secondary action</Button.Root>
  </article></ActionDelegate>;
  return <><ul>{(s.reverse?[...keys].reverse():keys).map(value=><Item key={value} value={value} selection={s.selection}/>)}</ul><Button.Root onPress={()=>s.selection.setScopeSelected(keys,true)}>Select scope</Button.Root><Button.Root onPress={s.selection.clearSelection}>Clear selection</Button.Root></>;
}
export function RecordUtilityAnatomy({delegate}:{delegate:boolean}) {
  const s=useModelContext();
  return <dl><dt>{delegate?"ActionDelegate":"useSelection"}</dt><dd>{delegate?"One cloned host, no generated wrapper or keyboard model":"No DOM part"}</dd><dt>Selected IDs</dt><dd>{s.selection.selectedKeys.join(", ")||"none"}</dd><dt>Scope</dt><dd>{s.selection.getScopeState(keys)}</dd></dl>;
}
export function RecordUtilityFooter(){const s=useModelContext();return <div className="panel-footer">{s.selection.selectedKeys.length} selected</div>;}
export function RecordUtilityLog(){const s=useModelContext();return <ol>{s.log.map((entry,index)=><li key={index}>{entry}</li>)}</ol>;}
export function RecordUtilitySource({delegate}:{delegate:boolean}) {
  const s=useModelContext();
  const source=delegate ? `<ActionDelegate targetId="open"${s.disabled?" disabled":""}>
  <article>
    <p>Record</p>
    <a id="open" href="/record">Open record</a>
    <Button.Root onPress={secondaryAction}>Secondary action</Button.Root>
  </article>
</ActionDelegate>` : `const selection = useSelection({
  orderedKeys: ${JSON.stringify(s.reverse?[...keys].reverse():keys)},${s.disabled?"\n  disabled: true,":""}${s.readOnly?"\n  readOnly: true,":""}
});
// Inside a row component:
const binding = useSelectionCheckbox({ selection, value, rangeSelection: true });
return <Checkbox.Root {...binding} aria-label={\`Select \${value}\`} />;`;
  return <pre><code>{source}</code></pre>;
}
