import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Field,
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "../../dist/index.js";

test("Select primitives render combobox trigger and option state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SelectRoot,
      {
        defaultValue: "pro",
        defaultOpen: true,
        required: true,
      },
      React.createElement(
        SelectTrigger,
        {
          className: "select-trigger-class",
          "aria-label": "Plan",
          title: "Choose plan",
          "data-testid": "select-trigger",
          role: "button",
        },
        "Plan",
      ),
      React.createElement(
        SelectItem,
        { value: "pro", label: "Pro", className: "select-item-class" },
        "Pro",
      ),
      React.createElement(
        SelectItem,
        { value: "enterprise", disabled: true },
        "Enterprise",
      ),
    ),
  );

  assert.match(html, /role="combobox"/);
  assert.match(html, /title="Choose plan"/);
  assert.match(html, /data-testid="select-trigger"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-haspopup="listbox"/);
  assert.match(html, /aria-controls="[^"]+"/);
  assert.match(html, /aria-label="Plan"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /data-slot="select-trigger"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /class="select-trigger-class"/);
  assert.match(html, /role="option"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /data-slot="select-item"/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-value="pro"/);
  assert.match(html, /class="select-item-class"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-disabled=""/);
});

test("Select exposes value, item text, indicator, group, label, viewport, and separator parts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SelectRoot,
      { defaultValue: "pro", defaultOpen: true, name: "plan" },
      React.createElement(
        SelectTrigger,
        { "aria-label": "Plan" },
        React.createElement(SelectValue, { placeholder: "Choose plan" }),
        React.createElement(SelectIcon, null, "v"),
      ),
      React.createElement(
        SelectContent,
        { disablePortal: true },
        React.createElement(
          SelectViewport,
          null,
          React.createElement(
            SelectGroup,
            null,
            React.createElement(SelectLabel, null, "Plans"),
            React.createElement(
              SelectItem,
              { value: "pro" },
              React.createElement(SelectItemText, null, "Pro"),
              React.createElement(SelectItemIndicator, null, "check"),
            ),
            React.createElement(SelectSeparator, null),
          ),
        ),
      ),
    ),
  );

  assert.match(html, /data-slot="select-value"/);
  assert.match(html, />Pro<\/span>/);
  assert.match(html, /data-slot="select-icon"/);
  assert.match(html, /data-slot="select-viewport"/);
  assert.match(html, /data-slot="select-group"/);
  assert.match(html, /role="group"/);
  assert.match(html, /data-slot="select-label"/);
  assert.match(html, /data-slot="select-item-text"/);
  assert.match(html, /data-slot="select-item-indicator"/);
  assert.match(html, /data-slot="select-separator"/);
  assert.match(html, /role="separator"/);
  assert.match(html, /<select[^>]*name="plan"/);
  assert.match(html, /<option value="pro" selected="">Pro<\/option>/);
});

test("Select value resolves item text before the listbox mounts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SelectRoot,
      { defaultValue: "pro" },
      React.createElement(
        SelectTrigger,
        { "aria-label": "Plan" },
        React.createElement(SelectValue, null),
      ),
      React.createElement(
        SelectContent,
        { disablePortal: true },
        React.createElement(
          SelectViewport,
          null,
          React.createElement(
            SelectItem,
            { value: "pro" },
            React.createElement(SelectItemText, null, "Pro"),
            React.createElement(SelectItemIndicator, null, "check"),
          ),
        ),
      ),
    ),
  );

  assert.match(html, /data-slot="select-value"/);
  assert.match(html, />Pro<\/span>/);
  assert.doesNotMatch(html, />pro<\/span>/);
  assert.doesNotMatch(html, /role="listbox"/);
});

test("Select trigger asChild preserves child contents without nesting the child", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SelectRoot,
      { defaultValue: "pro" },
      React.createElement(
        SelectTrigger,
        { asChild: true, className: "select-trigger-class" },
        React.createElement(
          "span",
          { className: "custom-trigger" },
          React.createElement(SelectValue, null),
          React.createElement(SelectIcon, null, "v"),
        ),
      ),
      React.createElement(
        SelectContent,
        { disablePortal: true },
        React.createElement(
          SelectItem,
          { value: "pro" },
          React.createElement(SelectItemText, null, "Pro"),
        ),
      ),
    ),
  );

  assert.match(html, /^<span /);
  assert.match(html, /class="custom-trigger select-trigger-class"/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /data-slot="select-trigger"/);
  assert.match(html, />Pro<\/span><span aria-hidden="true" data-slot="select-icon">v<\/span><\/span>$/);
  assert.doesNotMatch(html, /<span class="custom-trigger">/);
});

