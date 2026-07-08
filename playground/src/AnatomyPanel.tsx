import { Collapsible } from "@flowstack-ui/atom/collapsible";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import type { Dispatch, SetStateAction } from "react";

export type AnatomyRowCategory =
  | "presence"
  | "identity"
  | "composition"
  | "state"
  | "data"
  | "aria"
  | "behavior";

export type AnatomyRow = {
  category?: AnatomyRowCategory;
  label: string;
  value: string;
};

export type AnatomyRowGroup = {
  selector?: string;
  title: string;
  rows: AnatomyRow[];
};

export type AnatomySection = {
  inactive?: boolean;
  groups?: AnatomyRowGroup[];
  rows?: AnatomyRow[];
  selector?: string;
  summary: string;
  title: string;
};

const categoryOrder: Record<AnatomyRowCategory, number> = {
  presence: 0,
  identity: 1,
  composition: 2,
  state: 3,
  behavior: 4,
  aria: 5,
  data: 6,
};

type AnatomyDisplayGroup = {
  kind: "rows";
  rows: AnatomyRow[];
  title: string;
} | {
  kind: "raw";
  rows: AnatomyRow[];
  tag?: string;
  title: string;
};

const visibleGroupOrder = [
  "presence",
  "identity",
  "state",
  "closing",
  "blocking",
  "composition",
  "behavior",
  "attributes",
  "aria",
  "data",
] as const;

const groupTitles: Record<(typeof visibleGroupOrder)[number], string> = {
  presence: "Presence",
  identity: "Identity",
  state: "State",
  closing: "Closing",
  blocking: "Blocking",
  composition: "Composition",
  behavior: "Behavior",
  attributes: "Attributes",
  aria: "ARIA",
  data: "Data",
};

const hiddenLabels = new Set(["class", "props", "ref", "tag"]);
const hiddenRawAttributes = new Set([
  "data-playground-inspect",
]);
const hiddenNativeAttributes = new Set([
  "class",
  "id",
  "style",
  "value",
]);
const emptyValues = new Set(["", "none", "not rendered", "-"]);
const nativeAttributeLabels = new Set([
  "accept",
  "checked",
  "disabled",
  "form",
  "for",
  "hidden",
  "href",
  "maxlength",
  "minlength",
  "multiple",
  "name",
  "placeholder",
  "rel",
  "required",
  "readonly",
  "role",
  "rows",
  "selected",
  "tabindex",
  "tabindex attr",
  "target",
  "title",
  "type",
  "value",
]);
const visibleFalseRawAttributes = new Set([
  "aria-checked",
  "aria-expanded",
  "aria-pressed",
]);
const booleanRawAttributes = new Set([
  "checked",
  "data-active",
  "data-checked",
  "data-disabled",
  "disabled",
  "hidden",
  "multiple",
  "readonly",
  "required",
  "selected",
]);
const textBearingTags = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
]);

function getRowKey(row: AnatomyRow) {
  const label = row.label.toLowerCase();
  if (label === "tabindex attr") return "tabindex";
  return label;
}

function getRowValue(row: AnatomyRow) {
  if (row.value === "yes") return "true";
  if (row.value === "no") return "false";
  return row.value;
}

function isRawAttribute(row: AnatomyRow) {
  const label = getRowKey(row);
  return label.startsWith("aria-") ||
    label.startsWith("data-") ||
    (row.category === "identity" && nativeAttributeLabels.has(label)) ||
    (row.category === "aria" && (label === "role" || label === "tabindex attr"));
}

function isEmptyValue(value: string) {
  return emptyValues.has(value.toLowerCase());
}

function isHiddenRow(row: AnatomyRow) {
  const label = getRowKey(row);
  const value = row.value.toLowerCase();
  const rawAttribute = isRawAttribute(row);

  if (hiddenLabels.has(label)) return true;
  if (hiddenRawAttributes.has(label)) return true;
  if (
    rawAttribute &&
    label !== "role" &&
    !visibleFalseRawAttributes.has(label) &&
    (isEmptyValue(row.value) || value === "no" || value === "false")
  ) {
    return true;
  }
  if (!rawAttribute && (row.value === "" || row.value === "-")) return true;

  return false;
}

