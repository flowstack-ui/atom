import { useState } from "react";
import { createPortal } from "react-dom";
import { useSelection, useSelectionCheckbox, type SelectionState } from "@flowstack-ui/atom/selection";
import { ActionDelegate } from "@flowstack-ui/atom/action-delegate";
import { Checkbox } from "@flowstack-ui/atom/checkbox";

const ids = ["alpha", "beta", "gamma", "delta"];
function Row({ value, selection, onOpen, onAction }: {
  value: string;
  selection: SelectionState;
  onOpen(): void;
  onAction(): void;
}) {
  const [menu, setMenu] = useState(false);
    const binding = useSelectionCheckbox({ selection, value, rangeSelection: true });
    return <ActionDelegate targetId={`open-${value}`}>
      <tr data-testid={`row-${value}`}>
        <td><Checkbox.Root {...binding} aria-label={`Select ${value}`} /></td>
        <td data-testid={`space-${value}`}>{value} record</td>
        <td><button id={`open-${value}`} onClick={onOpen}>Open {value}</button></td>
        <td><button onClick={onAction}>Receipt {value}</button></td>
        <td><button onClick={() => setMenu(true)}>Menu {value}</button>
          {menu ? createPortal(<button onClick={() => {onAction();setMenu(false);}}>Portal receipt</button>, document.body) : null}
        </td>
      </tr>
    </ActionDelegate>;
}
export function RecordSelectionHarness() {
  const selection = useSelection({ orderedKeys: ids });
  const [opened, setOpened] = useState(0);
  const [actions, setActions] = useState(0);
  return <main>
    <h1>Record selection qualification</h1>
    <output aria-label="Selected">{selection.selectedKeys.join(",") || "none"}</output>
    <output aria-label="Opened">{opened}</output>
    <output aria-label="Actions">{actions}</output>
    <table><caption>Transactions</caption><tbody>{ids.map(value => <Row key={value} value={value} selection={selection} onOpen={() => setOpened(n => n + 1)} onAction={() => setActions(n => n + 1)} />)}</tbody></table>
  </main>;
}
