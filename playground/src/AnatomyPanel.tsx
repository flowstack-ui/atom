import { Collapsible } from "@flowstack-ui/atom/collapsible";
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
  title: string;
  rows: AnatomyRow[];
};

export type AnatomySection = {
  inactive?: boolean;
  groups?: AnatomyRowGroup[];
  rows?: AnatomyRow[];
  summary: string;
  title: string;
};

const categoryOrder: Record<AnatomyRowCategory, number> = {
  presence: 0,
  identity: 1,
  composition: 2,
  state: 3,
  data: 4,
  aria: 5,
  behavior: 6,
};

function sortRows(rows: AnatomyRow[]): AnatomyRow[] {
  return [...rows].sort((first, second) => {
    const firstCategory = categoryOrder[first.category ?? "state"];
    const secondCategory = categoryOrder[second.category ?? "state"];

    if (firstCategory !== secondCategory) return firstCategory - secondCategory;
    return first.label.localeCompare(second.label);
  });
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
                  <h3>{group.title}</h3>
                  <AnatomyRows rows={group.rows} />
                </div>
              ))}
              {section.rows ? <AnatomyRows rows={section.rows} /> : null}
            </Collapsible.Content>
          </Collapsible.Root>
        ))}
        <div className="panel-footer">{footer}</div>
      </div>
    </div>
  );
}

function AnatomyRows({ rows }: { rows: AnatomyRow[] }) {
  return (
    <dl className="parts-grid">
      {sortRows(rows).map((row) => (
        <div key={`${row.category ?? "state"}-${row.label}`}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
