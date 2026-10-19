/** 生成式界面组件目录（Host 校验 / 提示词生成 / Client 渲染共用同一份）。
 *
 *  规则（v1）：
 *  - 每个组件只接受**一个位置参数**；参数四种形态：children（子节点数组）、
 *    object（属性对象，内部可含 children）、string、none。
 *  - 目录是这个能力唯一的"可用组件白名单"：模型越界 → 校验拒绝，渲染器不猜。
 *  - 这里不写渲染细节；渲染在 src/renderer.mjs，两边以 name/arg 对齐。
 */

/** 允许的 tone 值（颜色只承担语气，不承担唯一判断）。 */
export const TONES = ['info', 'success', 'warning', 'danger', 'neutral'];

/** 一条动作：发给 Agent（send）或打开链接（open）。 */
export const ACTIONS = {
  send: '把文本作为一条用户消息发送给 Agent',
  open: '在新标签页打开 http(s) 链接',
};

export const COMPONENTS = {
  Stack: {
    arg: 'children',
    signature: 'Stack([子组件…])',
    group: '布局',
    summary: '纵向排列子组件；通常作为 root 的骨架。',
  },
  Row: {
    arg: 'children',
    signature: 'Row([子组件…])',
    group: '布局',
    summary: '横向排列 2–4 个子组件（窄屏自动换行）。',
  },
  Card: {
    arg: 'object',
    signature: "Card({title?, children:[…], tone?})",
    group: '布局',
    summary: '带标题的容器；children 必填。',
    required: ['children'],
  },
  Heading: {
    arg: 'object',
    signature: 'Heading({text, level?})',
    group: '文本',
    summary: '标题，level 取 1–3（默认 2）。',
    required: ['text'],
  },
  Text: {
    arg: 'object',
    signature: 'Text({text, tone?})',
    group: '文本',
    summary: '一段正文；tone 默认 default，可 muted（次要）/ strong（强调）。',
    required: ['text'],
  },
  Callout: {
    arg: 'object',
    signature: 'Callout({text, title?, tone?})',
    group: '文本',
    summary: '提示块，tone 取 info/success/warning/danger。',
    required: ['text'],
  },
  Badge: {
    arg: 'object',
    signature: 'Badge({text, tone?})',
    group: '文本',
    summary: '小标签，用于状态、来源、分类。',
    required: ['text'],
  },
  Divider: {
    arg: 'none',
    signature: 'Divider()',
    group: '布局',
    summary: '分隔线。',
  },
  Code: {
    arg: 'object',
    signature: 'Code({text, lang?})',
    group: '文本',
    summary: '等宽代码/命令行片段（不做语法高亮）。',
    required: ['text'],
  },
  Stat: {
    arg: 'object',
    signature: 'Stat({label, value, hint?})',
    group: '数据',
    summary: '单个数字/短值，value 与 label 都是字符串。',
    required: ['label', 'value'],
  },
  Table: {
    arg: 'object',
    signature: 'Table({columns:[…], rows:[[…]], caption?})',
    group: '数据',
    summary: '对比表；rows 每行长度与 columns 相同，单元格只放文本。',
    required: ['columns', 'rows'],
    limits: {columns: 8, rows: 60},
  },
  Chart: {
    arg: 'object',
    signature: "Chart({kind, data:[{label, value}], title?, unit?})",
    group: '数据',
    summary: 'kind 取 bar/line/area/pie；data 1–60 条，value 为数字。',
    required: ['kind', 'data'],
    limits: {data: 60},
  },
  Timeline: {
    arg: 'object',
    signature: 'Timeline({items:[{time?, title, detail?, tone?}], title?})',
    group: '数据',
    summary: '时间线/行程；items 1–40 条，time 为短文本。',
    required: ['items'],
    limits: {items: 40},
  },
  List: {
    arg: 'object',
    signature: 'List({items:[文本…], ordered?, title?})',
    group: '数据',
    summary: '要点列表；items 1–40 条。',
    required: ['items'],
    limits: {items: 40},
  },
  Steps: {
    arg: 'object',
    signature: 'Steps({items:[{title, detail?, status?}], title?})',
    group: '数据',
    summary: '步骤/阶段列表；status 取 done/active/todo/warning，默认 todo。',
    required: ['items'],
    limits: {items: 20},
  },
  Progress: {
    arg: 'object',
    signature: 'Progress({items:[{label, value, max?, tone?}], title?})',
    group: '数据',
    summary: '进度条列表；value 0–max（默认 100），tone 取 info/success/warning/danger。',
    required: ['items'],
    limits: {items: 10},
  },
  Image: {
    arg: 'object',
    signature: 'Image({src, alt?, caption?})',
    group: '媒体',
    summary: '一张图片；src 只允许 http(s) URL。',
    required: ['src'],
  },
  Gallery: {
    arg: 'object',
    signature: 'Gallery({images:[{src, alt?, caption?}], columns?, title?})',
    group: '媒体',
    summary: '图片墙；images 1–12 张。',
    required: ['images'],
    limits: {images: 12},
  },
  Map: {
    arg: 'object',
    signature: 'Map({center:[lat,lng], zoom?, markers?, route?, title?, height?})',
    group: '媒体',
    summary: '地图；markers 为 [{lat,lng,label?,tone?}]，route 为 [[lat,lng]…] 折线。',
    required: ['center'],
    limits: {markers: 30, route: 200},
  },
  Tabs: {
    arg: 'object',
    signature: 'Tabs({tabs:[{label, children:[…]}], title?})',
    group: '交互',
    summary: '页签；每个 tab 的 children 为子组件。',
    required: ['tabs'],
    limits: {tabs: 6},
  },
  Accordion: {
    arg: 'object',
    signature: 'Accordion({items:[{title, children:[…]}], title?})',
    group: '交互',
    summary: '可折叠面板；一次展开一项，点击标题切换。',
    required: ['items'],
    limits: {items: 8},
  },
  Form: {
    arg: 'object',
    signature: 'Form({fields:[{name,label,type,placeholder?,options?,min?,max?,value?}], submit:{label, message?, prompt?}, title?})',
    group: '交互',
    summary: '表单；type 取 text/textarea/number/date/select/radio/checkbox/switch/slider。提交后把字段值拼成一条用户消息发送。',
    required: ['fields', 'submit'],
    limits: {fields: 12},
  },
  Buttons: {
    arg: 'object',
    signature: 'Buttons({items:[{label, action, tone?}], title?})',
    group: '交互',
    summary: '按钮组；action 为 {send: "文本"} 或 {open: "https://…"}。',
    required: ['items'],
    limits: {items: 6},
  },
  Chips: {
    arg: 'object',
    signature: 'Chips({items:[{label, prompt?}], title?})',
    group: '交互',
    summary: '快捷建议；点击把 prompt（默认 label）作为用户消息发送。',
    required: ['items'],
    limits: {items: 8},
  },
};

/** 组件名白名单（校验与渲染都必须命中）。 */
export const COMPONENT_NAMES = Object.keys(COMPONENTS);

/** 生成提示词里的组件目录文本（顺序稳定，便于 diff 与门禁）。 */
export function describeCatalog() {
  const lines = [];
  let group = '';
  for (const [name, spec] of Object.entries(COMPONENTS)) {
    if (spec.group !== group) {
      group = spec.group;
      lines.push(`\n【${group}】`);
    }
    lines.push(`- ${spec.signature} — ${spec.summary}`);
  }
  return lines.join('\n').trim();
}
