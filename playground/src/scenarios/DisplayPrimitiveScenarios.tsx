import { AspectRatio } from "@flowstack-ui/atom/aspect-ratio";
import { Avatar } from "@flowstack-ui/atom/avatar";
import { Badge } from "@flowstack-ui/atom/badge";
import { Divider } from "@flowstack-ui/atom/divider";
import { Input } from "@flowstack-ui/atom/input";
import { Label } from "@flowstack-ui/atom/label";
import { List } from "@flowstack-ui/atom/list";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";

type CompositionMode = "default" | "asChild" | "render";
type DividerOrientation = "horizontal" | "vertical";
type AspectRatioValue = "16:9" | "4:3" | "1:1" | "invalid";
type AvatarImageMode = "loaded" | "broken" | "loading";

type LogEntry = {
  id: number;
  time: string;
  text: string;
};

export const displayPrimitiveScenarioIds = new Set([
  "badge",
  "divider",
  "aspect-ratio",
  "avatar",
  "label",
  "list",
]);

const avatarLoadedSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%231c2430'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23ffffff'/%3E%3Cpath d='M14 56c3.5-12 12-18 18-18s14.5 6 18 18' fill='%23ffffff'/%3E%3C/svg%3E";

function nowTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function useScenarioLog() {
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = (text: string) => {
    setLog((entries) => [
      { id: Date.now() + Math.random(), time: nowTime(), text },
      ...entries.slice(0, 10),
    ]);
  };

  return {
    log,
    addLog,
    clearLog: () => setLog([]),
  };
}

export function useDisplayPrimitiveScenarios() {
  return {
    badge: useBadgeScenario(),
    divider: useDividerScenario(),
    aspectRatio: useAspectRatioScenario(),
    avatar: useAvatarScenario(),
    label: useLabelScenario(),
    list: useListScenario(),
  };
}

function useBadgeScenario() {
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [tone, setTone] = useState("neutral");
  const [content, setContent] = useState("Ready");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { composition, tone, content, log },
    actions: {
      setComposition,
      setTone,
      setContent,
      clearLog,
      noteClick: () => addLog("badge clicked"),
    },
  };
}

function useDividerScenario() {
  const [orientation, setOrientation] = useState<DividerOrientation>("horizontal");
  const [decorative, setDecorative] = useState(true);
  const [withContent, setWithContent] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { orientation, decorative, withContent, composition, log },
    actions: {
      setOrientation,
      setDecorative,
      setWithContent,
      setComposition,
      clearLog,
      noteToggle: () => addLog("divider options changed"),
    },
  };
}

function useAspectRatioScenario() {
  const [ratio, setRatio] = useState<AspectRatioValue>("16:9");
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, clearLog } = useScenarioLog();

  return {
    state: { ratio, composition, log },
    actions: { setRatio, setComposition, clearLog },
  };
}

function useAvatarScenario() {
  const [imageMode, setImageMode] = useState<AvatarImageMode>("loaded");
  const [delay, setDelay] = useState(false);
  const [group, setGroup] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [status, setStatus] = useState("idle");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleStatusChange = (nextStatus: string) => {
    setStatus(nextStatus);
    addLog(`image ${nextStatus}`);
  };

  return {
    state: { imageMode, delay, group, composition, status, log },
    actions: {
      setImageMode,
      setDelay,
      setGroup,
      setComposition,
      handleStatusChange,
      clearLog,
    },
  };
}

function useLabelScenario() {
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [withHtmlFor, setWithHtmlFor] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { disabled, invalid, required, readOnly, withHtmlFor, composition, log },
    actions: {
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setWithHtmlFor,
      setComposition,
      clearLog,
      noteLabelClick: () => addLog("label clicked"),
      noteInputFocus: () => addLog("input focused"),
    },
  };
}

function useListScenario() {
  const [ordered, setOrdered] = useState(false);
  const [disabledItem, setDisabledItem] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { ordered, disabledItem, composition, log },
    actions: {
      setOrdered,
      setDisabledItem,
      setComposition,
      clearLog,
      noteItemClick: (value: string) => addLog(`item clicked ${value}`),
    },
  };
}

