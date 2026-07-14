import { Collapsible } from "@flowstack-ui/atom/collapsible";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import { useContext, type Dispatch, type SetStateAction } from "react";
import {
  collectDomEvidence,
  EMPTY_DOM_EVIDENCE_VALUE,
  formatDomEvidenceAttribute,
  isPlaygroundEvidenceAttribute,
} from "./domEvidence";
import { DomEvidenceRevisionContext } from "./domEvidenceRevision";

export type AnatomyRowCategory =
  | "presence"
  | "identity"
  | "attributes"
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

const liveDomEvidenceRow = Symbol("liveDomEvidenceRow");

type InternalAnatomyRow = AnatomyRow & {
  [liveDomEvidenceRow]?: true;
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
  attributes: 2,
  composition: 3,
  state: 4,
  behavior: 5,
  aria: 6,
  data: 7,
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
const textBearingTags = new Set([
  "caption",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "td",
  "th",
]);

function getRowKey(row: AnatomyRow) {
  return row.label.toLowerCase();
}

function getRowValue(row: AnatomyRow) {
  if (row.value === "yes") return "true";
  if (row.value === "no") return "false";
  return row.value;
}

function isHiddenRow(row: InternalAnatomyRow) {
  const label = getRowKey(row);

  if (hiddenLabels.has(label)) return true;
  if (isPlaygroundEvidenceAttribute(label)) return true;
  if (!row[liveDomEvidenceRow] && (row.value === "" || row.value === "-")) return true;

  return false;
}

function getTag(rows: AnatomyRow[]) {
  return rows.find((row) => getRowKey(row) === "tag")?.value ?? "-";
}

function getLiveElement(selector?: string) {
  if (!selector || typeof document === "undefined") return null;
  return document.querySelector(selector);
}

function getLiveRows(selector?: string): InternalAnatomyRow[] {
  const element = getLiveElement(selector);
  if (!element) return [];

  const evidence = collectDomEvidence(element);
  const tag = evidence.tag;
  const baseRows: AnatomyRow[] = [
    { label: "tag", value: tag, category: "identity" },
  ];

  if (evidence.id !== EMPTY_DOM_EVIDENCE_VALUE) {
    baseRows.push({ label: "id", value: evidence.id, category: "identity" });
  }

  if (textBearingTags.has(tag)) {
    if (evidence.text !== EMPTY_DOM_EVIDENCE_VALUE) {
      baseRows.push({ label: "Text", value: evidence.text, category: "state" });
    }
  }

  if (
    evidence.value !== EMPTY_DOM_EVIDENCE_VALUE &&
    (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLOptionElement
    )
  ) {
    baseRows.push({ label: "Value", value: evidence.value, category: "state" });
  }

  const attributeRows: InternalAnatomyRow[] = [
    ...evidence.attributes.map((attribute) => ({
      [liveDomEvidenceRow]: true as const,
      label: attribute.name,
      value: attribute.value,
      category: "attributes" as const,
    })),
    ...evidence.aria.map((attribute) => ({
      [liveDomEvidenceRow]: true as const,
      label: attribute.name,
      value: attribute.value,
      category: "aria" as const,
    })),
    ...evidence.data.map((attribute) => ({
      [liveDomEvidenceRow]: true as const,
      label: attribute.name,
      value: attribute.value,
      category: "data" as const,
    })),
  ];

  return [
    ...baseRows,
    ...attributeRows,
  ];
}

function getDisplayCategory(row: InternalAnatomyRow): (typeof visibleGroupOrder)[number] | null {
  const label = getRowKey(row);

  if (row[liveDomEvidenceRow] && row.category === "attributes") return "attributes";
  if (row[liveDomEvidenceRow] && row.category === "aria") return "aria";
  if (row[liveDomEvidenceRow] && row.category === "data") return "data";
  if (label.includes("match")) return "behavior";
  if (label === "escape closes" || label === "close on select" || label === "backdrop closes") {
    return "closing";
  }
  if (label.startsWith("block ")) return "blocking";
  if (label === "id" || label === "ref target") return "identity";
  if (row.category === "attributes" || row.category === "aria" || row.category === "data") {
    return null;
  }
  if (row.category === "identity") {
    return label === "id" || label === "ref target" ? "identity" : null;
  }

  return row.category ?? "state";
}

function formatAttributeRow(row: AnatomyRow) {
  return formatDomEvidenceAttribute({ name: row.label, value: row.value });
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

function buildDisplayGroups(rows: InternalAnatomyRow[]): AnatomyDisplayGroup[] {
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
  useContext(DomEvidenceRevisionContext);

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

function AnatomyGroups({ rows, startToneIndex = 0 }: { rows: InternalAnatomyRow[]; startToneIndex?: number }) {
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
