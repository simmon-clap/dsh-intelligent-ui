# Components

24 whitelist components. Each component takes **one positional argument**: a children array, an object, a string, or nothing.

## Layout

| Component | Signature | Notes |
| --- | --- | --- |
| `Stack` | `Stack([children…])` | Vertical container; usually `root`. |
| `Row` | `Row([children…])` | Horizontal container, wraps on narrow widths. |
| `Card` | `Card({title?, children:[…], tone?})` | Content surface; `children` required. `tone`: info / success / warning / danger / neutral. |
| `Divider` | `Divider()` | 1px separator. |

## Text

| Component | Signature | Notes |
| --- | --- | --- |
| `Heading` | `Heading({text, level?})` | `level` 1–3, default 2. |
| `Text` | `Text({text, tone?})` | `tone`: default / muted / strong. |
| `Callout` | `Callout({text, title?, tone?})` | info / success / warning / danger. |
| `Badge` | `Badge({text, tone?})` | Inline status / category pill. |
| `Code` | `Code({text, lang?})` | Monospace block; no syntax highlighting. |

## Data

| Component | Signature | Notes |
| --- | --- | --- |
| `Stat` | `Stat({label, value, hint?})` | One KPI; `value` and `label` are strings. |
| `Table` | `Table({columns:[…], rows:[[…]], caption?})` | Columns ≤ 8, rows ≤ 60; cells are text. |
| `Chart` | `Chart({kind, data:[{label, value}], title?, unit?})` | `kind`: bar / line / area / pie; data 1–60 points. |
| `Timeline` | `Timeline({items:[{time?, title, detail?, tone?}], title?})` | Events / itinerary; items 1–40. |
| `List` | `List({items:[text…], ordered?, title?})` | Bullet or numbered list; items 1–40. |
| `Steps` | `Steps({items:[{title, detail?, status?}], title?})` | Stage list; `status`: done / active / todo / warning. |
| `Progress` | `Progress({items:[{label, value, max?, tone?}], title?})` | Progress bars; `value` 0–`max` (default 100). |

## Media

| Component | Signature | Notes |
| --- | --- | --- |
| `Image` | `Image({src, alt?, caption?})` | `src` must be `http(s)`. |
| `Gallery` | `Gallery({images:[{src, alt?, caption?}], columns?, title?})` | 1–12 images, 1–4 columns. |
| `Map` | `Map({center:[lat,lng], zoom?, markers?, route?, title?, height?})` | Static map; markers ≤ 30, route ≤ 200 points. |

## Interaction

| Component | Signature | Notes |
| --- | --- | --- |
| `Tabs` | `Tabs({tabs:[{label, children:[…]}], title?})` | ≤ 6 tabs; keyboard arrows / Home / End. |
| `Accordion` | `Accordion({items:[{title, children:[…]}], title?})` | ≤ 8 sections; one open at a time. |
| `Form` | `Form({fields:[…], submit:{label, message?, prompt?}, title?})` | ≤ 12 fields; submit sends one user message. |
| `Buttons` | `Buttons({items:[{label, action, tone?}], title?})` | ≤ 6 buttons; `action` = `{send}` or `{open}`. |
| `Chips` | `Chips({items:[{label, prompt?}], title?})` | ≤ 8 quick suggestions; click sends `prompt` (default `label`). |

### Form field types

```text
Form({fields: [
  {name: 'name', label: '姓名', type: 'text', placeholder: '你的名字'},
  {name: 'note', label: '备注', type: 'textarea'},
  {name: 'date', label: '日期', type: 'date'},
  {name: 'count', label: '人数', type: 'number'},
  {name: 'level', label: '优先级', type: 'radio', options: ['低', '中', '高']},
  {name: 'notify', label: '通知我', type: 'switch'}
], submit: {label: '提交', prompt: '反馈：'}})
```

## Actions

```text
{send: '把这句话作为用户消息发回会话'}
{open: 'https://example.com'}
```

No third action type. Invalid actions are dropped and the rest of the card still renders.

## Limits

| Item | Limit |
| --- | --- |
| Source characters | 32,000 |
| Component nodes | 200 |
| Nesting depth | 24 |
| Single string | 4,000 characters |
| Errors | 24 |

## Fallbacks

- Unknown component → inline “未渲染：未知组件 X”.
- Missing / wrong fields → component-level fallback, card still renders.
- Invalid URL → cleared, no request.
- Oversized source / node count → failure state with a readable reason and next step.