test("Select native form control mirrors disabled and form association", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SelectRoot,
      { defaultValue: "pro", name: "plan", form: "checkout", disabled: true },
      React.createElement(SelectTrigger, { id: "plan-trigger" }, "Plan"),
      React.createElement(SelectItem, { value: "pro" }, "Pro"),
    ),
  );

  assert.match(html, /id="plan-trigger"/);
  assert.match(html, /<select/);
  assert.match(html, /name="plan"/);
  assert.match(html, /value="pro"/);
  assert.match(html, /form="checkout"/);
  assert.match(html, /disabled=""/);
});

test("Select integrates with Field labels, descriptions, and state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Field.Root,
      { id: "plan-field", required: true, disabled: true },
      React.createElement(Field.Label, null, "Plan"),
      React.createElement(Field.Description, null, "Choose a plan."),
      React.createElement(
        SelectRoot,
        { defaultValue: "pro", name: "plan" },
        React.createElement(
          SelectTrigger,
          { className: "select-trigger-class" },
          React.createElement(SelectValue, null),
        ),
        React.createElement(
          SelectItem,
          { value: "pro" },
          React.createElement(SelectItemText, null, "Pro"),
        ),
      ),
    ),
  );

  assert.match(html, /id="plan-field-control"/);
  assert.match(html, /aria-labelledby="plan-field-label"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /<select[^>]*disabled=""/);
  assert.match(html, /<select[^>]*name="plan"/);
  assert.match(html, /<option value="pro" selected="">Pro<\/option>/);
});

test("Select explicit trigger labels override Field label wiring", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Field.Root,
      { id: "plan-field" },
      React.createElement(Field.Label, null, "Plan"),
      React.createElement(
        SelectRoot,
        { defaultValue: "pro" },
        React.createElement(
          SelectTrigger,
          { "aria-label": "Subscription plan" },
          React.createElement(SelectValue, null),
        ),
        React.createElement(
          SelectItem,
          { value: "pro" },
          React.createElement(SelectItemText, null, "Pro"),
        ),
      ),
    ),
  );

  assert.match(html, /aria-label="Subscription plan"/);
  assert.doesNotMatch(html, /aria-labelledby="plan-field-label"/);
});

test("SelectItem omits aria-labelledby until SelectItemText is mounted", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SelectRoot,
      { defaultValue: "pro" },
      React.createElement(SelectItem, { value: "pro" }, "Pro"),
    ),
  );

  assert.match(html, /role="option"/);
  assert.doesNotMatch(html, /aria-labelledby=/);
});

