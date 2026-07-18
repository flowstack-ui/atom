# Playground Changelog

This changelog records meaningful tester- and maintainer-visible changes to the
repo-only Atom playground. Atom package behavior and API changes are recorded
separately in `../CHANGELOG.md` and the affected component changelogs.

## Unreleased

- Standardized local playground development on port `3000`, added the matching
  LAN command for phone/tablet review, reserved preview port `4000`, and made
  port collisions fail instead of silently selecting another port.
- Expanded the Dialog scenario for native versus compatibility naming,
  optional Description relationships, explicit initial/final focus targets,
  consumer-owned `Modal.Branch` portals, background inert evidence, portalled
  Select integration, and nested modal ownership qualification.

## 1.0.0 - 2026-07-14

- Established the completed Atom browser workbench baseline with consistent
  Anatomy, Canvas, Inspector, Logs, and Source surfaces.
- Added component coverage tracking and reviewed, version-controlled Manual
  Test Protocols.
- Added live DOM, ARIA, data-attribute, focus, and selection evidence for manual
  browser verification.
- Established public Atom imports with local source resolution so scenarios
  exercise the consumer-facing API against the current workspace source.