export type DisplayPrimitiveScenarios = ReturnType<typeof useDisplayPrimitiveScenarios>;

export function DisplayPrimitiveScenarioToolbar({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: DisplayPrimitiveScenarios;
}) {
  if (scenarioId === "badge") {
    const scenario = scenarios.badge;
    return (
      <ControlToolbar label="Badge controls">
        <ToolbarGroup title="Content" value="content">
          <MenuRadioControl label="Text" options={badgeContentOptions} value={scenario.state.content} onChange={scenario.actions.setContent} />
          <MenuRadioControl label="Tone" options={badgeToneOptions} value={scenario.state.tone} onChange={scenario.actions.setTone} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "divider") {
    const scenario = scenarios.divider;
    return (
      <ControlToolbar label="Divider controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.decorative} label="Decorative" value="decorative" onChange={scenario.actions.setDecorative} />
          <MenuCheckboxControl checked={scenario.state.withContent} label="With content" value="with-content" onChange={scenario.actions.setWithContent} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Orientation" options={dividerOrientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "aspect-ratio") {
    const scenario = scenarios.aspectRatio;
    return (
      <ControlToolbar label="Aspect Ratio controls">
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Ratio" options={aspectRatioOptions} value={scenario.state.ratio} onChange={scenario.actions.setRatio} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "avatar") {
    const scenario = scenarios.avatar;
    return (
      <ControlToolbar label="Avatar controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.group} label="Group" value="group" onChange={scenario.actions.setGroup} />
          <MenuCheckboxControl checked={scenario.state.delay} label="Delay fallback" value="delay" onChange={scenario.actions.setDelay} />
        </ToolbarGroup>
        <ToolbarGroup title="Image" value="image">
          <MenuRadioControl label="Source" options={avatarImageOptions} value={scenario.state.imageMode} onChange={scenario.actions.setImageMode} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "label") {
    const scenario = scenarios.label;
    return (
      <ControlToolbar label="Label controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
        </ToolbarGroup>
        <ToolbarGroup title="Association" value="association">
          <MenuCheckboxControl checked={scenario.state.withHtmlFor} label="Use htmlFor" value="html-for" onChange={scenario.actions.setWithHtmlFor} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "list") {
    const scenario = scenarios.list;
    return (
      <ControlToolbar label="List controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.ordered} label="Ordered" value="ordered" onChange={scenario.actions.setOrdered} />
          <MenuCheckboxControl checked={scenario.state.disabledItem} label="Second item disabled" value="disabled-item" onChange={scenario.actions.setDisabledItem} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  return null;
}

export function DisplayPrimitiveScenarioCanvas({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: DisplayPrimitiveScenarios;
}) {
  if (scenarioId === "badge") return <BadgeScenarioCanvas scenario={scenarios.badge} />;
  if (scenarioId === "divider") return <DividerScenarioCanvas scenario={scenarios.divider} />;
  if (scenarioId === "aspect-ratio") return <AspectRatioScenarioCanvas scenario={scenarios.aspectRatio} />;
  if (scenarioId === "avatar") return <AvatarScenarioCanvas scenario={scenarios.avatar} />;
  if (scenarioId === "label") return <LabelScenarioCanvas scenario={scenarios.label} />;
  if (scenarioId === "list") return <ListScenarioCanvas scenario={scenarios.list} />;
  return null;
}

export function DisplayPrimitiveScenarioAnatomy({
  scenarioId,
  scenarios,
  openGroups,
  onOpenGroupsChange,
}: {
  scenarioId: string;
  scenarios: DisplayPrimitiveScenarios;
  openGroups: Record<string, boolean>;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const sections = getDisplayPrimitiveSections(scenarioId, scenarios);
  return (
    <AnatomyPanel
      footer={`${sections.length} ${sections.length === 1 ? "part" : "parts"}`}
      openGroups={openGroups}
      sections={sections}
      onOpenGroupsChange={onOpenGroupsChange}
    />
  );
}

export function DisplayPrimitiveScenarioLog({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: DisplayPrimitiveScenarios;
}) {
  const log = getDisplayPrimitiveLog(scenarioId, scenarios);
  return (
    <div className="scenario-log">
      <ScrollArea.Root className="event-log" orientation="vertical">
        <ScrollArea.Viewport className="event-log-viewport" focusable aria-label="Event log">
          <ol>
            {log.map((entry) => (
              <li key={entry.id}>
                <time>{entry.time}</time>
                <span>{entry.text}</span>
              </li>
            ))}
          </ol>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    </div>
  );
}

export function getDisplayPrimitiveEventCount(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  return getDisplayPrimitiveLog(scenarioId, scenarios).length;
}

export function clearDisplayPrimitiveLog(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  getDisplayPrimitiveActions(scenarioId, scenarios)?.clearLog();
}

export function getDisplayPrimitiveCanvasFooter(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  if (scenarioId === "badge") {
    const state = scenarios.badge.state;
    return `Content ${state.content} | Tone ${state.tone} | ${state.composition}`;
  }

  if (scenarioId === "divider") {
    const state = scenarios.divider.state;
    return `${state.orientation} | Decorative ${state.decorative} | Content ${state.withContent}`;
  }

  if (scenarioId === "aspect-ratio") {
    const state = scenarios.aspectRatio.state;
    return `Ratio ${state.ratio} | ${state.composition}`;
  }

  if (scenarioId === "avatar") {
    const state = scenarios.avatar.state;
    return `Image ${state.imageMode} | Status ${state.status} | Group ${state.group}`;
  }

  if (scenarioId === "label") {
    const state = scenarios.label.state;
    return `htmlFor ${state.withHtmlFor} | Required ${state.required} | Invalid ${state.invalid}`;
  }

  if (scenarioId === "list") {
    const state = scenarios.list.state;
    return `${state.ordered ? "Ordered" : "Unordered"} | Disabled item ${state.disabledItem}`;
  }

  return "";
}

export function getDisplayPrimitiveSource(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  if (scenarioId === "badge") {
    const state = scenarios.badge.state;
    return `<Badge.Root>
  ${state.content}
</Badge.Root>`;
  }

  if (scenarioId === "divider") {
    const state = scenarios.divider.state;
    return `<Divider.Root
  orientation="${state.orientation}"
  decorative={${state.decorative}}
>
  ${state.withContent ? "OR" : ""}
</Divider.Root>`;
  }

  if (scenarioId === "aspect-ratio") {
    const state = scenarios.aspectRatio.state;
    return `<AspectRatio.Root ratio={${getRatioValue(state.ratio)}}>
  <div>Preview</div>
</AspectRatio.Root>`;
  }

  if (scenarioId === "avatar") {
    const state = scenarios.avatar.state;
    return `<Avatar.Root src={src} onLoadingStatusChange={setStatus}>
  <Avatar.Image alt="Profile" />
  <Avatar.Fallback delayMs={${state.delay ? 600 : 0}}>WD</Avatar.Fallback>
</Avatar.Root>`;
  }

  if (scenarioId === "label") {
    const state = scenarios.label.state;
    return `<Label.Root
  ${state.withHtmlFor ? `htmlFor="display-label-input"` : ""}
  disabled={${state.disabled}}
  invalid={${state.invalid}}
  required={${state.required}}
  readOnly={${state.readOnly}}
>
  Email
</Label.Root>
<Input.Root id="display-label-input" />`;
  }

  if (scenarioId === "list") {
    const state = scenarios.list.state;
    return `<List.Root ordered={${state.ordered}}>
  <List.Item>Plan</List.Item>
  <List.Item disabled={${state.disabledItem}}>Billing</List.Item>
  <List.Item>Review</List.Item>
</List.Root>`;
  }

  return "// No source example for this scenario yet.";
}

function BadgeScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useBadgeScenario> }) {
  const props = {
    className: `display-badge display-badge-${scenario.state.tone}`,
    "data-badge-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    onClick: scenario.actions.noteClick,
  };

  return (
    <div className="display-primitive-stage">
      {scenario.state.composition === "asChild" ? (
        <Badge.Root {...props} asChild>
          <strong>{scenario.state.content}</strong>
        </Badge.Root>
      ) : scenario.state.composition === "render" ? (
        <Badge.Root {...props} render={(renderProps) => <strong {...renderProps}>{scenario.state.content}</strong>} />
      ) : (
        <Badge.Root {...props}>{scenario.state.content}</Badge.Root>
      )}
    </div>
  );
}

function DividerScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useDividerScenario> }) {
  const props = {
    className: `display-divider ${scenario.state.orientation === "vertical" ? "vertical" : ""}`,
    "data-divider-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    decorative: scenario.state.decorative,
    orientation: scenario.state.orientation,
  };
  const children = scenario.state.withContent ? "OR" : undefined;

  return (
    <div className={`display-primitive-stage divider-stage ${scenario.state.orientation}`}>
      <span>Before</span>
      {scenario.state.composition === "asChild" ? (
        <Divider.Root {...props} asChild>
          <div>{children}</div>
        </Divider.Root>
      ) : scenario.state.composition === "render" ? (
        <Divider.Root {...props} render={(renderProps) => <div {...renderProps}>{children}</div>} />
      ) : (
        <Divider.Root {...props}>{children}</Divider.Root>
      )}
      <span>After</span>
    </div>
  );
}

function AspectRatioScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useAspectRatioScenario> }) {
  const props = {
    className: "display-aspect-ratio",
    "data-aspect-ratio-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    ratio: getRatioValue(scenario.state.ratio),
  };

  return (
    <div className="display-primitive-stage">
      {scenario.state.composition === "asChild" ? (
        <AspectRatio.Root {...props} asChild>
          <section><span>{scenario.state.ratio}</span></section>
        </AspectRatio.Root>
      ) : scenario.state.composition === "render" ? (
        <AspectRatio.Root {...props} render={(renderProps) => <section {...renderProps}><span>{scenario.state.ratio}</span></section>} />
      ) : (
        <AspectRatio.Root {...props}><span>{scenario.state.ratio}</span></AspectRatio.Root>
      )}
    </div>
  );
}

function AvatarScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useAvatarScenario> }) {
  const avatar = (
    <AvatarExample
      composition={scenario.state.composition}
      delay={scenario.state.delay}
      imageMode={scenario.state.imageMode}
      onLoadingStatusChange={scenario.actions.handleStatusChange}
      primary
    />
  );

  return (
    <div className="display-primitive-stage">
      {scenario.state.group ? (
        <Avatar.Group
          className="display-avatar-group"
          data-avatar-group=""
          data-playground-inspect=""
          data-prop-check="group"
        >
          {avatar}
          <AvatarExample
            composition="default"
            delay={false}
            imageMode="broken"
            onLoadingStatusChange={scenario.actions.handleStatusChange}
          />
        </Avatar.Group>
      ) : avatar}
    </div>
  );
}

function LabelScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useLabelScenario> }) {
  const labelProps = {
    className: "display-label",
    "data-label-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    disabled: scenario.state.disabled,
    invalid: scenario.state.invalid,
    required: scenario.state.required,
    readOnly: scenario.state.readOnly,
    htmlFor: scenario.state.withHtmlFor ? "display-label-input" : undefined,
    onClick: scenario.actions.noteLabelClick,
  };

  return (
    <div className="display-primitive-stage">
      <div className="display-label-field">
        {scenario.state.composition === "asChild" ? (
          <Label.Root {...labelProps} asChild>
            <span>Email</span>
          </Label.Root>
        ) : scenario.state.composition === "render" ? (
          <Label.Root {...labelProps} render={(renderProps) => <span {...renderProps}>Email</span>} />
        ) : (
          <Label.Root {...labelProps}>Email</Label.Root>
        )}
        <Input.Root
          className="display-input"
          data-input-root=""
          data-playground-inspect=""
          data-prop-check="input"
          defaultValue="hello@flowstack.dev"
          disabled={scenario.state.disabled}
          id="display-label-input"
          invalid={scenario.state.invalid}
          readOnly={scenario.state.readOnly}
          required={scenario.state.required}
          onFocus={scenario.actions.noteInputFocus}
        />
      </div>
    </div>
  );
}

function ListScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useListScenario> }) {
  const props = {
    className: "display-list",
    "data-list-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    ordered: scenario.state.ordered,
  };

  const items = (
    <>
      <List.Item
        data-list-item=""
        data-playground-inspect=""
        data-prop-check="item"
        data-value="plan"
        onClick={() => scenario.actions.noteItemClick("plan")}
      >
        Plan setup
      </List.Item>
      <List.Item
        data-list-disabled-item=""
        data-playground-inspect=""
        data-value="billing"
        disabled={scenario.state.disabledItem}
        onClick={() => scenario.actions.noteItemClick("billing")}
      >
        Billing
      </List.Item>
      <List.Item
        data-list-last-item=""
        data-playground-inspect=""
        data-value="review"
        onClick={() => scenario.actions.noteItemClick("review")}
      >
        Review
      </List.Item>
    </>
  );

  return (
    <div className="display-primitive-stage">
      {scenario.state.composition === "asChild" ? (
        <List.Root {...props} asChild>
          {scenario.state.ordered ? <ol>{items}</ol> : <ul>{items}</ul>}
        </List.Root>
      ) : scenario.state.composition === "render" ? (
        <List.Root {...props} render={(renderProps) => scenario.state.ordered ? <ol {...renderProps}>{items}</ol> : <ul {...renderProps}>{items}</ul>} />
      ) : (
        <List.Root {...props}>{items}</List.Root>
      )}
    </div>
  );
}

