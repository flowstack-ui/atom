# TagsInput

Headless collection editing for authored string values. Use MultiSelect for
predefined selections and Brick Chip for display-only labels.

## Anatomy

```tsx
import { TagsInput } from "@flowstack-ui/atom/tags-input";

<TagsInput.Root defaultValue={["React"]}>
  <TagsInput.Label>Skills</TagsInput.Label>
  <TagsInput.Control>
    <TagsInput.Context>{({ value }) => value.map((tag, index) => (
      <TagsInput.Item key={index} index={index} value={tag}>
        <TagsInput.ItemPreview>
          <TagsInput.ItemText />
          <TagsInput.ItemDeleteTrigger>Remove</TagsInput.ItemDeleteTrigger>
        </TagsInput.ItemPreview>
        <TagsInput.ItemInput />
      </TagsInput.Item>
    ))}</TagsInput.Context>
    <TagsInput.Input />
    <TagsInput.ClearTrigger>Clear</TagsInput.ClearTrigger>
  </TagsInput.Control>
  <TagsInput.HiddenInput />
</TagsInput.Root>
```

Root and RootProvider render divs. Label is native label, Control and Item are
divs, Preview/Text are spans, Input/ItemInput/HiddenInput remain native inputs.
Delete/Clear triggers are buttons with standard asChild/render projection.
Native attributes, handlers and refs remain on their parts. No visual recipe,
icon or application layout is introduced.

## API Reference

- value/defaultValue: string[], default []; inputValue/defaultInputValue: string,
  default empty. onValueChange({value}) and onInputValueChange({inputValue}) own
  separate controlled axes.
- editable=false, allowDuplicates=false, addOnPaste=false, allowOverflow=false,
  autoFocus=false, max=Infinity; maxLength optionally bounds entry/edit text.
- delimiter="," accepts string or RegExp. sanitizeValue trims by default.
  validate({inputValue,value}) synchronously accepts each normalized candidate.
- blurBehavior is add, clear or omitted to preserve draft. Outside callbacks
  onFocusOutside, onPointerDownOutside and onInteractOutside may prevent default.
- disabled, readOnly, required, invalid, validationBehavior, name, form, id, ids,
  dir, placeholder and translations integrate with native/Field/Form contracts.
- onHighlightChange reports highlightedIndex and highlightedValue;
  onValueInvalid reports reason, attempted inputValue and current value.

All creation paths share acceptance rules: normalize, reject empty/duplicate/
invalid/overlong values, and enforce count. Paste is atomic; empty delimiter
segments are ignored, and any other rejection retains the entire draft without
partially appending values. allowOverflow explicitly permits extra items and
marks the root invalid. Editing checks the same rules excluding its own index
from duplicate comparison. An empty edit removes an enabled item.

## Controller and context

useTagsInput returns a controller for RootProvider. Create it inside Field when
Field state must be inherited. useTagsInputContext and Context expose value,
valueAsString (JSON), inputValue, count, empty, atMax, highlightedIndex,
editingIndex and editValue. Methods: setValue, addValue, addValues,
setValueAtIndex, clearValue(index?), setInputValue, clearInputValue, focus,
highlight, startEdit, setEditValue, commitEdit, cancelEdit and getItemState.
Mutation acceptance methods return boolean; disabled/readonly prevent mutation.
Individual disabled items cannot be removed/edited and survive clear-all.
External collection changes cancel stale edits/highlights rather than overwriting
an item that has moved. Index distinguishes duplicate occurrences.

## Accessibility

Enter adds a draft or edits a highlighted item when editable. At the beginning
of the draft, Backspace first highlights the last enabled item; Backspace/Delete
then removes a highlight. Logical left/right navigate enabled items, respecting
RTL and caret position. Escape cancels item editing/highlight before an ancestor
dialog. Composition Enter never creates a tag. Direct remove buttons are native
keyboard targets; focus returns to the entry input after removal.

translations supplies clear/delete names, input name, added/pasted/selected/
edited/updated/deleted/invalid announcements and cleared text. Root contains one
polite live region; no translation catalog is shipped.

## Forms and validation

Render one HiddenInput. It submits JSON such as `["React","a,b"]`, not comma
joining, and represents committed values only. The visible draft is unnamed.
The proxy remains native-validatable, redirects invalid focus to Input, and
required validity checks collection length. Disabled omits submission; readonly
does not. Native reset restores uncontrolled initial values and draft, including
external form association; prevented reset and controlled values are respected.

## Suggestions

Inside TagsInput, call useTagsInputCombobox and spread its bindings on the nested
Combobox.Root along with application-owned options/loading/filtering. Keep
TagsInput.Control/Input; they compose the existing Combobox reference, input
keyboard and ARIA behavior. Use standard Combobox Portal/Content/Listbox/Item/
Empty/Loading. Portalled content remains an inside blur branch. The bindings own
collection/draft arbitration; do not override them or name the Combobox proxy.
Suggestion fetching and async validation remain application-owned.

## Data Attributes

Slots follow tags-input and part suffixes. Root exposes disabled, readonly,
invalid and empty; ItemPreview exposes highlighted/disabled and hidden editing
state. ItemInput is visible only for its editing index. Use these attributes in
the styled layer, not application behavior selectors.

Qualification includes atomic acceptance, duplicated occurrences, native forms,
controlled transitions, IME and shared-input suggestions; manual AT and physical
IME/device checks must be recorded independently.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
# Composition and indexed IDs

Root, RootProvider, Label, Control, Input, Item, ItemPreview, ItemText and
ItemInput support `asChild` and `render`, alongside the action triggers. Supply
one host for `asChild` and forward props/ref from custom components. Inputs must
remain native inputs, labels native labels, and actions native buttons.

`ItemContext` renders current `{ index, value, id, editing, highlighted, disabled }`
inside its Item. Customize IDs with `ids.item(index)`, `ids.itemInput(index)` and
`ids.itemDeleteTrigger(index)`; existing root IDs and generated defaults remain.
Do not use a value alone as identity when duplicate occurrences are enabled.
