# Architecture

## Two halves

```text
Host (Node)                          Client (browser)
├─ register render_ui tool           ├─ tool.call.toolview key = render_ui
├─ system prompt + catalog           ├─ uiConversation.events turn definition
├─ compile / validate / limits       ├─ conversation.chat.turnTail persistent card
└─ returns {ok, nodes, errors}       └─ DSL parser + whitelist renderer + CSS
```

### Host

`src/index.mjs` registers one tool, `render_ui`, with a single `ui` string parameter. It compiles the source with `src/kit.mjs` and returns `{ok, nodes, errors}`. It does not call a model, write files, or read user data.

### Client

`src/client-entry.mjs` does two things:

1. **Tool view** — registers `tool.call.toolview` for `render_ui`. During `preparing` / `start` it reads the growing `args.text('ui')` and renders closed statements; at `result` it compiles the final source.
2. **Persistent card** — registers a `uiConversation.events` turn definition of kind `intelligentUi`, storing the `ui` source in the turn data. `conversation.chat.turnTail` reads it after the turn ends, so the interface stays in the conversation.

`args.arguments` from `tool/call` is a JSON string; it must be parsed before reading `args.ui`.

## DSL

The language is line-oriented:

```text
id = Component(args)
root = Stack([…])
```

- The parser produces pure data (`{__node, id, type, arg}`), no evaluator, no scope, no side effects.
- Forward references are allowed; cycles and depth > 24 become missing nodes.
- Only names in `src/catalog.mjs` render. Unknown names become “未渲染”.
- `root` is required. An alias like `root = main` is not supported; root must be an inline component call.

## Replay and data

- The only source of truth is the tool argument `ui` plus the tool result in the Session log.
- No business data is stored; no snapshot is written.
- Replaying or forking a session rebuilds the same card from the same source.
- The turn definition copies `ui` into turn data for rendering; it is a projection, not a second store.

## Security

- No `eval`, `new Function`, `dangerouslySetInnerHTML`, `iframe`, remote scripts/styles/fonts.
- Every element is built with `React.createElement`.
- URLs are restricted to `http(s)`; `javascript:`, `data:`, `file:`, relative paths are cleared.
- Actions are restricted to `send` and `open`. `open` uses `noopener,noreferrer`.
- No host store access, no Session subscription, no `@deepseek-ai/*` imports in the Client half.
- The card is read-only except for user actions; writes can only happen through the Agent’s next turn.

## Visual system

Paper Glass v1.0 is mapped onto the host theme:

- Structural colors come from `--dsw-alias-*` (`label`, `bg-layer`, `border`, `brand`, state colors).
- Local `--oui-*` aliases are derived from host tokens (surface, ink, line, action, success, warning, danger, gradient, glass).
- Glass is used only on controls / overlays (buttons, tab list); content surfaces stay flat.
- Font sizes are limited to 11 / 12 / 13 / 14 / 15 / 18 / 22; weights 400 / 550 / 600; numbers use `tabular-nums`.
- Radii: controls 8, content 12, pills 999; focus ring 3px.
- Fallbacks: `prefers-reduced-transparency`, `prefers-reduced-motion`, `prefers-contrast`, and `[data-transparency]` / `[data-contrast]` attributes.

## Tests

`test/kit.test.mjs` covers parsing, validation, actions, limits, and prompt/catalog coverage. `test/renderer.test.mjs` covers all 24 components, fallbacks, interactions, and CSS token rules. `test/build.test.mjs` checks the generated Client bundle and deterministic builds. `test/prompt.test.mjs` checks the system prompt constraints.

```bash
node build.mjs
node --test test/*.test.mjs
```
