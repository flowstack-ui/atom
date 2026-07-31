import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(
  await readFile(resolve(packageRoot, "package.json"), "utf8"),
);

export const componentIds = Object.keys(packageJson.exports)
  .filter((key) => key.startsWith("./"))
  .map((key) => key.slice(2))
  .sort();

const additionalUnitTests = {
  "context-menu": ["menu-interaction"],
  form: ["form-integration", "form-proxy-validity", "form-validation-behavior"],
  "hover-card": ["hover-card-interaction"],
  image: ["image-interaction"],
  menu: ["menu-interaction"],
  popover: ["popover-focus"],
  toast: ["toast-interaction"],
  tooltip: ["tooltip-touch"],
  "tree-grid": ["tree-grid-interaction"],
};

const browserTests = {
  accordion: ["disclosure-presence.spec.ts"],
  "alert-dialog": ["modal-containment.spec.ts", "modal-containment.mobile.spec.ts"],
  combobox: [
    "outside-interaction.spec.ts",
    "outside-interaction.mobile.spec.ts",
    "positioned-overlays.spec.ts",
    "positioned-overlays.mobile.spec.ts",
  ],
  collapsible: ["disclosure-presence.spec.ts"],
  "context-menu": [
    "context-menu-reinvocation.spec.ts",
    "outside-interaction.spec.ts",
    "outside-interaction.mobile.spec.ts",
    "mobile-gesture-consolidation.mobile.spec.ts",
  ],
  dialog: ["modal-containment.spec.ts", "modal-containment.mobile.spec.ts"],
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
  select: [
    "outside-interaction.spec.ts",
    "outside-interaction.mobile.spec.ts",
    "positioned-overlays.spec.ts",
    "positioned-overlays.mobile.spec.ts",
  ],
  slider: ["mobile-gesture-consolidation.mobile.spec.ts"],
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
  const unitNames = [componentId, ...(additionalUnitTests[componentId] ?? [])];
  const unit = [];

  for (const name of unitNames) {
    const path = resolve(packageRoot, "test", "primitives", `${name}.test.mjs`);
    if (await exists(path)) unit.push(path);
  }

  const browser = (browserTests[componentId] ?? []).map((name) =>
    resolve(packageRoot, "test", "browser", name),
  );

  return { browser, unit };
}
