import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const packageRoot = new URL("..", import.meta.url);
const publicSubpaths = [
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
  "checkbox",
  "checkbox-group",
  "collapsible",
  "collection",
  "context-menu",
  "data-grid",
  "dialog",
  "divider",
  "direction",
  "drawer",
  "dropdown-menu",
  "field",
  "fieldset",
  "feed",
  "file-upload",
  "form",
  "hooks",
  "hover-card",
  "input",
  "label",
  "list",
  "listbox",
  "menu",
  "menubar",
  "modal",
  "navigation-menu",
  "nav-list",
  "number-input",
  "otp-field",
  "password-toggle-field",
  "pagination",
  "popover",
  "portal",
  "pressable",
  "progress",
  "radio-group",
  "rating",
  "scroll-area",
  "skip-link",
  "select",
  "sidebar",
  "slider",
  "switch",
  "swipeable-item",
  "tabs",
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
  "otp-field": "OTPField",
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
