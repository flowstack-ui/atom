import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const packageRoot = new URL("..", import.meta.url);
const publicSubpaths = [
  "action-delegate",
  "selection",
  "table-of-contents",
  "qr-code",
  "editable",
  "tags-input",
  "native-select",
  "marquee",
  "action-bar",
  "overlay-manager",
  "floating-panel",
  "accordion",
  "alert-dialog",
  "app-bar",
  "aspect-ratio",
  "combobox",
  "avatar",
  "badge",
  "breadcrumb",
  "bottom-navigation",
  "button",
  "calendar",
  "carousel",
  "checkbox",
  "checkbox-card",
  "checkbox-group",
  "clipboard",
  "collapsible",
  "collection",
  "color-picker",
  "context-menu",
  "data-grid",
  "date-input",
  "date-picker",
  "dialog",
  "divider",
  "direction",
  "drawer",
  "drag-drop",
  "dropdown-menu",
  "field",
  "fieldset",
  "feed",
  "file-upload",
  "form",
  "hooks",
  "hover-card",
  "highlight",
  "image",
  "input",
  "label",
  "link",
  "list",
  "listbox",
  "menu",
  "menubar",
  "modal",
  "multi-select",
  "navigation-menu",
  "nav-list",
  "number-input",
  "pin-input",
  "password-toggle-field",
  "pagination",
  "popover",
  "portal",
  "pressable",
  "progress",
  "radio-group",
  "radio-card",
  "rating",
  "reorder",
  "scroll-area",
  "skip-link",
  "select",
  "sidebar",
  "slider",
  "splitter",
  "download-trigger",
  "switch",
  "swipeable-item",
  "tabs",
  "steps",
  "table",
  "tree",
  "tree-grid",
  "textarea",
  "toggle",
  "toggle-group",
  "toast",
  "toolbar",
  "tooltip",
  "virtualizer",
  "visually-hidden",
];
const namespaceBySubpath = {
  "bottom-navigation": "BottomNavigation",
  "checkbox-group": "CheckboxGroup",
  "context-menu": "ContextMenu",
  "dropdown-menu": "DropdownMenu",
  "alert-dialog": "AlertDialog",
  "file-upload": "FileUpload",
  "hover-card": "HoverCard",
  "navigation-menu": "NavigationMenu",
  "nav-list": "NavList",
  "number-input": "NumberInput",
  "pin-input": "PinInput",
  "radio-group": "RadioGroup",
  "toggle-group": "ToggleGroup",
};

function namespaceNameForSubpath(subpath) {
  if (namespaceBySubpath[subpath]) return namespaceBySubpath[subpath];
  return subpath
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("");
}

async function listSourceFiles(dirUrl) {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dirUrl);

    if (entry.isDirectory()) {
      files.push(...await listSourceFiles(entryUrl));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(entryUrl);
    }
  }

  return files;
}

export {
  assert,
  readFile,
  readdir,
  path,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
  publicSubpaths,
  namespaceBySubpath,
  namespaceNameForSubpath,
  listSourceFiles,
};
