import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(
  await readFile(resolve(packageRoot, "package.json"), "utf8"),
);

export const componentIds = Object.keys(packageJson.exports)
  .filter((key) => /^\.\/[a-z][a-z0-9-]*$/.test(key))
  .map((key) => key.slice(2))
  .sort();

// Use the longest public owner so checkbox-card is not silently included in
// checkbox, or tree-grid in tree. Shared suites remain explicit below.
const ownersByLength = [...componentIds].sort((a, b) => b.length - a.length);
function ownsFile(componentId, name, suffix) {
  if (!name.endsWith(suffix)) return false;
  const stem = name.slice(0, -suffix.length);
  return ownersByLength.find((id) => stem === id || stem.startsWith(`${id}-`) || stem.startsWith(`${id}.`)) === componentId;
}

const additionalUnitTests = {
  collapsible: ["collapsible-parity", "disclosure-measurement"],
  "context-menu": ["menu-interaction"],
  form: ["form-integration", "form-proxy-validity", "form-validation-behavior"],
  "hover-card": ["hover-card-interaction"],
  image: ["image-interaction"],
  "pin-input": ["pin-migration-regressions", "form-proxy-validity", "form-validation-behavior"],
  switch: ["switch-interaction"],
  menu: ["menu-interaction"],
  popover: ["popover-focus"],
  toast: ["toast-interaction"],
  tooltip: ["tooltip-touch"],
  "tree-grid": ["tree-grid-interaction"],
};

// Cross-owner integration suites cannot be discovered from their filename.
// Keep the exercised owners explicit so a focused green result includes their
// shared form, reset, validation, and disclosure contracts.
const sharedUnitOwners = {
  "disclosure-measurement": ["accordion", "collapsible"],
  "date-form": ["date-input", "date-picker", "field"],
  "form-family-lifecycle": ["form", "field", "fieldset", "input"],
  "form-integration": ["checkbox", "checkbox-group", "field", "fieldset", "input", "radio-group", "switch"],
  "form-proxy-validity": ["checkbox", "combobox", "file-upload", "pin-input", "radio-group", "rating", "select", "switch"],
  "form-validation-behavior": ["checkbox", "checkbox-group", "combobox", "field", "fieldset", "file-upload", "form", "input", "number-input", "pin-input", "password-toggle-field", "radio-group", "rating", "select", "switch", "textarea"],
};

const browserTests = {
  "table-of-contents": ["table-of-contents.spec.ts"],
  "qr-code": ["qr-code.spec.ts"],
  accordion: ["disclosure-presence.spec.ts"],
  carousel: ["carousel.spec.ts", "carousel.mobile.spec.ts"],
  "color-picker": ["color-picker.spec.ts", "color-picker.mobile.spec.ts"],
  "alert-dialog": ["modal-containment.spec.ts", "modal-containment.mobile.spec.ts"],
  combobox: [
    "outside-interaction.spec.ts",
    "outside-interaction.mobile.spec.ts",
    "positioned-overlays.spec.ts",
    "positioned-overlays.mobile.spec.ts",
  ],
  collapsible: ["disclosure-presence.spec.ts", "collapsible-parity.spec.ts"],
  "context-menu": [
    "context-menu-reinvocation.spec.ts",
    "outside-interaction.spec.ts",
    "outside-interaction.mobile.spec.ts",
    "mobile-gesture-consolidation.mobile.spec.ts",
  ],
  dialog: ["modal-containment.spec.ts", "modal-containment.mobile.spec.ts"],
  "drag-drop": ["reorder.spec.ts", "reorder.mobile.spec.ts"],
  "dropdown-menu": [
    "outside-interaction.spec.ts",
    "outside-interaction.mobile.spec.ts",
    "positioned-overlays.spec.ts",
    "positioned-overlays.mobile.spec.ts",
  ],
  drawer: ["modal-containment.spec.ts", "modal-containment.mobile.spec.ts"],
  feed: ["feed.spec.ts"],
  menu: [
    "context-menu-reinvocation.spec.ts",
    "outside-interaction.spec.ts",
    "outside-interaction.mobile.spec.ts",
    "modal-containment.spec.ts",
    "modal-containment.mobile.spec.ts",
    "positioned-overlays.spec.ts",
    "positioned-overlays.mobile.spec.ts",
  ],
  "multi-select": ["outside-interaction.spec.ts", "outside-interaction.mobile.spec.ts"],
  popover: [
    "outside-interaction.spec.ts",
    "outside-interaction.mobile.spec.ts",
    "modal-containment.spec.ts",
    "modal-containment.mobile.spec.ts",
    "positioned-overlays.spec.ts",
    "positioned-overlays.mobile.spec.ts",
  ],
  rating: ["mobile-gesture-consolidation.mobile.spec.ts"],
  reorder: ["reorder.spec.ts", "reorder.mobile.spec.ts"],
  select: [
    "outside-interaction.spec.ts",
    "outside-interaction.mobile.spec.ts",
    "positioned-overlays.spec.ts",
    "positioned-overlays.mobile.spec.ts",
  ],
  slider: ["mobile-gesture-consolidation.mobile.spec.ts"],
  switch: ["switch.spec.ts"],
  "swipeable-item": ["swipeable-item.spec.ts", "mobile-gesture-consolidation.mobile.spec.ts"],
  toast: ["toast-placement.mobile.spec.ts"],
  tooltip: ["mobile-gesture-consolidation.mobile.spec.ts"],
};

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function componentTestPaths(componentId) {
  if (!componentIds.includes(componentId)) throw new Error(`Unknown component: ${componentId}`);
  const unitFiles = await readdir(resolve(packageRoot, "test", "primitives"));
  const browserFiles = await readdir(resolve(packageRoot, "test", "browser"));
  const unitNames = [...new Set([
    componentId,
    ...(additionalUnitTests[componentId] ?? []),
    ...Object.entries(sharedUnitOwners).filter(([, owners]) => owners.includes(componentId)).map(([suite]) => suite),
    ...unitFiles.filter((name) => ownsFile(componentId, name, ".test.mjs")).map((name) => name.slice(0, -9)),
  ])].sort();
  const unit = [];

  for (const name of unitNames) {
    const path = resolve(packageRoot, "test", "primitives", `${name}.test.mjs`);
    if (await exists(path)) unit.push(path);
  }

  const browser = [...new Set([
    ...(browserTests[componentId] ?? []),
    ...browserFiles.filter((name) => ownsFile(componentId, name, ".spec.ts")),
  ])].sort().map((name) =>
    resolve(packageRoot, "test", "browser", name),
  );

  return { browser, unit };
}