function getTag(rows: AnatomyRow[]) {
  return rows.find((row) => getRowKey(row) === "tag")?.value ?? "-";
}

function getLiveElement(selector?: string) {
  if (!selector || typeof document === "undefined") return null;
  return document.querySelector(selector);
}

function getDirectText(element: Element) {
  const text = Array.from(element.childNodes)
    .filter((node) => node.nodeType === 3)
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

function getLiveRows(selector?: string): AnatomyRow[] {
  const element = getLiveElement(selector);
  if (!element) return [];

  const tag = element.tagName.toLowerCase();
  const baseRows: AnatomyRow[] = [
    { label: "tag", value: tag, category: "identity" },
  ];

  if (element.id) {
    baseRows.push({ label: "id", value: element.id, category: "identity" });
  }

  if (textBearingTags.has(tag)) {
    const text = getDirectText(element);
    if (text) {
      baseRows.push({ label: "Text", value: text, category: "state" });
    }
  }

  const attributeRows: AnatomyRow[] = [];

  Array.from(element.attributes).forEach((attribute) => {
    if (hiddenRawAttributes.has(attribute.name)) return [];
    if (hiddenNativeAttributes.has(attribute.name)) return [];

    const row = {
      label: attribute.name,
      value: attribute.value === "" ? "yes" : attribute.value,
    };

    if (attribute.name.startsWith("aria-")) {
      attributeRows.push({ ...row, category: "aria" });
      return;
    }

    if (attribute.name.startsWith("data-")) {
      attributeRows.push({ ...row, category: "data" });
      return;
    }

    attributeRows.push({ ...row, category: "identity" });
  });

  return [
    ...baseRows,
    ...attributeRows,
  ];
}

function getDisplayCategory(row: AnatomyRow): (typeof visibleGroupOrder)[number] | null {
  const label = getRowKey(row);

  if (label.includes("match")) return "behavior";
  if (label === "escape closes" || label === "close on select" || label === "backdrop closes") {
    return "closing";
  }
  if (label.startsWith("block ")) return "blocking";
  if (label === "id" || label === "ref target") return "identity";
  if (label.startsWith("aria-")) return "aria";
  if (label.startsWith("data-")) return "data";
  if (nativeAttributeLabels.has(label) && row.category === "identity") {
    return "attributes";
  }
  if (row.category === "aria" && (label === "role" || label === "tabindex attr")) {
    return "attributes";
  }
  if (row.category === "data") return "data";
  if (row.category === "identity") {
    return label === "id" || label === "ref target" ? "identity" : null;
  }

  return row.category ?? "state";
}

function formatAttributeRow(row: AnatomyRow) {
  const label = row.label === "tabindex attr" ? "tabindex" : row.label;
  const value = getRowValue(row);

  if (row.value === "yes" && (label.startsWith("data-") || booleanRawAttributes.has(label))) return label;
  if (booleanRawAttributes.has(label) && value === "true") return label;
  return `${label}="${value}"`;
}

function getDisplayLabel(row: AnatomyRow, groupTitle: string) {
  const label = row.label;
  const key = getRowKey(row);

  if (groupTitle === "Composition" && key === "composition") return "Mode";
  if (groupTitle === "Closing") {
    if (key === "escape closes") return "Escape";
    if (key === "backdrop closes") return "Backdrop";
    if (key === "close on select") return "Select";
  }
  if (groupTitle === "Blocking") {
    return label.replace(/^Block\s+/i, "").replace(/\s+event$/i, "");
  }

  return label;
}

function buildDisplayGroups(rows: AnatomyRow[]): AnatomyDisplayGroup[] {
  const buckets = new Map<(typeof visibleGroupOrder)[number], AnatomyRow[]>();
  const groups: AnatomyDisplayGroup[] = [];
  const tag = getTag(rows);

  rows.forEach((row) => {
    if (isHiddenRow(row)) return;

    const category = getDisplayCategory(row);
    if (!category) return;

    const currentRows = buckets.get(category) ?? [];
    currentRows.push(row);
    buckets.set(category, currentRows);
  });

  visibleGroupOrder.forEach((category) => {
    const rowsForCategory = buckets.get(category);
    const rawCategory = category === "attributes" || category === "aria" || category === "data";
    if (!rowsForCategory?.length && !rawCategory) return;

    const dedupedRows = Array.from(
      (rowsForCategory ?? []).reduce((rowMap, row) => {
        rowMap.set(getRowKey(row), row);
        return rowMap;
      }, new Map<string, AnatomyRow>()).values(),
    );

    const sortedRows = dedupedRows.sort((first, second) => {
      const firstOrder = categoryOrder[first.category ?? "state"];
      const secondOrder = categoryOrder[second.category ?? "state"];

      if (firstOrder !== secondOrder) return firstOrder - secondOrder;
      return first.label.localeCompare(second.label);
    });

    if (rawCategory) {
      groups.push({
        kind: "raw",
        rows: sortedRows,
        tag: category === "attributes" ? tag : undefined,
        title: groupTitles[category],
      });
      return;
    }

    groups.push({
      kind: "rows",
      rows: sortedRows,
      title: groupTitles[category],
    });
  });

  return groups;
}

export function AnatomyPanel({
  footer,
  onOpenGroupsChange,
  openGroups,
  sections,
}: {
  footer: string;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  openGroups: Record<string, boolean>;
  sections: AnatomySection[];
}) {
  const setGroupOpen = (title: string, open: boolean) => {
    onOpenGroupsChange((currentGroups) => ({
      ...currentGroups,
      [title]: open,
    }));
  };

  return (
    <div className="scenario-controls">
      <div className="parts-panel">
        <ScrollArea.Root className="parts-scroll" orientation="vertical">
          <ScrollArea.Viewport className="parts-scroll-viewport" focusable aria-label="Anatomy parts">
            {sections.map((section) => (
              <Collapsible.Root
                className="part-group"
                key={section.title}
                open={openGroups[section.title] ?? false}
                onOpenChange={(open) => setGroupOpen(section.title, open)}
                data-inactive={section.inactive || undefined}
              >
                <Collapsible.Trigger className="part-group-trigger">
                  <span className="part-group-icon" aria-hidden="true">
                    {openGroups[section.title] ? "▾" : "▸"}
                  </span>
                  <span className="part-group-title">{section.title}</span>
                  {openGroups[section.title] ? null : (
                    <span className="part-group-summary">{section.summary}</span>
                  )}
                </Collapsible.Trigger>
                <Collapsible.Content className="part-group-body">
                  {section.groups?.map((group) => (
                    <div className="parts-subsection" key={group.title}>
                      <h3 data-tone="plain">{group.title}</h3>
                      <AnatomyGroups
                        startToneIndex={1}
                        rows={[
                          ...group.rows,
                          ...getLiveRows(group.selector),
                        ]}
                      />
                    </div>
                  ))}
                  {section.rows ? (
                    <AnatomyGroups
                      rows={[
                        ...section.rows,
                        ...getLiveRows(section.selector),
                      ]}
                    />
                  ) : null}
                </Collapsible.Content>
              </Collapsible.Root>
            ))}
          </ScrollArea.Viewport>
        </ScrollArea.Root>
        <div className="panel-footer">{footer}</div>
      </div>
    </div>
  );
}

function AnatomyGroups({ rows, startToneIndex = 0 }: { rows: AnatomyRow[]; startToneIndex?: number }) {
  const displayGroups = buildDisplayGroups(rows);

  return (
    <div className="parts-groups">
      {displayGroups.map((group, index) => (
        <section className="parts-value-group" data-tone={(index + startToneIndex) % 2 === 0 ? "plain" : "muted"} key={group.title}>
          <h4 className="parts-value-group-title">
            <span>{group.title}</span>
            {group.kind === "raw" && group.tag ? <code>{group.tag}</code> : null}
          </h4>
          {group.kind === "raw" && group.rows.length > 0 ? (
            <pre className="parts-attribute-list">
              {group.rows.map(formatAttributeRow).join("\n")}
            </pre>
          ) : group.kind === "raw" ? (
            <pre className="parts-attribute-list">-</pre>
          ) : (
            <dl className="parts-grid">
              {group.rows.map((row) => (
                <div key={`${row.category ?? "state"}-${row.label}`}>
                  <dt>{getDisplayLabel(row, group.title)}</dt>
                  <dd>{getRowValue(row)}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}
