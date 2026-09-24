/** Native fields and nested widgets own their cursor/value navigation keys. */
export function ownsNavigationKey(target: EventTarget | null, key: string): boolean {
  if (!["Home", "End", "ArrowUp", "ArrowDown"].includes(key)) return false;
  if (!target || !("nodeType" in target) || target.nodeType !== 1) return false;
  return Boolean((target as Element).closest(
    'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="spinbutton"], [role="combobox"], [role="slider"], [role="listbox"], [role="tree"], [role="grid"], [role="tablist"], [role="radiogroup"]',
  ));
}