function AvatarExample({
  composition,
  delay,
  imageMode,
  onLoadingStatusChange,
  primary = false,
}: {
  composition: CompositionMode;
  delay: boolean;
  imageMode: AvatarImageMode;
  onLoadingStatusChange: (status: string) => void;
  primary?: boolean;
}) {
  const props = {
    className: "display-avatar",
    "data-avatar-root": primary ? "" : undefined,
    "data-playground-inspect": primary ? "" : undefined,
    "data-prop-check": primary ? "root" : undefined,
    src: imageMode === "loaded" ? avatarLoadedSrc : imageMode === "broken" ? "/missing-avatar.png" : "",
    onLoadingStatusChange,
  };
  const children = (
    <>
      <Avatar.Image
        alt="Profile"
        className="display-avatar-image"
        data-avatar-image=""
        data-playground-inspect=""
        data-prop-check="image"
        src={imageMode === "loaded" ? avatarLoadedSrc : imageMode === "broken" ? "/missing-avatar.png" : ""}
      />
      <Avatar.Fallback
        className="display-avatar-fallback"
        data-avatar-fallback=""
        data-playground-inspect=""
        data-prop-check="fallback"
        delayMs={delay ? 600 : 0}
      >
        WD
      </Avatar.Fallback>
    </>
  );

  return composition === "asChild" ? (
    <Avatar.Root {...props} asChild>
      <span>{children}</span>
    </Avatar.Root>
  ) : composition === "render" ? (
    <Avatar.Root {...props} render={(renderProps) => <span {...renderProps}>{children}</span>} />
  ) : (
    <Avatar.Root {...props}>{children}</Avatar.Root>
  );
}

