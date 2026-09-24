# OverlayManager Changelog

## Unreleased

- No unreleased changes.

## 0.27.0

- Settle and remove instances closed before their first open commit, including
  suspended content, without bypassing exit callbacks for committed overlays.

- Add keyed programmatic overlays with typed results, updates, exit waiting,
  generation-safe reopening and cleanup on removal or host disposal.
