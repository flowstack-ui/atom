# CheckboxCard

Independent rich options using a native checkbox and whole-card label. Import `CheckboxCard` and `useCheckboxCard` from `@flowstack-ui/atom/checkbox-card`.

## Anatomy

Compose Root → HiddenInput + Control(Label, Description, Indicator). Render exactly one HiddenInput per Root. Root/RootProvider refs target the label; HiddenInput ref targets the input. Control, Label, Description and Indicator render spans; indicator is decorative. Context exposes checkbox controller state. Optional description relationships are registered automatically.

## API Reference

Root supports checked/defaultChecked/onCheckedChange, disabled/readOnly, required/invalid, name/value/form, validationBehavior, ids, native label props, asChild and render. Default checked is false and submitted value is on. ids accepts input/label/description. HiddenInput accepts native input props except owned state, identity and form properties. No extra input is generated. RootProvider uses value for the controller and inputValue for submission. `useCheckboxCard` shares Checkbox's state controller. Controlled values, including provider values, require application-owned reset.

## Accessibility

The input retains native Space/Tab behavior. Mixed state maps to indeterminate. Disabled omits submission; readOnly is focusable and submitted but cannot toggle. Consumer event cancellation is preserved. Input focus is available to the styled layer via focus-within/:has(:focus-visible).

Cards inside CheckboxGroup.Root automatically use unique value, selection, name/form, maximum-selection and availability state. Group required validates the collection, not every card. Wrap collections in Fieldset. Do not give cards competing controlled state inside a group.

Content must remain noninteractive phrasing content: no nested labels, links, buttons or other inputs. asChild/render on Root must preserve a label element. Use a content card with independent controls for record selection plus actions. Atom has no visual recipes.

## Data Attributes

Named parts expose `data-slot` for their anatomy. State-bearing parts expose
`data-state` and availability metadata for the styled owner; retain these when
using custom hosts. Data attributes do not replace the native input's checked,
disabled, required, or accessible naming semantics.