function getDisplayPrimitiveSections(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
): AnatomySection[] {
  if (scenarioId === "badge") {
    const root = document.querySelector<HTMLElement>("[data-badge-root]");
    return [{
      title: "Root",
      selector: "[data-badge-root]",
      summary: root?.textContent?.trim() || "not rendered",
      rows: [
        { label: "Exists", value: bool(!!root), category: "presence" },
        { label: "Content", value: scenarios.badge.state.content, category: "state" },
        { label: "Tone", value: scenarios.badge.state.tone, category: "state" },
        { label: "Composition", value: scenarios.badge.state.composition, category: "composition" },
      ],
    }];
  }

  if (scenarioId === "divider") {
    const root = document.querySelector<HTMLElement>("[data-divider-root]");
    return [{
      title: "Root",
      selector: "[data-divider-root]",
      summary: scenarios.divider.state.orientation,
      rows: [
        { label: "Exists", value: bool(!!root), category: "presence" },
        { label: "Orientation", value: scenarios.divider.state.orientation, category: "state" },
        { label: "Decorative", value: bool(scenarios.divider.state.decorative), category: "state" },
        { label: "With content", value: bool(scenarios.divider.state.withContent), category: "state" },
        { label: "Composition", value: scenarios.divider.state.composition, category: "composition" },
      ],
    }];
  }

  if (scenarioId === "aspect-ratio") {
    const root = document.querySelector<HTMLElement>("[data-aspect-ratio-root]");
    return [{
      title: "Root",
      selector: "[data-aspect-ratio-root]",
      summary: scenarios.aspectRatio.state.ratio,
      rows: [
        { label: "Exists", value: bool(!!root), category: "presence" },
        { label: "Ratio", value: scenarios.aspectRatio.state.ratio, category: "state" },
        { label: "Resolved ratio", value: String(getRatioValue(scenarios.aspectRatio.state.ratio)), category: "state" },
        { label: "Composition", value: scenarios.aspectRatio.state.composition, category: "composition" },
      ],
    }];
  }

  if (scenarioId === "avatar") {
    const group = document.querySelector<HTMLElement>("[data-avatar-group]");
    const root = document.querySelector<HTMLElement>("[data-avatar-root]");
    const image = document.querySelector<HTMLElement>("[data-avatar-image]");
    const fallback = document.querySelector<HTMLElement>("[data-avatar-fallback]");
    return [
      {
        title: "Group",
        selector: "[data-avatar-group]",
        inactive: !group,
        summary: group ? "rendered" : "not rendered",
        rows: [
          { label: "Exists", value: bool(!!group), category: "presence" },
          { label: "Group", value: bool(scenarios.avatar.state.group), category: "state" },
        ],
      },
      {
        title: "Root",
        selector: "[data-avatar-root]",
        summary: scenarios.avatar.state.status,
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Source", value: scenarios.avatar.state.imageMode, category: "state" },
          { label: "Status", value: scenarios.avatar.state.status, category: "state" },
          { label: "Composition", value: scenarios.avatar.state.composition, category: "composition" },
        ],
      },
      {
        title: "Image",
        selector: "[data-avatar-image]",
        inactive: !image,
        summary: image ? "rendered" : "not rendered",
        rows: [
          { label: "Exists", value: bool(!!image), category: "presence" },
        ],
      },
      {
        title: "Fallback",
        selector: "[data-avatar-fallback]",
        inactive: !fallback,
        summary: fallback ? "rendered" : "not rendered",
        rows: [
          { label: "Exists", value: bool(!!fallback), category: "presence" },
          { label: "Delay", value: scenarios.avatar.state.delay ? "600ms" : "0ms", category: "behavior" },
        ],
      },
    ];
  }

  if (scenarioId === "label") {
    const label = document.querySelector<HTMLElement>("[data-label-root]");
    const input = document.querySelector<HTMLInputElement>("[data-input-root]");
    return [
      {
        title: "Root",
        selector: "[data-label-root]",
        summary: label?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!label), category: "presence" },
          { label: "Disabled", value: bool(scenarios.label.state.disabled), category: "state" },
          { label: "Invalid", value: bool(scenarios.label.state.invalid), category: "state" },
          { label: "Required", value: bool(scenarios.label.state.required), category: "state" },
          { label: "Read only", value: bool(scenarios.label.state.readOnly), category: "state" },
          { label: "htmlFor", value: scenarios.label.state.withHtmlFor ? "display-label-input" : "none", category: "behavior" },
          { label: "Matches input", value: bool(!!label && !!input && label.getAttribute("for") === input.id), category: "behavior" },
          { label: "Composition", value: scenarios.label.state.composition, category: "composition" },
        ],
      },
      {
        title: "Control",
        selector: "[data-input-root]",
        summary: input?.value || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!input), category: "presence" },
          { label: "Value", value: input?.value ?? "none", category: "state" },
        ],
      },
    ];
  }

  if (scenarioId === "list") {
    const root = document.querySelector<HTMLElement>("[data-list-root]");
    const item = document.querySelector<HTMLElement>("[data-list-item]");
    const disabled = document.querySelector<HTMLElement>("[data-list-disabled-item]");
    return [
      {
        title: "Root",
        selector: "[data-list-root]",
        summary: scenarios.list.state.ordered ? "ordered" : "unordered",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Ordered", value: bool(scenarios.list.state.ordered), category: "state" },
          { label: "Composition", value: scenarios.list.state.composition, category: "composition" },
        ],
      },
      {
        title: "Item",
        selector: "[data-list-item]",
        summary: item?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!item), category: "presence" },
        ],
      },
      {
        title: "Disabled Item",
        selector: "[data-list-disabled-item]",
        summary: disabled?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!disabled), category: "presence" },
          { label: "Disabled", value: bool(scenarios.list.state.disabledItem), category: "state" },
        ],
      },
    ];
  }

  return [];
}

