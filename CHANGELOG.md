# Changelog

## v0.2.1 — 2026-10-19

### Added

- Showcase README with user-facing before/after, 30-second demo, and screenshots.
- `screenshots.json` for plugin-market storefronts (6 screenshots).
- `docs/COMPONENTS.md` and `docs/ARCHITECTURE.md`.
- GitHub Actions CI, MIT license, release tarball.

### Changed

- Package metadata: `private: false`, repository/homepage/bugs, `dsh-plugin` keywords.
- No runtime behavior changes from v0.2.0.

## v0.2.0 — 2026-10-19

### Added

- Persistent `turnTail` cards: the interface stays in the conversation after the turn ends.
- 24 whitelist components, including `Steps`, `Progress`, and `Accordion`.
- Form fields: `text`, `textarea`, `number`, `date`, `select`, `radio`, `checkbox`, `switch`, `slider`.
- Paper Glass v1.0 visual layer: host tokens, local material tokens, reduced-transparency / contrast / motion fallbacks.
- Image loading timeout with an explicit failure placeholder.
- Interaction rule: every suitable card should have at least one next step (`Chips` or `Buttons`).
- Prompt-first behavior: structured answers default to `render_ui`; simple Q&A stays text.
- Node test suite (48 tests), deterministic build test, 200-node limit, prompt coverage test.

### Changed

- `tool/call` arguments are parsed as a JSON string before reading `args.ui`.
- 390px horizontal overflow fixed by scoping the renderer root and box-sizing.
- Buttons 36px, input 36px, chips 30px; numeric text uses `tabular-nums`.

### Fixed

- `turnTail` cards now get the `.oui-root` scope, so stat values and primary buttons are visible.
- Hex color removed from the primary-button highlight; local `--oui-*` tokens are defined and validated.
- `turnTail` now exposes `data-oui-nodes` / `data-oui-errors` and a readable empty/failure state.

## v0.1.0 — 2026-10-18

- Initial Host tool + system prompt.
- Client `tool.call.toolview` with three streaming phases.
- 21 whitelist components.