test("Select source keeps trigger-owned keyboard navigation and stable registrations", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/select/SelectRoot.tsx", packageRoot),
    "utf8",
  );
  const triggerSource = await readFile(
    new URL("src/primitives/select/SelectTrigger.tsx", packageRoot),
    "utf8",
  );
  const itemSource = await readFile(
    new URL("src/primitives/select/SelectItem.tsx", packageRoot),
    "utf8",
  );
  const itemTextSource = await readFile(
    new URL("src/primitives/select/SelectItemText.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /const ctx: SelectContextValue = useMemo/);
  assert.match(rootSource, /setHighlightedValue\(null\)/);
  assert.match(rootSource, /useCollection<string, HTMLElement, SelectItemData>\(\)/);
  assert.match(rootSource, /version: registryVersion/);
  assert.match(rootSource, /registerCollectionItem/);
  assert.doesNotMatch(rootSource, /compareDocumentPosition/);
  assert.match(rootSource, /registryVersion,/);
  assert.match(rootSource, /getEnabledItemValues/);
  assert.match(rootSource, /openHighlightIntent/);
  assert.match(rootSource, /clearOpenHighlightIntent/);
  assert.match(rootSource, /labelMapRef\.current\.set\(itemValue, label\)/);
  assert.match(rootSource, /collectStaticSelectItems\(children\)/);
  assert.match(rootSource, /child\.type === SelectItemText/);
  assert.match(rootSource, /staticItems\.get\(itemValue\)\?\.text/);
  assert.match(rootSource, /getCollectionItem\(itemValue\)\?\.data\.textValue/);
  assert.match(rootSource, /const mountedItems = getCollectionItems\(\)/);
  assert.match(rootSource, /return Array\.from\(staticItems\.keys\(\)\)/);
  assert.match(rootSource, /filter\(\(\[, item\]\) => !item\.disabled\)/);
  assert.match(rootSource, /disabled: disabled === true/);
  assert.doesNotMatch(rootSource, /labelMapRef\.current\.delete/);
  assert.match(triggerSource, /case "ArrowDown":/);
  assert.match(triggerSource, /const \{\s*disabled,\s*invalid,\s*readOnly,\s*fieldControlId,\s*fieldDescribedBy,\s*fieldLabelId,\s*getEnabledItemValues,/);
  assert.match(triggerSource, /"aria-describedby": ariaDescribedBy \?\? fieldDescribedBy/);
  assert.match(triggerSource, /onOpen\("current"\)/);
  assert.match(triggerSource, /onOpen\("last"\)/);
  assert.match(triggerSource, /onOpen\("first"\)/);
  assert.match(triggerSource, /if \(!isOpen\) \{/);
  assert.match(triggerSource, /getNextSelectHighlight\(values, currentValue, "next"\)/);
  assert.match(triggerSource, /case "Enter":/);
  assert.match(triggerSource, /ctxRef\.current = ctx/);
  assert.match(triggerSource, /onValueChange\(highlightedValue\)/);
  assert.match(triggerSource, /getSelectTypeaheadMatch\(\s*ctxRef\.current,\s*typeaheadBuffer\.current,\s*highlightedValue,\s*\)/s);
  assert.match(triggerSource, /return cloneAndMerge\(children, triggerProps\)/);
  assert.match(triggerSource, /renderElement\(render, "button", \{ \.\.\.triggerProps, children \}\)/);
  assert.doesNotMatch(triggerSource, /onKeyDown: composeEventHandlers\(onKeyDown, handleKeyDown\),\s*children,/);
  assert.doesNotMatch(triggerSource, /\},\s*\[ctx\]\s*,/);
  assert.match(itemSource, /ctx\.registerItem\(value, \{/);
  assert.match(itemSource, /const generatedId = useId\(\)/);
  assert.match(itemSource, /const itemId = `\$\{ctx\.selectId\}-option-\$\{generatedId\}`/);
  assert.match(itemSource, /disabled,/);
  assert.match(itemSource, /const registerText = useCallback/);
  assert.match(itemSource, /setHasItemText\(true\)/);
  assert.match(itemSource, /aria-labelledby=\{hasItemText \? textId : undefined\}/);
  assert.match(itemTextSource, /\}, \[children, ctx\.registerText\]\)/);
  assert.doesNotMatch(itemTextSource, /\}, \[children, ctx\]\)/);
  assert.doesNotMatch(itemSource, /\}, \[ctx, label, value\]\)/);
});

test("Select source avoids dead listbox keyboard handling and portal/scroll footguns", async () => {
  const contextSource = await readFile(
    new URL("src/primitives/select/context.ts", packageRoot),
    "utf8",
  );
  const listboxSource = await readFile(
    new URL("src/primitives/select/SelectListbox.tsx", packageRoot),
    "utf8",
  );
  const portalSource = await readFile(
    new URL("src/primitives/select/SelectPortal.tsx", packageRoot),
    "utf8",
  );
  const viewportSource = await readFile(
    new URL("src/primitives/select/SelectViewport.tsx", packageRoot),
    "utf8",
  );
  const scrollButtonSource = await readFile(
    new URL("src/primitives/select/SelectScrollButton.tsx", packageRoot),
    "utf8",
  );

  assert.match(contextSource, /viewportRef: RefObject<HTMLDivElement \| null>/);
  assert.match(contextSource, /isInsidePortal: boolean/);
  assert.doesNotMatch(listboxSource, /type KeyboardEventHandler/);
  assert.doesNotMatch(listboxSource, /onKeyDown=/);
  assert.match(listboxSource, /useClickAway\(\{/);
  assert.doesNotMatch(listboxSource, /document\.addEventListener\("pointerdown"/);
  assert.match(listboxSource, /disabled=\{disablePortal \|\| ctx\.isInsidePortal\}/);
  assert.match(listboxSource, /ctx\.openHighlightIntent/);
  assert.match(listboxSource, /ctx\.registryVersion/);
  assert.match(listboxSource, /ctx\.clearOpenHighlightIntent\(\)/);
  assert.match(portalSource, /ctx\.setInsidePortal\(true\)/);
  assert.match(portalSource, /\}, \[ctx\.setInsidePortal, disabled\]\)/);
  assert.doesNotMatch(portalSource, /\}, \[ctx, disabled\]\)/);
  assert.match(viewportSource, /composeRefs\(ctx\.viewportRef, ref\)/);
  assert.match(scrollButtonSource, /ctx\.viewportRef\.current \?\? ctx\.listboxRef\.current/);
});