function getDisplayPrimitiveLog(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  if (scenarioId === "badge") return scenarios.badge.state.log;
  if (scenarioId === "divider") return scenarios.divider.state.log;
  if (scenarioId === "aspect-ratio") return scenarios.aspectRatio.state.log;
  if (scenarioId === "avatar") return scenarios.avatar.state.log;
  if (scenarioId === "label") return scenarios.label.state.log;
  if (scenarioId === "list") return scenarios.list.state.log;
  return [];
}

function getDisplayPrimitiveActions(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  if (scenarioId === "badge") return scenarios.badge.actions;
  if (scenarioId === "divider") return scenarios.divider.actions;
  if (scenarioId === "aspect-ratio") return scenarios.aspectRatio.actions;
  if (scenarioId === "avatar") return scenarios.avatar.actions;
  if (scenarioId === "label") return scenarios.label.actions;
  if (scenarioId === "list") return scenarios.list.actions;
  return null;
}

function ControlToolbar({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Menubar.Root className="canvas-toolbar" aria-label={label}>
      {children}
    </Menubar.Root>
  );
}

function ToolbarGroup({ title, value, children }: { title: string; value: string; children: ReactNode }) {
  return (
    <Menubar.Menu value={value}>
      <Menubar.Trigger className="toolbar-group-trigger">{title}</Menubar.Trigger>
      <Menubar.Content className="toolbar-menu" align="start" sideOffset={6}>
        {children}
      </Menubar.Content>
    </Menubar.Menu>
  );
}

function CompositionToolbarGroup({
  value,
  onChange,
}: {
  value: CompositionMode;
  onChange: (value: CompositionMode) => void;
}) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      <MenuRadioControl label="Root" options={compositionOptions} value={value} onChange={onChange} />
    </ToolbarGroup>
  );
}

function MenuSection({ label }: { label: string }) {
  return <div className="toolbar-menu-label">{label}</div>;
}

function MenuCheckboxControl({
  checked,
  label,
  value,
  onChange,
}: {
  checked: boolean;
  label: string;
  value: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Menubar.CheckboxItem
      className="toolbar-menu-item"
      checked={checked}
      value={value}
      onCheckedChange={onChange}
    >
      <span>{label}</span>
      <span className="toolbar-menu-check" aria-hidden="true">{checked ? "✓" : ""}</span>
    </Menubar.CheckboxItem>
  );
}

function MenuRadioControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | string;
  onChange: (value: T) => void;
}) {
  return (
    <>
      <MenuSection label={label} />
      <Menubar.RadioGroup className="toolbar-radio-group" value={value} onValueChange={(nextValue) => onChange(nextValue as T)}>
        {options.map((option) => (
          <Menubar.RadioItem className="toolbar-menu-item" key={option} value={option}>
            <span>{formatOption(option)}</span>
            <span className="toolbar-menu-check" aria-hidden="true">{value === option ? "✓" : ""}</span>
          </Menubar.RadioItem>
        ))}
      </Menubar.RadioGroup>
    </>
  );
}

function getRatioValue(ratio: AspectRatioValue) {
  if (ratio === "4:3") return 4 / 3;
  if (ratio === "1:1") return 1;
  if (ratio === "invalid") return 0;
  return 16 / 9;
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function formatOption(value: string) {
  if (value === "asChild") return "As Child";
  if (value === "16:9" || value === "4:3" || value === "1:1") return value;
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const compositionOptions = ["default", "asChild", "render"] as const;
const badgeContentOptions = ["Ready", "Beta", "12"] as const;
const badgeToneOptions = ["neutral", "success", "warning"] as const;
const dividerOrientationOptions = ["horizontal", "vertical"] as const;
const aspectRatioOptions = ["16:9", "4:3", "1:1", "invalid"] as const;
const avatarImageOptions = ["loaded", "broken", "loading"] as const;
