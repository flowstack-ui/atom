# Agent Knowledge

Atom ships public component guidance for coding agents alongside its runtime
artifacts. The guidance explains selection, required composition,
accessibility rules, recurring mistakes, and validation; it does not add
runtime behavior or a dependency.

Use `@flowstack-ui/atom/agents/manifest.json` to discover covered components.
Each manifest entry points to both machine-readable JSON and human-readable
Markdown, for example:

```text
@flowstack-ui/atom/agents/field.json
@flowstack-ui/atom/agents/field.md
```

The source pair lives beside the primitive it describes. `agent.json` is the
structured authority and `agent.md` is generated from it. Component source,
types, public documentation, and tests remain authoritative when a guide is
incomplete.

Agent Knowledge is public usage guidance. It does not contain private prompts,
ranking policy, customer information, or application workflows.
