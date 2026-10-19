/* 自动生成，不要手改：源文件在 src/*.mjs，运行 `node build.mjs` 重新生成。
 * 生成式界面（Intelligent UI）Client 动态包：把 render_ui 工具卡片换成可交互界面。
 * 目标：dsh-intelligent-ui */
window.__ModuleLoader__.load({
  id: 'dsh-intelligent-ui',
  factory: (require) => {
    const React = require('react');

// ── src/catalog.mjs ──────────────────────────────────────────
/** 生成式界面组件目录（Host 校验 / 提示词生成 / Client 渲染共用同一份）。
 *
 *  规则（v1）：
 *  - 每个组件只接受**一个位置参数**；参数四种形态：children（子节点数组）、
 *    object（属性对象，内部可含 children）、string、none。
 *  - 目录是这个能力唯一的"可用组件白名单"：模型越界 → 校验拒绝，渲染器不猜。
 *  - 这里不写渲染细节；渲染在 src/renderer.mjs，两边以 name/arg 对齐。
 */

/** 允许的 tone 值（颜色只承担语气，不承担唯一判断）。 */
const TONES = ['info', 'success', 'warning', 'danger', 'neutral'];

/** 一条动作：发给 Agent（send）或打开链接（open）。 */
const ACTIONS = {
  send: '把文本作为一条用户消息发送给 Agent',
  open: '在新标签页打开 http(s) 链接',
};

const COMPONENTS = {
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
const COMPONENT_NAMES = Object.keys(COMPONENTS);

/** 生成提示词里的组件目录文本（顺序稳定，便于 diff 与门禁）。 */
function describeCatalog() {
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

// ── src/kit.mjs ──────────────────────────────────────────
/** 生成式界面语言（OpenUI Lang 风格的行式子集）解析、校验与编译。
 *
 *  语言（v1）：
 *    # 注释
 *    root = Stack([card, table])
 *    card = Card({title: '概览', children: [text]})
 *    text = Text({text: '一句话'})
 *
 *  - 语句：`标识符 = 表达式`，一行一条；表达式可跨行（括号未闭合时不影响切分）。
 *  - 表达式：组件调用、字符串、数字、true/false/null、数组、对象、标识符引用。
 *  - 入口：`root`。引用可以前向（流式渲染时先到 root 后到子节点）。
 *  - 不执行代码：解析结果是纯数据，渲染器只认 COMPONENTS 白名单。
 *
 *  这个文件同时被 Host（校验）与 Client（流式渲染）使用；构建时被内联进
 *  client/client.js，因此这里**不要**使用宿主 API、Node API 或 import 外的依赖。
 */

const LIMITS = {
  sourceChars: 32000,
  nodes: 200,
  depth: 24,
  stringChars: 4000,
  errors: 24,
};

/** 只保留可打印文本，防控制字符与超长文本。 */
function cleanText(value) {
  let text = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  let truncated = false;
  if (text.length > LIMITS.stringChars) {
    text = text.slice(0, LIMITS.stringChars);
    truncated = true;
  }
  return { text, truncated };
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\/[^\s]+$/i.test(value);
}

/** 把源码切成语句：括号深度为 0 的换行是语句边界；字符串内的换行不算。 */
function splitStatements(source) {
  const statements = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  let line = 1;
  let startLine = 1;
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (quote !== '') {
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === '\n') line += 1;
      if (ch === quote) quote = '';
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      i += 1;
      continue;
    }
    if (ch === '\n') line += 1;
    if (ch === '(' || ch === '[' || ch === '{') depth += 1;
    else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    else if (ch === '#' && depth === 0) {
      // 行注释：吞到换行
      const end = source.indexOf('\n', i);
      const stop = end === -1 ? source.length : end;
      if (stop > start) statements.push({ text: source.slice(start, i), line: startLine });
      start = stop;
      i = stop;
      startLine = line;
      continue;
    }
    if (ch === '\n' && depth === 0) {
      if (i > start) statements.push({ text: source.slice(start, i), line: startLine });
      start = i + 1;
      startLine = line;
    }
    i += 1;
  }
  const tail = source.slice(start);
  const pending = quote !== '' || depth > 0;
  return { statements, tail, pending, startLine };
}

class Scanner {
  constructor(text, line) {
    this.text = text;
    this.pos = 0;
    this.line = line;
  }

  error(code, message) {
    return { code, message, line: this.line };
  }

  skip() {
    while (this.pos < this.text.length && /\s/.test(this.text[this.pos])) this.pos += 1;
  }

  eof() {
    this.skip();
    return this.pos >= this.text.length;
  }

  peek() {
    this.skip();
    return this.text[this.pos];
  }

  eat(ch) {
    this.skip();
    if (this.text[this.pos] !== ch) return false;
    this.pos += 1;
    return true;
  }

  parseValue() {
    this.skip();
    const ch = this.text[this.pos];
    if (ch === undefined) throw this.error('unexpected-end', '表达式不完整');
    if (ch === "'" || ch === '"') return { t: 's', v: this.parseString(ch) };
    if (ch === '[') return this.parseArray();
    if (ch === '{') return this.parseObject();
    if (ch === '-' || (ch >= '0' && ch <= '9')) return this.parseNumber();
    if (/[A-Za-z_$]/.test(ch)) return this.parseIdentOrCall();
    throw this.error('unexpected-token', `无法识别的字符 "${ch}"`);
  }

  parseString(quote) {
    this.pos += 1;
    let out = '';
    while (this.pos < this.text.length) {
      const ch = this.text[this.pos];
      if (ch === '\\') {
        const next = this.text[this.pos + 1];
        if (next === 'n') out += '\n';
        else if (next === 't') out += '\t';
        else if (next === 'r') out += '\r';
        else if (next === undefined) break;
        else out += next;
        this.pos += 2;
        continue;
      }
      if (ch === quote) {
        this.pos += 1;
        return out;
      }
      out += ch;
      this.pos += 1;
    }
    throw this.error('unterminated-string', '字符串没有结束引号');
  }

  parseNumber() {
    const match = /^-?\d+(?:\.\d+)?/.exec(this.text.slice(this.pos));
    if (!match) throw this.error('bad-number', '数字格式不正确');
    this.pos += match[0].length;
    return { t: 'n', v: Number(match[0]) };
  }

  parseArray() {
    this.pos += 1;
    const items = [];
    this.skip();
    if (this.eat(']')) return { t: 'a', v: items };
    for (;;) {
      items.push(this.parseValue());
      this.skip();
      if (this.eat(']')) break;
      if (!this.eat(',')) throw this.error('bad-array', '数组元素之间需要逗号');
      this.skip();
      if (this.eat(']')) break;
    }
    return { t: 'a', v: items };
  }

  parseObject() {
    this.pos += 1;
    const entries = [];
    this.skip();
    if (this.eat('}')) return { t: 'o', v: entries };
    for (;;) {
      this.skip();
      let key;
      const ch = this.text[this.pos];
      if (ch === "'" || ch === '"') key = this.parseString(ch);
      else {
        const match = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(this.text.slice(this.pos));
        if (!match) throw this.error('bad-key', '对象键名不合法');
        key = match[0];
        this.pos += key.length;
      }
      this.skip();
      if (!this.eat(':')) throw this.error('bad-object', '对象键名后需要冒号');
      entries.push([key, this.parseValue()]);
      this.skip();
      if (this.eat('}')) break;
      if (!this.eat(',')) throw this.error('bad-object', '对象字段之间需要逗号');
      this.skip();
      if (this.eat('}')) break;
    }
    return { t: 'o', v: entries };
  }

  parseIdentOrCall() {
    const match = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(this.text.slice(this.pos));
    const name = match[0];
    this.pos += name.length;
    this.skip();
    if (this.text[this.pos] === '(') {
      this.pos += 1;
      const args = [];
      this.skip();
      if (this.eat(')')) return { t: 'c', name, args };
      for (;;) {
        args.push(this.parseValue());
        this.skip();
        if (this.eat(')')) break;
        if (!this.eat(',')) throw this.error('bad-call', '参数之间需要逗号');
        this.skip();
        if (this.eat(')')) break;
      }
      return { t: 'c', name, args };
    }
    if (name === 'true') return { t: 'b', v: true };
    if (name === 'false') return { t: 'b', v: false };
    if (name === 'null') return { t: 'z' };
    return { t: 'r', id: name };
  }
}

/** 解析一条语句；失败返回 error（不抛到外层）。 */
function parseStatement(text, line) {
  const scanner = new Scanner(text, line);
  scanner.skip();
  const match = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(scanner.text.slice(scanner.pos));
  if (!match) return { error: { code: 'bad-statement', message: '语句需要以标识符开头', line } };
  const id = match[0];
  scanner.pos += id.length;
  if (!scanner.eat('=')) return { error: { code: 'bad-statement', message: `"${id}" 后需要等号`, line } };
  try {
    const value = scanner.parseValue();
    if (!scanner.eof()) {
      return { error: { code: 'trailing', message: `"${id}" 的表达式后面有无法识别的内容`, line } };
    }
    return { id, value, line };
  } catch (error) {
    return { error: error && error.code ? error : { code: 'parse', message: String(error), line } };
  }
}

function toRaw(ast) {
  switch (ast.t) {
    case 's':
    case 'n':
    case 'b':
      return ast.v;
    case 'z':
      return null;
    case 'a':
      return ast.v.map(toRaw);
    case 'o': {
      const out = {};
      for (const [key, value] of ast.v) out[key] = toRaw(value);
      return out;
    }
    case 'r':
      return { __ref: ast.id };
    case 'c':
      return { __call: String(ast.name), args: ast.args.map(toRaw) };
    default:
      return null;
  }
}

function argKindOf(value) {
  if (value === null || value === undefined) return 'none';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number' || typeof value === 'boolean') return 'value';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object' && value.__node === undefined) return 'object';
  return 'node';
}

/**
 * 编译源码为可渲染树。
 * @param rawSource 模型输出的界面源码（可能还在流式增长）。
 * @param options.final 是否为最终源码（true 时把未解析引用记为错误）。
 * @returns {{root: object|null, nodes: object[], errors: object[], pending: boolean, stats: object, source: string}}
 */
function compileUi(rawSource, options = {}) {
  const final = options.final === true;
  const source = typeof rawSource === 'string' ? rawSource : '';
  const errors = [];
  const note = (code, message, line) => {
    if (errors.length < LIMITS.errors) errors.push({ code, message, line: line === undefined ? null : line });
  };
  const stats = { chars: source.length, nodes: 0, depth: 0, statements: 0, truncated: false, tooMany: false };
  if (source.length > LIMITS.sourceChars) {
    note('too-large', `界面源码超过 ${LIMITS.sourceChars} 字符上限`);
    stats.truncated = true;
    return { root: null, nodes: [], errors, pending: false, stats, source };
  }
  if (source.trim() === '') {
    return { root: null, nodes: [], errors, pending: true, stats, source };
  }

  const { statements, tail, pending } = splitStatements(source);
  const defs = new Map();
  for (const statement of statements) {
    const text = statement.text.trim();
    if (text === '') continue;
    if (text.startsWith('//')) continue;
    const parsed = parseStatement(text, statement.line);
    if (parsed.error) {
      note(parsed.error.code, parsed.error.message, parsed.error.line);
      continue;
    }
    if (defs.has(parsed.id)) {
      note('duplicate', `标识符 "${parsed.id}" 重复定义`, parsed.line);
      continue;
    }
    defs.set(parsed.id, { id: parsed.id, raw: toRaw(parsed.value), line: parsed.line });
  }
  if (tail.trim() !== '' && !pending) {
    const parsed = parseStatement(tail.trim(), -1);
    if (parsed.error) note(parsed.error.code, parsed.error.message, parsed.error.line);
    else if (defs.has(parsed.id)) note('duplicate', `标识符 "${parsed.id}" 重复定义`, -1);
    else defs.set(parsed.id, { id: parsed.id, raw: toRaw(parsed.value), line: -1 });
  }
  stats.statements = defs.size;
  if (defs.size === 0) {
    return { root: null, nodes: [], errors, pending: true, stats, source };
  }

  const synthetic = { seq: 0 };
  const walk = (raw, path) => {
    if (stats.tooMany) return null;
    if (raw === null || typeof raw !== 'object') return raw;
    if (Array.isArray(raw)) return raw.map((item) => walk(item, path));
    if (raw.__ref !== undefined) {
      const def = defs.get(raw.__ref);
      if (!def) {
        if (final) note('unresolved', `引用了不存在的组件 "${raw.__ref}"`);
        return { __missing: raw.__ref };
      }
      if (path.includes(raw.__ref)) {
        note('cycle', `组件 "${raw.__ref}" 形成了循环引用`);
        return { __missing: raw.__ref };
      }
      if (path.length >= LIMITS.depth) {
        note('too-deep', `组件层级超过 ${LIMITS.depth} 层`);
        return { __missing: raw.__ref };
      }
      if (def.raw === null || typeof def.raw !== 'object' || def.raw.__call === undefined) {
        return walk(def.raw, [...path, raw.__ref]);
      }
      return walkCall(def.raw, raw.__ref, [...path, raw.__ref]);
    }
    if (raw.__call !== undefined) {
      synthetic.seq += 1;
      return walkCall(raw, `~${synthetic.seq}`, path);
    }
    const out = {};
    for (const [key, value] of Object.entries(raw)) {
      if (key === 'src' || key === 'href') {
        if (typeof value === 'string' && value !== '' && !isHttpUrl(value)) {
          note('bad-url', `"${key}" 只允许 http(s) 链接`);
          out[key] = '';
          continue;
        }
      }
      if (key === 'action') {
        out[key] = sanitizeAction(walk(value, path), note);
        continue;
      }
      out[key] = walk(value, path);
    }
    return out;
  };

  const sanitizeAction = (value, report) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
    if (value.__missing !== undefined) return null;
    const action = {};
    if (typeof value.send === 'string' && value.send.trim() !== '') action.send = value.send;
    if (typeof value.open === 'string' && isHttpUrl(value.open)) action.open = value.open;
    if (action.send === undefined && action.open === undefined) {
      report('bad-action', '动作只支持 {send: "文本"} 或 {open: "https://…"}');
      return null;
    }
    return action;
  };

  const walkCall = (rawCall, id, path) => {
    const type = rawCall.__call;
    const spec = COMPONENTS[type];
    if (!spec) {
      note('unknown-component', `没有名为 "${type}" 的组件`);
      return { __unknown: type };
    }
    if (stats.nodes >= LIMITS.nodes) {
      note('too-many', `界面组件超过 ${LIMITS.nodes} 个上限`);
      stats.tooMany = true;
      return null;
    }
    stats.nodes += 1;
    stats.depth = Math.max(stats.depth, path.length);
    const args = rawCall.args || [];
    let arg = null;
    if (spec.arg === 'none') {
      if (args.length > 0) note('bad-args', `${type} 不接受参数`);
    } else if (args.length !== 1) {
      note('bad-args', `${type} 需要 1 个参数，收到 ${args.length} 个`);
    } else {
      arg = walk(args[0], path);
    }
    const compiled = { __node: true, id, type, arg };
    checkArg(compiled, spec, note);
    return compiled;
  };

  const checkArg = (node, spec, report) => {
    const kind = argKindOf(node.arg);
    if (spec.arg === 'none') return;
    if (kind === 'node') return; // 单个子组件
    if (spec.arg === 'children') {
      if (!Array.isArray(node.arg)) {
        report('bad-arg-kind', `${node.type} 的参数必须是子组件数组`);
        node.arg = [];
        return;
      }
      if (node.arg.length === 0) report('empty-children', `${node.type} 没有子组件`);
      const before = node.arg.length;
      node.arg = node.arg.filter((item) => item !== null && typeof item === 'object' && item.__node === true);
      if (node.arg.length !== before) report('bad-child', `${node.type} 的子组件数组里只能放组件引用`);
      return;
    }
    if (spec.arg === 'object') {
      if (node.arg === null || typeof node.arg !== 'object' || Array.isArray(node.arg) || node.arg.__node !== undefined) {
        report('bad-arg-kind', `${node.type} 的参数必须是对象`);
        node.arg = {};
        return;
      }
      for (const key of spec.required || []) {
        if (node.arg[key] === undefined) report('missing-prop', `${node.type} 缺少 ${key}`);
      }
      node.arg = cleanStrings(node.arg, report);
      for (const [limitKey, max] of Object.entries(spec.limits || {})) {
        const value = node.arg[limitKey];
        if (Array.isArray(value) && value.length > max) {
          report('too-many', `${node.type}.${limitKey} 超过 ${max} 条上限`);
          node.arg[limitKey] = value.slice(0, max);
        }
      }
      return;
    }
    if (spec.arg === 'string' && kind !== 'string') {
      report('bad-arg-kind', `${node.type} 的参数必须是字符串`);
      node.arg = '';
      return;
    }
    node.arg = cleanStrings(node.arg, report);
  };

  const cleanStrings = (value, report, depth = 0) => {
    if (depth > LIMITS.depth) return value;
    if (typeof value === 'string') {
      const { text, truncated } = cleanText(value);
      if (truncated) report('too-long', `文本超过 ${LIMITS.stringChars} 字符已截断`);
      return text;
    }
    if (Array.isArray(value)) return value.map((item) => cleanStrings(item, report, depth + 1));
    if (value && typeof value === 'object' && !value.__node) {
      const out = {};
      for (const [key, item] of Object.entries(value)) out[key] = cleanStrings(item, report, depth + 1);
      return out;
    }
    return value;
  };

  const rootDef = defs.get('root');
  let root = null;
  if (!rootDef) {
    if (final) note('no-root', '缺少入口 root');
  } else {
    root = walkCall(rootDef.raw, 'root', ['root']);
  }

  const nodes = [];
  const collect = (value) => {
    if (value === null || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      for (const item of value) collect(item);
      return;
    }
    if (value.__node === true) {
      nodes.push(value);
      collect(value.arg);
      return;
    }
    if (value.__missing !== undefined || value.__unknown !== undefined) return;
    for (const item of Object.values(value)) collect(item);
  };
  collect(root);

  return { root, nodes, errors, pending, stats, source };
}

// ── src/renderer-css.mjs ──────────────────────────────────────────
/** 渲染器样式。只用宿主主题 token（--dsw-alias-*），不引任何 Client 包。
 *  约定：
 *  - 组件类名统一 oui- 前缀；不写 !important，不引外部字体/图片；
 *  - 颜色只用下方 token，尺寸/圆角/字号用字面量，正文跟随宿主 14/22；
 *  - 任何块级容器 min-width: 0，窄屏（390px）不产生横向溢出；
 *  - 动效只有骨架与脉动，prefers-reduced-motion 下全部降级。
 */
const RENDERER_CSS = `
.oui-root {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 4px 0 2px;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.oui-root *,
.oui-root *::before,
.oui-root *::after { box-sizing: border-box; }
.oui-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  max-width: 100%;
}
.oui-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: stretch;
  min-width: 0;
  max-width: 100%;
}
.oui-row > * { flex: 1 1 220px; min-width: 0; max-width: 100%; }
/* 内容型组件在 Row 里按内容宽度，不参与拉伸（否则 Badge/Chips/Buttons 会被拉满整行） */
.oui-row > .oui-badge,
.oui-row > .oui-buttons,
.oui-row > .oui-chips,
.oui-row > .oui-text,
.oui-row > .oui-heading,
.oui-row > .oui-code-block,
.oui-row > .oui-divider { flex: 0 1 auto; }

/* ── 卡片 / 标题 / 正文 ─────────────────────────────────────────────── */
.oui-card {
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
}
.oui-card-info { border-left: 3px solid var(--dsw-alias-brand-primary); }
.oui-card-success { border-left: 3px solid var(--dsw-alias-state-success-primary); }
.oui-card-warning { border-left: 3px solid var(--dsw-alias-state-warn-primary); }
.oui-card-danger { border-left: 3px solid var(--dsw-alias-state-error-primary); }
.oui-card-neutral { border-left: 3px solid var(--dsw-alias-border-l2); }
.oui-card-title { font-size: 15px; line-height: 22px; font-weight: 600; }
.oui-heading { font-weight: 600; margin: 0; min-width: 0; }
.oui-heading-1 { font-size: 22px; line-height: 30px; }
.oui-heading-2 { font-size: 18px; line-height: 26px; }
.oui-heading-3 { font-size: 15px; line-height: 22px; }
.oui-text { white-space: pre-wrap; word-break: break-word; min-width: 0; }
.oui-text-default { color: var(--dsw-alias-label-primary); }
.oui-text-muted { color: var(--dsw-alias-label-secondary); }
.oui-text-strong { font-weight: 600; }
.oui-divider {
  height: 1px;
  margin: 2px 0;
  background: var(--dsw-alias-border-l1);
  flex: 0 0 auto;
}
.oui-callout {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-left-width: 3px;
  background: var(--dsw-alias-bg-layer-2);
  min-width: 0;
}
.oui-callout-title { font-size: 13px; line-height: 20px; font-weight: 600; }
.oui-callout-text { white-space: pre-wrap; word-break: break-word; }
.oui-callout-info { border-left-color: var(--dsw-alias-brand-primary); }
.oui-callout-info .oui-callout-title { color: var(--dsw-alias-brand-primary); }
.oui-callout-success { border-left-color: var(--dsw-alias-state-success-primary); }
.oui-callout-success .oui-callout-title { color: var(--dsw-alias-state-success-primary); }
.oui-callout-warning { border-left-color: var(--dsw-alias-state-warn-primary); }
.oui-callout-warning .oui-callout-title { color: var(--dsw-alias-state-warn-primary); }
.oui-callout-danger { border-left-color: var(--dsw-alias-state-error-primary); }
.oui-callout-danger .oui-callout-title { color: var(--dsw-alias-state-error-primary); }
.oui-callout-neutral { border-left-color: var(--dsw-alias-border-l2); }
.oui-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  align-self: flex-start;
}
.oui-badge-info { color: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.oui-badge-success { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.oui-badge-warning { color: var(--dsw-alias-state-warn-primary); border-color: var(--dsw-alias-state-warn-primary); }
.oui-badge-danger { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }
.oui-badge-neutral { color: var(--dsw-alias-label-secondary); border-color: var(--dsw-alias-border-l2); }
.oui-code-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
}
.oui-code-lang {
  font-size: 11px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary);
}
.oui-code {
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-specific-sidebar-fill);
  overflow-x: auto;
  max-width: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 20px;
  white-space: pre;
  color: var(--dsw-alias-label-primary);
}
.oui-fallback {
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
  min-width: 0;
}
.oui-unknown {
  color: var(--dsw-alias-state-warn-primary);
  font-size: 12px;
  line-height: 18px;
  min-width: 0;
}

/* ── 数据：Stat / Table / Chart ─────────────────────────────────────── */
.oui-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  min-width: 0;
}
.oui-stat-label { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-stat-value { font-size: 22px; line-height: 30px; font-weight: 600; }
.oui-stat-hint { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-stat-value, .oui-table td, .oui-table th, .oui-field-value, .oui-chart-svg text { font-variant-numeric: tabular-nums; }
.oui-table-wrap { display: flex; flex-direction: column; gap: 6px; min-width: 0; max-width: 100%; }
.oui-table-scroll {
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
}
.oui-table { border-collapse: collapse; width: 100%; font-size: 13px; line-height: 20px; }
.oui-table-caption {
  caption-side: top;
  padding: 10px 12px 6px;
  text-align: left;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
}
.oui-table th,
.oui-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  text-align: left;
  white-space: nowrap;
}
.oui-table th {
  font-weight: 600;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}
.oui-table tbody tr:last-child td { border-bottom: none; }
.oui-table-note { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
}
.oui-chart-title { font-weight: 600; font-size: 14px; line-height: 22px; }
.oui-chart-body { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.oui-chart-svg { display: block; width: 100%; height: auto; max-width: 100%; }
.oui-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
  min-width: 0;
}
.oui-legend-item { display: inline-flex; align-items: center; gap: 6px; min-width: 0; max-width: 100%; }
.oui-legend-swatch { width: 10px; height: 10px; border-radius: 3px; flex: 0 0 auto; }
.oui-legend-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

/* ── Timeline / List ────────────────────────────────────────────────── */
.oui-timeline { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.oui-timeline-title { font-weight: 600; margin-bottom: 4px; }
.oui-timeline-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; min-width: 0; }
.oui-timeline-item {
  position: relative;
  display: flex;
  gap: 10px;
  padding: 6px 0 10px 20px;
  min-width: 0;
}
.oui-timeline-item::before {
  content: "";
  position: absolute;
  left: 5px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--dsw-alias-border-l1);
}
.oui-timeline-item:first-child::before { top: 12px; }
.oui-timeline-item:last-child::before { bottom: auto; height: 12px; }
.oui-timeline-dot {
  position: absolute;
  left: 0;
  top: 9px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--dsw-alias-state-idle-primary);
  border: 2px solid var(--dsw-alias-bg-base);
}
.oui-timeline-dot-info { background: var(--dsw-alias-brand-primary); }
.oui-timeline-dot-success { background: var(--dsw-alias-state-success-primary); }
.oui-timeline-dot-warning { background: var(--dsw-alias-state-warn-primary); }
.oui-timeline-dot-danger { background: var(--dsw-alias-state-error-primary); }
.oui-timeline-dot-neutral { background: var(--dsw-alias-state-idle-primary); }
.oui-timeline-time {
  flex: 0 0 auto;
  min-width: 52px;
  font-size: 12px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
}
.oui-timeline-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.oui-timeline-item-title { font-weight: 600; }
.oui-timeline-detail {
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}
.oui-list { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.oui-list-title { font-weight: 600; }
.oui-list-items { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oui-list-items li { word-break: break-word; }

/* ── 步骤 / 进度 / 折叠 ────────────────────────────────────────────── */
.oui-steps { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.oui-steps-title, .oui-progress-title, .oui-accordion-title { font-weight: 600; }
.oui-step-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; min-width: 0; }
.oui-step { position: relative; display: flex; gap: 10px; padding: 0 0 14px 0; min-width: 0; }
.oui-step:last-child { padding-bottom: 0; }
.oui-step::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 26px;
  bottom: 0;
  width: 1px;
  background: var(--dsw-alias-border-l1);
}
.oui-step:last-child::before { display: none; }
.oui-step-index {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
}
.oui-step-done .oui-step-index { background: var(--dsw-alias-state-success-primary); border-color: transparent; color: var(--dsw-alias-bg-base); }
.oui-step-active .oui-step-index { background: var(--dsw-alias-brand-primary); border-color: transparent; color: var(--dsw-alias-bg-base); }
.oui-step-warning .oui-step-index { background: var(--dsw-alias-state-warn-primary); border-color: transparent; color: var(--dsw-alias-bg-base); }
.oui-step-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; padding-top: 2px; }
.oui-step-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; min-width: 0; }
.oui-step-title { font-weight: 600; min-width: 0; }
.oui-step-status { flex: 0 0 auto; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); }
.oui-step-active .oui-step-status { color: var(--dsw-alias-brand-primary); }
.oui-step-done .oui-step-status { color: var(--dsw-alias-state-success-primary); }
.oui-step-warning .oui-step-status { color: var(--dsw-alias-state-warn-primary); }
.oui-step-detail { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }

.oui-progress { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.oui-progress-item { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oui-progress-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 12px; line-height: 18px; }
.oui-progress-label { color: var(--dsw-alias-label-secondary); min-width: 0; }
.oui-progress-value { color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; flex: 0 0 auto; }
.oui-progress-track { height: 8px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; }
.oui-progress-fill { display: block; height: 100%; border-radius: 999px; background-image: linear-gradient(90deg, var(--oui-action, var(--dsw-alias-brand-primary)), var(--dsw-alias-label-secondary)); }
.oui-progress-success { background-image: linear-gradient(90deg, var(--dsw-alias-state-success-primary), var(--dsw-alias-label-secondary)); }
.oui-progress-warning { background-image: linear-gradient(90deg, var(--dsw-alias-state-warn-primary), var(--dsw-alias-label-secondary)); }
.oui-progress-danger { background-image: linear-gradient(90deg, var(--dsw-alias-state-error-primary), var(--dsw-alias-label-secondary)); }

.oui-accordion { display: flex; flex-direction: column; min-width: 0; border-top: 1px solid var(--dsw-alias-border-l1); }
.oui-accordion-item { border-bottom: 1px solid var(--dsw-alias-border-l1); min-width: 0; }
.oui-accordion-trigger {
  appearance: none;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.oui-accordion-trigger:hover { color: var(--dsw-alias-brand-primary); }
.oui-accordion-label { font-weight: 600; min-width: 0; }
.oui-accordion-caret { color: var(--dsw-alias-label-secondary); font-size: 18px; line-height: 1; flex: 0 0 auto; }
.oui-accordion-panel { padding: 0 0 12px 0; display: flex; flex-direction: column; gap: 8px; min-width: 0; }

/* ── 媒体：Image / Gallery / Map ────────────────────────────────────── */
.oui-media { margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; max-width: 100%; }
.oui-media-frame {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  max-width: 100%;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
}
.oui-media-img { display: block; width: 100%; max-width: 100%; height: auto; object-fit: cover; }
.oui-media-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}
.oui-media-placeholder {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 18px 12px;
  border-radius: 12px;
  border: 1px dashed var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
  text-align: center;
  min-width: 0;
}
.oui-media-placeholder-text { font-weight: 600; }
.oui-media-placeholder-hint { font-size: 12px; line-height: 18px; }
.oui-media-caption { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); word-break: break-word; }
.oui-media-compact .oui-media-frame { min-height: 90px; }
.oui-media-compact .oui-media-caption { font-size: 11px; line-height: 16px; }
.oui-gallery { display: flex; flex-direction: column; gap: 8px; min-width: 0; max-width: 100%; }
.oui-gallery-title { font-weight: 600; }
.oui-gallery-grid { display: grid; gap: 8px; min-width: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.oui-gallery-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.oui-gallery-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.oui-gallery-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.oui-gallery-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.oui-map { display: flex; flex-direction: column; gap: 6px; min-width: 0; max-width: 100%; }
.oui-map-title { font-weight: 600; }
.oui-map-canvas {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
}
.oui-map-tiles {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
}
.oui-map-tile { display: block; width: 100%; height: 100%; object-fit: cover; user-select: none; pointer-events: none; }
.oui-map-tile-missing { background: var(--dsw-alias-bg-layer-2); }
.oui-map-grid {
  position: absolute;
  inset: 0;
  background-color: var(--dsw-alias-bg-layer-1);
  background-image:
    linear-gradient(to right, var(--dsw-alias-border-l1) 1px, transparent 1px),
    linear-gradient(to bottom, var(--dsw-alias-border-l1) 1px, transparent 1px);
  background-size: 40px 40px;
}
.oui-map-route,
.oui-map-markers {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.oui-map-labels { position: absolute; inset: 0; pointer-events: none; }
.oui-map-label {
  position: absolute;
  transform: translate(-50%, 10px);
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-size: 11px;
  line-height: 16px;
}
.oui-map-badge {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
}
.oui-map-attr {
  position: absolute;
  right: 6px;
  bottom: 4px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 14px;
  text-decoration: none;
}
.oui-map-note { margin: 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }

/* ── 交互：Tabs / Form / Buttons / Chips ────────────────────────────── */
.oui-tabs { display: flex; flex-direction: column; gap: 10px; min-width: 0; max-width: 100%; }
.oui-tabs-title { font-weight: 600; }
.oui-tablist {
  display: flex;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.oui-tab {
  appearance: none;
  flex: 0 0 auto;
  margin-bottom: -1px;
  padding: 7px 10px;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 8px 8px 0 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}
.oui-tab:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.oui-tab-active { color: var(--dsw-alias-brand-primary); border-bottom-color: var(--dsw-alias-brand-primary); font-weight: 600; }
.oui-tabpanel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
  border-radius: 8px;
}
.oui-form { display: flex; flex-direction: column; gap: 10px; min-width: 0; max-width: 100%; }
.oui-form-title { font-weight: 600; }
.oui-form-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.oui-form-grid {
  display: grid;
  gap: 10px 12px;
  min-width: 0;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}
.oui-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oui-field-text { min-width: 0; }
.oui-field-label { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-field-input,
.oui-field-select,
.oui-field-textarea {
  width: 100%;
  min-width: 0;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  padding: 7px 8px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
}
.oui-field-textarea { min-height: 84px; resize: vertical; }
.oui-field-radio { display: flex; flex-wrap: wrap; gap: 8px 14px; min-width: 0; }
.oui-radio-option { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; line-height: 20px; min-width: 0; }
.oui-radio-option input { accent-color: var(--dsw-alias-brand-primary); width: 16px; height: 16px; flex: 0 0 auto; }
.oui-field-switch {
  appearance: none;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
  position: relative;
  cursor: pointer;
  flex: 0 0 auto;
  transition: background-color 180ms ease, border-color 180ms ease;
}
.oui-field-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  transition: transform 180ms ease;
}
.oui-field-switch:checked { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.oui-field-switch:checked::after { transform: translateX(16px); }
.oui-field-input::placeholder, .oui-field-textarea::placeholder { color: var(--dsw-alias-label-secondary); }
.oui-field-slider-wrap { display: flex; align-items: center; gap: 8px; min-width: 0; }
.oui-field-slider { flex: 1 1 auto; min-width: 0; accent-color: var(--dsw-alias-brand-primary); }
.oui-field-value { flex: 0 0 auto; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-field-checkbox-field { justify-content: flex-end; }
.oui-field-checkbox-label { display: flex; align-items: center; gap: 8px; min-height: 34px; font-size: 13px; line-height: 20px; }
.oui-field-checkbox { width: 16px; height: 16px; flex: 0 0 auto; accent-color: var(--dsw-alias-brand-primary); }
.oui-form-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; min-width: 0; }
.oui-form-notice { font-size: 12px; line-height: 18px; color: var(--dsw-alias-state-warn-primary); }
.oui-buttons { display: flex; flex-direction: column; gap: 8px; min-width: 0; max-width: 100%; }
.oui-buttons-title { font-weight: 600; }
.oui-buttons-row { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.oui-button {
  appearance: none;
  max-width: 100%;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.oui-button:hover { background: var(--dsw-alias-bg-layer-2); }
.oui-button-primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }
.oui-button-primary:hover { background: var(--dsw-alias-brand-primary); opacity: 0.9; }
.oui-button-info { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.oui-button-success { border-color: var(--dsw-alias-state-success-primary); color: var(--dsw-alias-state-success-primary); }
.oui-button-warning { border-color: var(--dsw-alias-state-warn-primary); color: var(--dsw-alias-state-warn-primary); }
.oui-button-danger { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.oui-button-neutral { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }
.oui-button-chosen { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-2); }
.oui-button:disabled,
.oui-button[aria-disabled="true"] { cursor: not-allowed; opacity: 0.55; }
.oui-chips { display: flex; flex-direction: column; gap: 8px; min-width: 0; max-width: 100%; }
.oui-chips-title { font-weight: 600; }
.oui-chips-row { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.oui-chip {
  appearance: none;
  max-width: 100%;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.oui-chip:hover { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.oui-chip-chosen { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); font-weight: 600; }
.oui-chip:disabled,
.oui-chip[aria-disabled="true"] { cursor: not-allowed; opacity: 0.55; }

/* ── 焦点可见（键盘可达）────────────────────────────────────────────── */
.oui-root :focus-visible {
  outline: 3px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.oui-root a:focus-visible,
.oui-root button:focus-visible,
.oui-root input:focus-visible,
.oui-root select:focus-visible,
.oui-root [tabindex]:focus-visible {
  outline: 3px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.oui-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* ── 流式骨架与空态（client-entry 使用）────────────────────────────── */
.oui-skeleton { display: flex; flex-direction: column; gap: 10px; padding: 6px 0; }
.oui-skeleton-row {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--dsw-alias-bg-layer-2), var(--dsw-alias-bg-layer-1), var(--dsw-alias-bg-layer-2));
  background-size: 200% 100%;
  animation: oui-shimmer 1.4s ease-in-out infinite;
}
@keyframes oui-shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
.oui-empty {
  border: 1px dashed var(--dsw-alias-border-l2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.oui-empty-title { font-weight: 600; }
.oui-empty-hint { color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 20px; }
.oui-stream-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}
.oui-stream-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dsw-alias-brand-primary);
  animation: oui-pulse 1.1s ease-in-out infinite;
}
@keyframes oui-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

/* ── 窄屏（390px）与动效降级 ───────────────────────────────────────── */
@media (max-width: 480px) {
  .oui-row > * { flex-basis: 100%; }
  .oui-row > .oui-badge,
  .oui-row > .oui-buttons,
  .oui-row > .oui-chips,
  .oui-row > .oui-text,
  .oui-row > .oui-heading,
  .oui-row > .oui-code-block,
  .oui-row > .oui-divider { flex-basis: auto; }
  .oui-card { padding: 12px; }
  .oui-form-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .oui-gallery-cols-3,
  .oui-gallery-cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .oui-chart-legend { gap: 2px 10px; }
  .oui-legend-text { max-width: 140px; }
}

.oui-turn-card {
  margin: 8px 0 2px;
  min-width: 0;
  max-width: 100%;
}

/* ── 纸上玻璃 Paper Glass v1.0 适配层（2026-10-18） ─────────────────────
 * 结构色全部来自宿主 dsw-alias；渐变只用品牌色与语义色 color-mix 派生。
 * 原则：玻璃只做控制层（按钮/标签/工具条），内容卡保持标准表面。
 */
.oui-root {
  --oui-surface: var(--dsw-alias-bg-layer-1);
  --oui-ink: var(--dsw-alias-label-primary);
  --oui-muted: var(--dsw-alias-label-secondary);
  --oui-line: var(--dsw-alias-border-l1);
  --oui-action: var(--dsw-alias-brand-primary);
  --oui-success: var(--dsw-alias-state-success-primary);
  --oui-warning: var(--dsw-alias-state-warn-primary);
  --oui-danger: var(--dsw-alias-state-error-primary);
  --oui-grad: linear-gradient(135deg, var(--oui-action), color-mix(in srgb, var(--oui-action) 55%, var(--dsw-alias-label-secondary)));
  --oui-grad-soft: linear-gradient(150deg, color-mix(in srgb, var(--oui-action) 12%, transparent), transparent 62%);
  --oui-glass: color-mix(in srgb, var(--oui-surface) 62%, transparent);
}
.oui-card {
  background-color: var(--oui-surface);
  border: 1px solid var(--oui-line);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--oui-ink) 6%, transparent);
}
.oui-button {
  border-radius: 8px;
  background-color: var(--oui-glass);
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  backdrop-filter: blur(16px) saturate(170%);
  border: 1px solid var(--oui-line);
}
.oui-button-primary {
  background-color: transparent;
  background-image: var(--oui-grad);
  border-color: transparent;
  color: var(--dsw-alias-bg-base);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--oui-surface) 35%, transparent);
}
.oui-button-primary:hover { filter: brightness(1.06); }
.oui-chip-chosen,
.oui-tab-chosen {
  background-image: linear-gradient(120deg, color-mix(in srgb, var(--oui-action) 22%, transparent), color-mix(in srgb, var(--oui-danger) 14%, transparent));
  border-color: color-mix(in srgb, var(--oui-action) 38%, transparent);
}
.oui-badge {
  border-radius: 999px;
  background-color: color-mix(in srgb, currentColor 8%, var(--oui-surface));
}
.oui-callout { border-radius: 12px; }
.oui-callout-info { background-color: color-mix(in srgb, var(--oui-action) 8%, var(--oui-surface)); }
.oui-callout-success { background-color: color-mix(in srgb, var(--oui-success) 8%, var(--oui-surface)); }
.oui-callout-warning { background-color: color-mix(in srgb, var(--oui-warning) 10%, var(--oui-surface)); }
.oui-callout-danger { background-color: color-mix(in srgb, var(--oui-danger) 8%, var(--oui-surface)); }
.oui-segmented, .oui-tablist { background-color: var(--oui-glass); -webkit-backdrop-filter: blur(18px) saturate(175%); backdrop-filter: blur(18px) saturate(175%); }
.oui-input, .oui-textarea, .oui-select { background-color: color-mix(in srgb, var(--oui-surface) 82%, transparent); }
.oui-stat-value {
  background-image: var(--oui-grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.oui-chart-title, .oui-card-title { letter-spacing: 0; }
@media (prefers-reduced-transparency: reduce) {
  .oui-button, .oui-segmented, .oui-tablist { -webkit-backdrop-filter: none; backdrop-filter: none; background-color: var(--dsw-alias-bg-layer-1); }
}
[data-transparency="reduced"] .oui-button,
[data-transparency="reduced"] .oui-segmented,
[data-transparency="reduced"] .oui-tablist {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  background-color: var(--dsw-alias-bg-layer-1);
}
@media (prefers-contrast: more) {
  .oui-card, .oui-stat, .oui-callout, .oui-field-input, .oui-field-select { border-color: var(--dsw-alias-label-secondary); }
  .oui-text-muted, .oui-stat-label, .oui-stat-hint, .oui-media-caption { color: var(--dsw-alias-label-primary); }
}
[data-contrast="high"] .oui-card,
[data-contrast="high"] .oui-stat,
[data-contrast="high"] .oui-callout,
[data-contrast="high"] .oui-field-input,
[data-contrast="high"] .oui-field-select { border-color: var(--dsw-alias-label-secondary); }
[data-contrast="high"] .oui-text-muted,
[data-contrast="high"] .oui-stat-label,
[data-contrast="high"] .oui-stat-hint,
[data-contrast="high"] .oui-media-caption { color: var(--dsw-alias-label-primary); }

@media (prefers-reduced-motion: reduce) {
  .oui-skeleton-row,
  .oui-stream-dot { animation: none; }
  .oui-button,
  .oui-chip,
  .oui-tab { transition: none; }
}
`;

// ── src/renderer.mjs ──────────────────────────────────────────
/** 渲染器：把 compileUi 产出的树渲染成 React 元素。
 *
 *  - 顶层只导出 createUi 一个声明，其余全部收在闭包里（build.mjs 会拼接并检查顶层重名）。
 *  - 只用 React.createElement（无 JSX），样式只走 renderer-css.mjs 的 oui- 类名。
 *  - 节点形态：{ __node: true, id, type, arg }；未解析引用 { __missing: id }；
 *    未知组件 { __unknown: type }。所有字段都按"缺字段 / 类型不对"降级，不抛错。
 *  - ctx: { streaming, send(text), open(url) }；streaming 时禁用提交与动作，界面仍可读。
 *  - 组件目录见 src/catalog.mjs，本文件逐个实现；动作只有 send / open 两种。
 */

function createUi(React) {
  const h = React.createElement;
  const useState = React.useState;
  const useEffect = typeof React.useEffect === 'function' ? React.useEffect : function noopEffect() {};
  const useMemo = React.useMemo;
  const useCallback = typeof React.useCallback === 'function'
    ? React.useCallback
    : function passthroughCallback(fn) { return fn; };
  const useUid = typeof React.useId === 'function'
    ? React.useId
    : function fallbackUid() { return 'oui'; };

  const TONE_LIST = Array.isArray(TONES) ? TONES.slice() : ['info', 'success', 'warning', 'danger', 'neutral'];
  const CHART_COLORS = [
    'var(--dsw-alias-brand-primary)',
    'var(--dsw-alias-state-success-primary)',
    'var(--dsw-alias-state-warn-primary)',
    'var(--dsw-alias-state-error-primary)',
    'var(--dsw-alias-state-idle-primary)',
    'var(--dsw-alias-label-secondary)',
  ];
  const MAX_DEPTH = 40;

  /* ── 基础工具：任何非法输入都收敛成安全值，不抛错 ───────────────────── */

  function isObject(value) {
    return value !== null && typeof value === 'object' && Array.isArray(value) === false;
  }

  function isNodeLike(value) {
    if (!isObject(value)) return false;
    return value.__node === true || value.__missing !== undefined || value.__unknown !== undefined;
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asText(value, fallback) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return typeof fallback === 'string' ? fallback : '';
  }

  function asNumber(value, fallback) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  }

  function asBoolean(value, fallback) {
    return typeof value === 'boolean' ? value : fallback;
  }

  function clamp(value, min, max) {
    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(number)) return min;
    if (number < min) return min;
    if (number > max) return max;
    return number;
  }

  function asTone(value, fallback) {
    if (typeof value === 'string' && TONE_LIST.indexOf(value) !== -1) return value;
    return typeof fallback === 'string' ? fallback : 'neutral';
  }

  function isHttpUrl(value) {
    return typeof value === 'string' && /^https?:\/\/[^\s]+$/i.test(value);
  }

  function sanitizeId(value) {
    const text = String(value === undefined || value === null ? '' : value).replace(/[^a-zA-Z0-9_-]/g, '');
    return text === '' ? 'oui' : text;
  }

  function formatNumber(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '0';
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 100) / 100);
  }

  function toneColor(tone) {
    switch (tone) {
      case 'info':
        return 'var(--dsw-alias-brand-primary)';
      case 'success':
        return 'var(--dsw-alias-state-success-primary)';
      case 'warning':
        return 'var(--dsw-alias-state-warn-primary)';
      case 'danger':
        return 'var(--dsw-alias-state-error-primary)';
      default:
        return 'var(--dsw-alias-state-idle-primary)';
    }
  }

  /* ── 树渲染：Node 是唯一递归入口，子节点一律通过 React 组件渲染 ─────── */

  function renderChildList(value, ctx, depth) {
    if (Array.isArray(value)) {
      return value.map(function (item, index) {
        return h(Node, { key: index, node: item, ctx: ctx, depth: depth + 1 });
      });
    }
    if (isNodeLike(value)) {
      return [h(Node, { key: 'only', node: value, ctx: ctx, depth: depth + 1 })];
    }
    return [];
  }

  function Node(props) {
    const rawNode = props ? props.node : null;
    const ctx = props && isObject(props.ctx) ? props.ctx : {};
    const depth = props && typeof props.depth === 'number' ? props.depth : 0;
    if (depth > MAX_DEPTH) return null;
    if (rawNode === null || rawNode === undefined || rawNode === false || rawNode === true) return null;
    if (typeof rawNode === 'string') return rawNode;
    if (typeof rawNode === 'number') return Number.isFinite(rawNode) ? String(rawNode) : null;
    if (Array.isArray(rawNode)) {
      return h('div', { className: 'oui-stack' }, ...renderChildList(rawNode, ctx, depth));
    }
    if (!isObject(rawNode)) return null;
    if (rawNode.__missing !== undefined) return null;
    if (rawNode.__unknown !== undefined) {
      return h('div', { className: 'oui-unknown' }, '未渲染：未知组件 ' + asText(rawNode.__unknown, '未知'));
    }
    if (rawNode.__node !== true) return null;
    const arg = rawNode.arg;
    switch (rawNode.type) {
      case 'Stack':
        return h(StackView, { arg: arg, ctx: ctx, depth: depth });
      case 'Row':
        return h(RowView, { arg: arg, ctx: ctx, depth: depth });
      case 'Card':
        return h(CardView, { arg: arg, ctx: ctx, depth: depth });
      case 'Heading':
        return h(HeadingView, { arg: arg });
      case 'Text':
        return h(TextView, { arg: arg });
      case 'Callout':
        return h(CalloutView, { arg: arg });
      case 'Badge':
        return h(BadgeView, { arg: arg });
      case 'Divider':
        return h(DividerView);
      case 'Code':
        return h(CodeView, { arg: arg });
      case 'Stat':
        return h(StatView, { arg: arg });
      case 'Table':
        return h(TableView, { arg: arg });
      case 'Chart':
        return h(ChartView, { arg: arg });
      case 'Timeline':
        return h(TimelineView, { arg: arg });
      case 'List':
        return h(ListView, { arg: arg });
      case 'Steps':
        return h(StepsView, { arg: arg });
      case 'Progress':
        return h(ProgressView, { arg: arg });
      case 'Image':
        return h(ImageView, { arg: arg });
      case 'Gallery':
        return h(GalleryView, { arg: arg });
      case 'Map':
        return h(MapView, { arg: arg });
      case 'Tabs':
        return h(TabsView, { arg: arg, ctx: ctx, depth: depth });
      case 'Accordion':
        return h(AccordionView, { arg: arg, ctx: ctx, depth: depth });
      case 'Form':
        return h(FormView, { arg: arg, ctx: ctx });
      case 'Buttons':
        return h(ButtonsView, { arg: arg, ctx: ctx });
      case 'Chips':
        return h(ChipsView, { arg: arg, ctx: ctx });
      default:
        return h('div', { className: 'oui-unknown' }, '未实现组件：' + asText(rawNode.type, '未知'));
    }
  }

  /* ── 布局与文本 ─────────────────────────────────────────────────────── */

  function StackView(props) {
    return h('div', { className: 'oui-stack' }, ...renderChildList(props.arg, props.ctx, props.depth));
  }

  function RowView(props) {
    return h('div', { className: 'oui-row' }, ...renderChildList(props.arg, props.ctx, props.depth));
  }

  function CardView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const title = asText(data.title, '');
    const tone = asTone(data.tone, 'neutral');
    const children = renderChildList(data.children, props.ctx, props.depth);
    return h(
      'section',
      { className: 'oui-card oui-card-' + tone },
      title === '' ? null : h('div', { className: 'oui-card-title' }, title),
      ...children,
    );
  }

  function HeadingView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const level = Math.round(clamp(asNumber(data.level, 2), 1, 3));
    const text = asText(data.text, '');
    if (text === '') return null;
    const tag = ['h2', 'h3', 'h4'][level - 1];
    return h(tag, { className: 'oui-heading oui-heading-' + level }, text);
  }

  function TextView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const text = asText(data.text, '');
    if (text === '') return null;
    const tone = data.tone === 'muted' ? 'muted' : data.tone === 'strong' ? 'strong' : 'default';
    return h('div', { className: 'oui-text oui-text-' + tone }, text);
  }

  function CalloutView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const text = asText(data.text, '');
    const title = asText(data.title, '');
    if (text === '' && title === '') return null;
    const tone = asTone(data.tone, 'info');
    return h(
      'div',
      { className: 'oui-callout oui-callout-' + tone, role: 'note' },
      title === '' ? null : h('div', { className: 'oui-callout-title' }, title),
      text === '' ? null : h('div', { className: 'oui-callout-text' }, text),
    );
  }

  function BadgeView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const text = asText(data.text, '');
    if (text === '') return null;
    return h('span', { className: 'oui-badge oui-badge-' + asTone(data.tone, 'neutral') }, text);
  }

  function DividerView() {
    return h('div', { className: 'oui-divider', role: 'separator', 'aria-orientation': 'horizontal' });
  }

  function CodeView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const text = asText(data.text, '');
    const lang = asText(data.lang, '');
    if (text === '') return h('div', { className: 'oui-fallback' }, '代码内容为空');
    return h(
      'div',
      { className: 'oui-code-block' },
      lang === '' ? null : h('div', { className: 'oui-code-lang' }, lang),
      h('pre', { className: 'oui-code', tabIndex: 0 }, h('code', {}, text)),
    );
  }

  function StatView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const label = asText(data.label, '');
    const value = asText(data.value, '');
    const hint = asText(data.hint, '');
    if (label === '' && value === '') return null;
    return h(
      'div',
      { className: 'oui-stat' },
      label === '' ? null : h('div', { className: 'oui-stat-label' }, label),
      value === '' ? null : h('div', { className: 'oui-stat-value' }, value),
      hint === '' ? null : h('div', { className: 'oui-stat-hint' }, hint),
    );
  }

  /* ── 数据组件 ───────────────────────────────────────────────────────── */

  function TableView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const caption = asText(data.caption, '');
    const columns = asArray(data.columns).slice(0, 8).map(function (column, index) {
      if (isObject(column)) return asText(column.label, '') || asText(column.title, '') || '列 ' + (index + 1);
      return asText(column, '') || '列 ' + (index + 1);
    });
    const rows = asArray(data.rows).slice(0, 60).map(function (row) {
      return asArray(row).map(function (cell) {
        return asText(cell, '');
      });
    });
    let columnCount = columns.length;
    rows.forEach(function (row) {
      if (row.length > columnCount) columnCount = row.length;
    });
    if (columnCount === 0) {
      return h('div', { className: 'oui-fallback' }, '表格没有可显示的列');
    }
    const header = [];
    if (columns.length > 0) {
      for (let index = 0; index < columnCount; index += 1) {
        header.push(h('th', { key: index, scope: 'col' }, columns[index] !== undefined ? columns[index] : ''));
      }
    }
    const body = rows.map(function (row, rowIndex) {
      const cells = [];
      for (let index = 0; index < columnCount; index += 1) {
        cells.push(h('td', { key: index }, row[index] !== undefined ? row[index] : ''));
      }
      return h('tr', { key: rowIndex }, ...cells);
    });
    return h(
      'div',
      { className: 'oui-table-wrap' },
      h(
        'div',
        { className: 'oui-table-scroll', tabIndex: 0, role: 'group', 'aria-label': caption === '' ? '表格，可横向滚动' : caption + '（表格，可横向滚动）' },
        h(
          'table',
          { className: 'oui-table' },
          caption === '' ? null : h('caption', { className: 'oui-table-caption' }, caption),
          columns.length === 0 ? null : h('thead', {}, h('tr', {}, ...header)),
          h('tbody', {}, ...body),
        ),
      ),
      rows.length === 0 ? h('div', { className: 'oui-table-note' }, '没有数据行') : null,
    );
  }

  function ChartView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const gradientId = 'oui-grad-' + sanitizeId(useUid());
    const rawKind = typeof data.kind === 'string' ? data.kind.trim().toLowerCase() : '';
    const kind = rawKind === '' ? 'bar' : rawKind;
    const title = asText(data.title, '');
    const unit = asText(data.unit, '');
    const points = [];
    asArray(data.data).forEach(function (entry, index) {
      if (!isObject(entry)) return;
      if (typeof entry.value !== 'number' || !Number.isFinite(entry.value)) return;
      if (points.length >= 60) return;
      const label = asText(entry.label, '');
      points.push({ label: label === '' ? '#' + (index + 1) : label, value: entry.value });
    });
    const titleNode = title === '' ? null : h('div', { className: 'oui-chart-title' }, title);
    if (['bar', 'line', 'area', 'pie'].indexOf(kind) === -1) {
      return h(
        'div',
        { className: 'oui-chart' },
        titleNode,
        h('div', { className: 'oui-fallback' }, '暂不支持的图表类型：' + asText(data.kind, '未知')),
      );
    }
    if (points.length === 0) {
      return h(
        'div',
        { className: 'oui-chart' },
        titleNode,
        h('div', { className: 'oui-fallback' }, '没有可绘制的数据（value 必须是数字）'),
      );
    }
    const kindLabels = { bar: '柱状图', line: '折线图', area: '面积图', pie: '饼图' };
    let maxPoint = points[0];
    let minPoint = points[0];
    points.forEach(function (point) {
      if (point.value > maxPoint.value) maxPoint = point;
      if (point.value < minPoint.value) minPoint = point;
    });
    let summary = (title === '' ? '' : title + '：') + kindLabels[kind] + '，共 ' + points.length + ' 项';
    if (kind === 'pie') {
      let total = 0;
      points.forEach(function (point) {
        if (point.value > 0) total += point.value;
      });
      summary += '，总计 ' + formatNumber(total) + unit;
    } else {
      summary += '，最高 ' + maxPoint.label + ' ' + formatNumber(maxPoint.value) + unit +
        '，最低 ' + minPoint.label + ' ' + formatNumber(minPoint.value) + unit;
    }
    const parts = kind === 'pie'
      ? renderPie(points, unit, summary)
      : renderCartesian(kind, points, unit, gradientId, summary);
    const body = parts === null
      ? h('div', { className: 'oui-fallback' }, '暂时没有可绘制的数据')
      : h(
          'div',
          { className: 'oui-chart-body' },
          parts.svg,
          parts.legend.length === 0 ? null : h('div', { className: 'oui-chart-legend', 'aria-hidden': 'true' }, ...parts.legend),
        );
    return h(
      'div',
      { className: 'oui-chart' },
      titleNode,
      body,
      h('div', { className: 'oui-sr' }, summary),
    );
  }

  function renderCartesian(kind, points, unit, gradientId, summary) {
    const width = 640;
    const height = 260;
    const padding = { left: 46, right: 16, top: 18, bottom: 34 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const values = points.map(function (point) { return point.value; });
    const minValue = Math.min(0, Math.min.apply(null, values));
    let maxValue = Math.max(0, Math.max.apply(null, values));
    if (maxValue === minValue) maxValue = minValue + 1;
    const range = maxValue - minValue;
    function yOf(value) {
      return padding.top + plotHeight * ((maxValue - value) / range);
    }
    const zeroY = yOf(0);
    const tickCount = 4;
    const children = [];
    for (let index = 0; index <= tickCount; index += 1) {
      const value = minValue + (range * index) / tickCount;
      const y = yOf(value);
      children.push(h('line', {
        key: 'grid' + index,
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: 'var(--dsw-alias-border-l1)',
        strokeWidth: 1,
      }));
      children.push(h('text', {
        key: 'tick' + index,
        x: padding.left - 8,
        y: y + 4,
        textAnchor: 'end',
        fontSize: 10,
        fill: 'var(--dsw-alias-label-secondary)',
      }, formatNumber(value) + unit));
    }
    const band = plotWidth / points.length;
    const labelStep = points.length > 8 ? Math.ceil(points.length / 8) : 1;
    function xOf(index) {
      if (kind === 'bar') return padding.left + band * index + band / 2;
      if (points.length === 1) return padding.left + plotWidth / 2;
      return padding.left + (plotWidth * index) / (points.length - 1);
    }
    points.forEach(function (point, index) {
      if (index % labelStep !== 0 && index !== points.length - 1) return;
      const label = point.label.length > 10 ? point.label.slice(0, 9) + '…' : point.label;
      children.push(h('text', {
        key: 'xlabel' + index,
        x: xOf(index),
        y: height - 10,
        textAnchor: 'middle',
        fontSize: 10,
        fill: 'var(--dsw-alias-label-secondary)',
      }, label));
    });
    if (kind === 'bar') {
      const barWidth = Math.max(4, Math.min(40, band * 0.6));
      points.forEach(function (point, index) {
        const center = xOf(index);
        const y = yOf(point.value);
        const top = Math.min(y, zeroY);
        const barHeight = Math.max(1, Math.abs(zeroY - y));
        children.push(h('rect', {
          key: 'bar' + index,
          x: center - barWidth / 2,
          y: top,
          width: barWidth,
          height: barHeight,
          rx: 3,
          fill: 'var(--dsw-alias-brand-primary)',
        }));
        if (points.length <= 10) {
          children.push(h('text', {
            key: 'value' + index,
            x: center,
            y: Math.max(padding.top + 9, top - 4),
            textAnchor: 'middle',
            fontSize: 10,
            fill: 'var(--dsw-alias-label-secondary)',
          }, formatNumber(point.value) + unit));
        }
      });
    } else {
      const coords = points.map(function (point, index) {
        return { x: xOf(index), y: yOf(point.value) };
      });
      const linePoints = coords.map(function (coord) {
        return coord.x.toFixed(1) + ',' + coord.y.toFixed(1);
      }).join(' ');
      if (kind === 'area') {
        const first = coords[0];
        const last = coords[coords.length - 1];
        const areaPoints = first.x.toFixed(1) + ',' + zeroY.toFixed(1) + ' ' + linePoints + ' ' + last.x.toFixed(1) + ',' + zeroY.toFixed(1);
        children.push(h('polygon', {
          key: 'area',
          points: areaPoints,
          fill: 'url(#' + gradientId + ')',
          stroke: 'none',
        }));
      }
      children.push(h('polyline', {
        key: 'line',
        points: linePoints,
        fill: 'none',
        stroke: 'var(--dsw-alias-brand-primary)',
        strokeWidth: 2,
        strokeLinejoin: 'round',
        strokeLinecap: 'round',
      }));
      if (points.length <= 20) {
        coords.forEach(function (coord, index) {
          children.push(h('circle', {
            key: 'dot' + index,
            cx: coord.x,
            cy: coord.y,
            r: 3,
            fill: 'var(--dsw-alias-brand-primary)',
            stroke: 'var(--dsw-alias-bg-base)',
            strokeWidth: 1.5,
          }));
        });
      }
    }
    const svg = h(
      'svg',
      {
        className: 'oui-chart-svg',
        viewBox: '0 0 ' + width + ' ' + height,
        role: 'img',
        'aria-label': summary,
      },
      h(
        'defs',
        {},
        h(
          'linearGradient',
          { id: gradientId, x1: '0', y1: '0', x2: '0', y2: '1' },
          h('stop', { offset: '0%', stopColor: 'var(--dsw-alias-brand-primary)', stopOpacity: 0.45 }),
          h('stop', { offset: '100%', stopColor: 'var(--dsw-alias-brand-primary)', stopOpacity: 0.02 }),
        ),
      ),
      ...children,
    );
    const legendTitle = kind === 'bar' ? '柱状图' : kind === 'line' ? '折线图' : '面积图';
    const legend = points.length <= 12
      ? points.map(function (point, index) {
          return h(
            'span',
            { key: 'legend' + index, className: 'oui-legend-item' },
            h('span', { className: 'oui-legend-swatch', style: { background: CHART_COLORS[0] } }),
            h('span', { className: 'oui-legend-text' }, point.label + ' ' + formatNumber(point.value) + unit),
          );
        })
      : [
          h(
            'span',
            { key: 'legend', className: 'oui-legend-item' },
            h('span', { className: 'oui-legend-swatch', style: { background: CHART_COLORS[0] } }),
            h('span', { className: 'oui-legend-text' }, legendTitle + '（' + points.length + ' 项' + (unit === '' ? '' : '，单位 ' + unit) + '）'),
          ),
        ];
    return { svg: svg, legend: legend };
  }

  function renderPie(points, unit, summary) {
    const positive = [];
    points.forEach(function (point) {
      if (Number.isFinite(point.value) && point.value > 0) positive.push(point);
    });
    if (positive.length === 0) return null;
    let total = 0;
    positive.forEach(function (point) { total += point.value; });
    const width = 640;
    const height = 260;
    const centerX = 190;
    const centerY = height / 2;
    const radius = Math.min(height / 2 - 18, 92);
    let angle = -Math.PI / 2;
    const slices = [];
    positive.forEach(function (point, index) {
      const sweep = (point.value / total) * Math.PI * 2;
      slices.push({
        point: point,
        color: CHART_COLORS[index % CHART_COLORS.length],
        start: angle,
        sweep: sweep,
      });
      angle += sweep;
    });
    const children = [];
    if (slices.length === 1) {
      children.push(h('circle', { key: 'pie-full', cx: centerX, cy: centerY, r: radius, fill: slices[0].color }));
    } else {
      slices.forEach(function (slice, index) {
        children.push(h('path', {
          key: 'slice' + index,
          d: arcPath(centerX, centerY, radius, slice.start, slice.start + slice.sweep),
          fill: slice.color,
        }));
      });
    }
    slices.forEach(function (slice, index) {
      const percent = (slice.point.value / total) * 100;
      if (percent < 8) return;
      const middle = slice.start + slice.sweep / 2;
      children.push(h('text', {
        key: 'percent' + index,
        x: centerX + Math.cos(middle) * radius * 0.62,
        y: centerY + Math.sin(middle) * radius * 0.62 + 4,
        textAnchor: 'middle',
        fontSize: 11,
        fontWeight: 600,
        fill: 'var(--dsw-alias-bg-base)',
      }, Math.round(percent) + '%'));
    });
    const svg = h(
      'svg',
      {
        className: 'oui-chart-svg',
        viewBox: '0 0 ' + width + ' ' + height,
        role: 'img',
        'aria-label': summary,
      },
      ...children,
    );
    const legend = slices.map(function (slice, index) {
      const percent = Math.round((slice.point.value / total) * 100);
      return h(
        'span',
        { key: 'legend' + index, className: 'oui-legend-item' },
        h('span', { className: 'oui-legend-swatch', style: { background: slice.color } }),
        h('span', { className: 'oui-legend-text' }, slice.point.label + ' ' + formatNumber(slice.point.value) + unit + '（' + percent + '%）'),
      );
    });
    return { svg: svg, legend: legend };
  }

  function arcPath(centerX, centerY, radius, start, end) {
    const startX = centerX + radius * Math.cos(start);
    const startY = centerY + radius * Math.sin(start);
    const endX = centerX + radius * Math.cos(end);
    const endY = centerY + radius * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return 'M ' + centerX.toFixed(2) + ' ' + centerY.toFixed(2) +
      ' L ' + startX.toFixed(2) + ' ' + startY.toFixed(2) +
      ' A ' + radius + ' ' + radius + ' 0 ' + large + ' 1 ' + endX.toFixed(2) + ' ' + endY.toFixed(2) + ' Z';
  }

  function TimelineView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const title = asText(data.title, '');
    const items = [];
    asArray(data.items).slice(0, 40).forEach(function (item) {
      if (!isObject(item)) {
        const text = asText(item, '');
        if (text !== '') items.push({ time: '', title: text, detail: '', tone: 'neutral' });
        return;
      }
      const time = asText(item.time, '');
      const itemTitle = asText(item.title, '');
      const detail = asText(item.detail, '');
      if (time === '' && itemTitle === '' && detail === '') return;
      items.push({ time: time, title: itemTitle, detail: detail, tone: asTone(item.tone, 'neutral') });
    });
    if (items.length === 0) return h('div', { className: 'oui-fallback' }, '时间线没有内容');
    return h(
      'div',
      { className: 'oui-timeline' },
      title === '' ? null : h('div', { className: 'oui-timeline-title' }, title),
      h(
        'ol',
        { className: 'oui-timeline-list' },
        ...items.map(function (item, index) {
          return h(
            'li',
            { key: index, className: 'oui-timeline-item' },
            h('span', { className: 'oui-timeline-dot oui-timeline-dot-' + item.tone, 'aria-hidden': 'true' }),
            item.time === '' ? null : h('span', { className: 'oui-timeline-time' }, item.time),
            h(
              'span',
              { className: 'oui-timeline-body' },
              item.title === '' ? null : h('span', { className: 'oui-timeline-item-title' }, item.title),
              item.detail === '' ? null : h('span', { className: 'oui-timeline-detail' }, item.detail),
            ),
          );
        }),
      ),
    );
  }

  function ListView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const title = asText(data.title, '');
    const ordered = data.ordered === true;
    const items = [];
    asArray(data.items).slice(0, 40).forEach(function (item) {
      const text = isObject(item) ? asText(item.text, '') || asText(item.label, '') : asText(item, '');
      if (text !== '') items.push(text);
    });
    if (items.length === 0) return h('div', { className: 'oui-fallback' }, '列表没有内容');
    const tag = ordered ? 'ol' : 'ul';
    return h(
      'div',
      { className: 'oui-list' },
      title === '' ? null : h('div', { className: 'oui-list-title' }, title),
      h(tag, { className: 'oui-list-items' }, ...items.map(function (text, index) {
        return h('li', { key: index }, text);
      })),
    );
  }

  /* ── 步骤 / 进度 ───────────────────────────────────────────────────── */

  const STEP_STATUS = ['done', 'active', 'todo', 'warning'];
  const STEP_LABEL = { done: '已完成', active: '进行中', todo: '待办', warning: '注意' };

  function StepsView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const title = asText(data.title, '');
    const items = [];
    asArray(data.items).slice(0, 20).forEach(function (item) {
      if (!isObject(item)) return;
      const text = asText(item.title, '');
      if (text === '') return;
      const rawStatus = asText(item.status, 'todo');
      const status = STEP_STATUS.indexOf(rawStatus) === -1 ? 'todo' : rawStatus;
      items.push({ title: text, detail: asText(item.detail, ''), status: status });
    });
    if (items.length === 0) return h('div', { className: 'oui-fallback' }, '步骤没有内容');
    return h(
      'div',
      { className: 'oui-steps' },
      title === '' ? null : h('div', { className: 'oui-steps-title' }, title),
      h('ol', { className: 'oui-step-list' }, ...items.map(function (item, index) {
        return h(
          'li',
          {
            key: index,
            className: 'oui-step oui-step-' + item.status,
            'aria-current': item.status === 'active' ? 'step' : undefined,
          },
          h('span', { className: 'oui-step-index', 'aria-hidden': 'true' }, item.status === 'done' ? '✓' : String(index + 1)),
          h(
            'div',
            { className: 'oui-step-body' },
            h('div', { className: 'oui-step-head' },
              h('span', { className: 'oui-step-title' }, item.title),
              h('span', { className: 'oui-step-status' }, STEP_LABEL[item.status]),
            ),
            item.detail === '' ? null : h('div', { className: 'oui-step-detail' }, item.detail),
          ),
        );
      })),
    );
  }

  function ProgressView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const title = asText(data.title, '');
    const rows = [];
    asArray(data.items).slice(0, 10).forEach(function (item) {
      if (!isObject(item)) return;
      const label = asText(item.label, '');
      const value = asNumber(item.value, NaN);
      const max = asNumber(item.max, 100);
      if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return;
      const percent = clamp((value / max) * 100, 0, 100);
      rows.push({ label: label, percent: percent, value: value, max: max, tone: asTone(item.tone, 'info') });
    });
    if (rows.length === 0) return h('div', { className: 'oui-fallback' }, '进度没有可显示的数据');
    return h(
      'div',
      { className: 'oui-progress' },
      title === '' ? null : h('div', { className: 'oui-progress-title' }, title),
      ...rows.map(function (row, index) {
        return h(
          'div',
          { key: index, className: 'oui-progress-item' },
          h('div', { className: 'oui-progress-head' },
            h('span', { className: 'oui-progress-label' }, row.label),
            h('span', { className: 'oui-progress-value' }, Math.round(row.percent) + '%'),
          ),
          h('div', {
            className: 'oui-progress-track',
            role: 'progressbar',
            'aria-label': row.label,
            'aria-valuemin': '0',
            'aria-valuemax': String(row.max),
            'aria-valuenow': String(row.value),
          }, h('span', { className: 'oui-progress-fill oui-progress-' + row.tone, style: { width: row.percent.toFixed(1) + '%' } })),
        );
      }),
    );
  }

  /* ── 媒体组件 ───────────────────────────────────────────────────────── */

  function MediaView(props) {
    const src = isHttpUrl(props.src) ? props.src : '';
    const caption = asText(props.caption, '');
    const alt = asText(props.alt, '') || caption;
    const compact = props.compact === true;
    const [status, setStatus] = useState(src === '' ? 'error' : 'loading');
    useEffect(function () {
      if (status !== 'loading' || src === '') return undefined;
      const timer = setTimeout(function () { setStatus('error'); }, 8000);
      return function () { clearTimeout(timer); };
    }, [status, src]);
    const failed = src === '' || status === 'error';
    const body = failed
      ? h(
          'div',
          { className: 'oui-media-placeholder', role: 'img', 'aria-label': alt === '' ? '图片不可用' : alt + '（图片不可用）' },
          h('div', { className: 'oui-media-placeholder-text' }, src === '' ? '图片地址无效' : '图片加载失败'),
          caption === '' ? null : h('div', { className: 'oui-media-placeholder-hint' }, caption),
        )
      : h(
          'div',
          { className: 'oui-media-frame' },
          h('img', {
            className: 'oui-media-img',
            src: src,
            alt: alt,
            loading: 'lazy',
            decoding: 'async',
            onLoad: function () { setStatus('ok'); },
            onError: function () { setStatus('error'); },
          }),
          status === 'loading' ? h('div', { className: 'oui-media-loading', 'aria-hidden': 'true' }, '图片加载中…') : null,
        );
    return h(
      'figure',
      { className: 'oui-media' + (compact ? ' oui-media-compact' : '') },
      body,
      caption !== '' && failed === false ? h('figcaption', { className: 'oui-media-caption' }, caption) : null,
    );
  }

  function ImageView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    return h(MediaView, {
      src: data.src,
      alt: data.alt,
      caption: data.caption,
    });
  }

  function GalleryView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const title = asText(data.title, '');
    const columns = Math.round(clamp(asNumber(data.columns, 2), 1, 4));
    const images = [];
    asArray(data.images).slice(0, 12).forEach(function (image) {
      if (!isObject(image)) return;
      if (!isHttpUrl(image.src)) return;
      images.push(image);
    });
    const titleNode = title === '' ? null : h('div', { className: 'oui-gallery-title' }, title);
    if (images.length === 0) {
      return h('div', { className: 'oui-gallery' }, titleNode, h('div', { className: 'oui-fallback' }, '图片墙没有可显示的图片'));
    }
    return h(
      'div',
      { className: 'oui-gallery' },
      titleNode,
      h(
        'div',
        { className: 'oui-gallery-grid oui-gallery-cols-' + columns },
        ...images.map(function (image, index) {
          return h(MediaView, {
            key: index,
            src: image.src,
            alt: image.alt,
            caption: image.caption,
            compact: true,
          });
        }),
      ),
    );
  }

  function MapView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const centerRaw = normalizeLatLng(data.center);
    const centerOk = centerRaw !== null;
    const center = centerOk ? centerRaw : [0, 0];
    const zoom = Math.round(clamp(asNumber(data.zoom, 12), 2, 17));
    const height = Math.round(clamp(asNumber(data.height, 260), 160, 560));
    const title = asText(data.title, '');
    const markers = [];
    asArray(data.markers).slice(0, 30).forEach(function (marker) {
      const normalized = normalizeMarker(marker);
      if (normalized !== null) markers.push(normalized);
    });
    const route = [];
    asArray(data.route).slice(0, 200).forEach(function (point) {
      const normalized = normalizeLatLng(point);
      if (normalized !== null) route.push(normalized);
    });
    const [tileState, setTileState] = useState({ failed: {}, count: 0, fallback: false });
    const base = useMemo(function () {
      return buildTileGrid(center, zoom);
    }, [center[0], center[1], zoom]);
    const tileCount = base.tiles.length;
    const markFailed = useCallback(function (index) {
      setTileState(function (previous) {
        if (previous.failed[index]) return previous;
        const failed = Object.assign({}, previous.failed);
        failed[index] = true;
        const count = previous.count + 1;
        return {
          failed: failed,
          count: count,
          fallback: count >= 3 || count >= Math.ceil(tileCount / 2),
        };
      });
    }, [tileCount]);
    const fallback = centerOk === false || tileState.fallback === true;
    const markerPoints = markers.map(function (marker, index) {
      return {
        key: index,
        marker: marker,
        point: base.project(marker.lat, marker.lng),
      };
    });
    const routePoints = route.map(function (point) {
      return base.project(point[0], point[1]);
    });
    let summary = '地图';
    if (title !== '') summary += '：' + title;
    summary += '，' + markers.length + ' 个标记';
    if (route.length > 1) summary += '，路线 ' + route.length + ' 个点';
    if (fallback) summary += '（示意底图）';
    const tileLayer = fallback
      ? h('div', { className: 'oui-map-grid', 'aria-hidden': 'true' })
      : h(
          'div',
          { className: 'oui-map-tiles', 'aria-hidden': 'true' },
          ...base.tiles.map(function (tile, index) {
            if (tileState.failed[index]) {
              return h('div', { key: tile.key, className: 'oui-map-tile oui-map-tile-missing' });
            }
            return h('img', {
              key: tile.key,
              className: 'oui-map-tile',
              src: tile.src,
              alt: '',
              draggable: false,
              loading: 'eager',
              onError: function (event) {
                if (event && event.target && event.target.style) event.target.style.visibility = 'hidden';
                markFailed(index);
              },
            });
          }),
        );
    const routeLayer = routePoints.length > 1
      ? h(
          'svg',
          {
            className: 'oui-map-route',
            viewBox: '0 0 100 100',
            preserveAspectRatio: 'none',
            'aria-hidden': 'true',
            focusable: 'false',
          },
          h('polyline', {
            points: routePoints.map(function (point) {
              return point.x.toFixed(2) + ',' + point.y.toFixed(2);
            }).join(' '),
            fill: 'none',
            stroke: 'var(--dsw-alias-brand-primary)',
            strokeWidth: 2,
            vectorEffect: 'non-scaling-stroke',
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          }),
        )
      : null;
    const markerLayer = markerPoints.length > 0
      ? h(
          'svg',
          { className: 'oui-map-markers', 'aria-hidden': 'true', focusable: 'false' },
          ...markerPoints.map(function (item) {
            return h('circle', {
              key: item.key,
              cx: item.point.x + '%',
              cy: item.point.y + '%',
              r: 6,
              fill: toneColor(item.marker.tone),
              stroke: 'var(--dsw-alias-bg-base)',
              strokeWidth: 2,
            });
          }),
        )
      : null;
    const hasLabels = markerPoints.some(function (item) { return item.marker.label !== ''; });
    const labelLayer = hasLabels
      ? h(
          'div',
          { className: 'oui-map-labels', 'aria-hidden': 'true' },
          ...markerPoints.map(function (item) {
            if (item.marker.label === '') return null;
            return h('span', {
              key: item.key,
              className: 'oui-map-label',
              style: { left: item.point.x + '%', top: item.point.y + '%' },
            }, item.marker.label);
          }),
        )
      : null;
    return h(
      'div',
      { className: 'oui-map' },
      title === '' ? null : h('div', { className: 'oui-map-title' }, title),
      h(
        'div',
        { className: 'oui-map-canvas', style: { height: height + 'px' }, role: 'group', 'aria-label': summary },
        tileLayer,
        routeLayer,
        markerLayer,
        labelLayer,
        fallback ? h('span', { className: 'oui-map-badge' }, '示意底图') : null,
        fallback ? null : h('a', {
          className: 'oui-map-attr',
          href: 'https://www.openstreetmap.org/copyright',
          target: '_blank',
          rel: 'noopener noreferrer',
        }, '© OpenStreetMap'),
      ),
      centerOk ? null : h('div', { className: 'oui-map-note' }, '中心坐标缺失，已显示示意地图。'),
    );
  }

  function normalizeLatLng(value) {
    if (!Array.isArray(value) || value.length < 2) return null;
    const lat = asNumber(value[0], NaN);
    const lng = asNumber(value[1], NaN);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [clamp(lat, -85, 85), clamp(lng, -180, 180)];
  }

  function normalizeMarker(value) {
    if (Array.isArray(value)) {
      const pair = normalizeLatLng(value);
      if (pair === null) return null;
      return { lat: pair[0], lng: pair[1], label: '', tone: 'neutral' };
    }
    if (!isObject(value)) return null;
    const lat = asNumber(value.lat, NaN);
    const lng = asNumber(value.lng, NaN);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      lat: clamp(lat, -85, 85),
      lng: clamp(lng, -180, 180),
      label: asText(value.label, ''),
      tone: asTone(value.tone, 'neutral'),
    };
  }

  function mercatorY(lat) {
    const phi = clamp(lat, -85, 85) * Math.PI / 180;
    return (1 - Math.log(Math.tan(Math.PI / 4 + phi / 2)) / Math.PI) / 2;
  }

  function mercatorLat(y) {
    return (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;
  }

  function buildTileGrid(center, zoom) {
    const lat = clamp(center[0], -85, 85);
    const lng = clamp(center[1], -180, 180);
    const z = Math.round(clamp(zoom, 2, 17));
    const n = Math.pow(2, z);
    const tileX = clamp(Math.floor(((lng + 180) / 360) * n) - 1, 0, n - 3);
    const tileY = clamp(Math.floor(mercatorY(lat) * n) - 1, 0, n - 3);
    const west = (tileX / n) * 360 - 180;
    const east = ((tileX + 3) / n) * 360 - 180;
    const north = mercatorLat(tileY / n);
    const south = mercatorLat((tileY + 3) / n);
    const tiles = [];
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        const x = tileX + column;
        const y = tileY + row;
        tiles.push({
          key: z + '/' + x + '/' + y,
          src: 'https://tile.openstreetmap.org/' + z + '/' + x + '/' + y + '.png',
        });
      }
    }
    function project(markerLat, markerLng) {
      const x = ((markerLng - west) / (east - west)) * 100;
      const y = ((north - markerLat) / (north - south)) * 100;
      return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
    }
    return { tiles: tiles, project: project };
  }

  /* ── 交互组件：本地 state + streaming 时禁用动作 ────────────────────── */

  function TabsView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const ctx = isObject(props.ctx) ? props.ctx : {};
    const [active, setActive] = useState(0);
    const uid = sanitizeId(useUid());
    const tabs = [];
    asArray(data.tabs).slice(0, 6).forEach(function (tab, index) {
      if (isObject(tab)) {
        const label = asText(tab.label, '');
        tabs.push({
          label: label === '' ? '页签 ' + (index + 1) : label,
          children: tab.children,
        });
      } else {
        const text = asText(tab, '');
        if (text !== '') tabs.push({ label: text, children: null });
      }
    });
    const title = asText(data.title, '');
    if (tabs.length === 0) {
      return h('div', { className: 'oui-fallback' }, '页签没有可显示的内容');
    }
    const index = active >= 0 && active < tabs.length ? active : 0;
    const current = tabs[index];
    function onKeyDown(event) {
      if (!event || typeof event.key !== 'string') return;
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      if (typeof event.preventDefault === 'function') event.preventDefault();
      setActive(next);
    }
    return h(
      'div',
      { className: 'oui-tabs' },
      title === '' ? null : h('div', { className: 'oui-tabs-title' }, title),
      h(
        'div',
        { className: 'oui-tablist', role: 'tablist', 'aria-label': title === '' ? '页签' : title },
        ...tabs.map(function (tab, tabIndex) {
          const selected = tabIndex === index;
          return h('button', {
            key: tabIndex,
            type: 'button',
            role: 'tab',
            id: 'oui-tab-' + uid + '-' + tabIndex,
            'aria-selected': selected ? 'true' : 'false',
            'aria-controls': 'oui-tabpanel-' + uid + '-' + tabIndex,
            tabIndex: selected ? 0 : -1,
            className: 'oui-tab' + (selected ? ' oui-tab-active' : ''),
            onClick: function () { setActive(tabIndex); },
            onKeyDown: onKeyDown,
          }, tab.label);
        }),
      ),
      h(
        'div',
        {
          className: 'oui-tabpanel',
          role: 'tabpanel',
          id: 'oui-tabpanel-' + uid + '-' + index,
          'aria-labelledby': 'oui-tab-' + uid + '-' + index,
          tabIndex: 0,
        },
        ...renderChildList(current.children, ctx, props.depth),
      ),
    );
  }

  function AccordionView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const title = asText(data.title, '');
    const items = [];
    asArray(data.items).slice(0, 8).forEach(function (item) {
      if (!isObject(item)) return;
      const text = asText(item.title, '');
      if (text === '') return;
      items.push({ title: text, children: item.children });
    });
    if (items.length === 0) return h('div', { className: 'oui-fallback' }, '折叠面板没有内容');
    const [open, setOpen] = useState(0);
    return h(
      'div',
      { className: 'oui-accordion' },
      title === '' ? null : h('div', { className: 'oui-accordion-title' }, title),
      ...items.map(function (item, index) {
        const expanded = open === index;
        const panelId = 'oui-accordion-panel-' + index;
        return h(
          'div',
          { key: index, className: 'oui-accordion-item' + (expanded ? ' oui-accordion-open' : '') },
          h('button', {
            type: 'button',
            className: 'oui-accordion-trigger',
            'aria-expanded': expanded ? 'true' : 'false',
            'aria-controls': panelId,
            onClick: function () { setOpen(expanded ? -1 : index); },
          },
            h('span', { className: 'oui-accordion-label' }, item.title),
            h('span', { className: 'oui-accordion-caret', 'aria-hidden': 'true' }, expanded ? '−' : '+'),
          ),
          expanded ? h('div', { className: 'oui-accordion-panel', id: panelId, role: 'region' }, ...renderChildList(item.children, props.ctx, props.depth)) : null,
        );
      }),
    );
  }

  function readEventValue(event) {
    if (event && event.target) {
      if (typeof event.target.value === 'string') return event.target.value;
      if (typeof event.target.value === 'number' && Number.isFinite(event.target.value)) return String(event.target.value);
    }
    return '';
  }

  function readEventChecked(event, previous) {
    if (event && event.target && typeof event.target.checked === 'boolean') return event.target.checked;
    return previous !== true;
  }

  function normalizeOptions(raw) {
    const options = [];
    asArray(raw).slice(0, 20).forEach(function (option) {
      if (isObject(option)) {
        const label = asText(option.label, '');
        const value = asText(option.value, '') || label;
        if (value !== '') options.push({ value: value, label: label === '' ? value : label });
        return;
      }
      const text = asText(option, '');
      if (text !== '') options.push({ value: text, label: text });
    });
    return options;
  }

  function normalizeFields(raw) {
    const used = {};
    const fields = [];
    asArray(raw).slice(0, 12).forEach(function (field, index) {
      let name = '';
      let label = '';
      let type = 'text';
      let placeholder = '';
      let options = [];
      let min = 0;
      let max = 100;
      let step = 1;
      let initial = '';
      if (isObject(field)) {
        name = asText(field.name, '');
        label = asText(field.label, '');
        type = asText(field.type, 'text');
        placeholder = asText(field.placeholder, '');
        options = normalizeOptions(field.options);
        const minRaw = asNumber(field.min, 0);
        const maxRaw = asNumber(field.max, 100);
        min = minRaw;
        max = maxRaw > minRaw ? maxRaw : minRaw + 1;
        const stepRaw = asNumber(field.step, 1);
        step = stepRaw > 0 ? stepRaw : 1;
        if (['text', 'textarea', 'number', 'date', 'select', 'radio', 'checkbox', 'switch', 'slider'].indexOf(type) === -1) type = 'text';
        if (type === 'checkbox' || type === 'switch') {
          initial = asBoolean(field.value, false);
        } else if (type === 'slider') {
          initial = clamp(asNumber(field.value, min), min, max);
        } else if (type === 'select' || type === 'radio') {
          const wanted = asText(field.value, '');
          let matched = options.length > 0 ? options[0].value : '';
          options.forEach(function (option) {
            if (option.value === wanted) matched = option.value;
          });
          initial = matched;
        } else {
          initial = asText(field.value, '');
        }
      } else {
        label = asText(field, '');
      }
      if (name === '') name = 'field_' + (index + 1);
      if (used[name] === true) name = name + '_' + (index + 1);
      used[name] = true;
      if (label === '') label = name;
      fields.push({
        name: name,
        label: label,
        type: type,
        placeholder: placeholder,
        options: options,
        min: min,
        max: max,
        step: step,
        initial: initial,
      });
    });
    return fields;
  }

  function normalizeSubmit(raw) {
    if (!isObject(raw)) return { label: '提交', message: '', prompt: '' };
    return {
      label: asText(raw.label, '') || '提交',
      message: asText(raw.message, ''),
      prompt: asText(raw.prompt, ''),
    };
  }

  function initialFormValues(fields) {
    const values = {};
    fields.forEach(function (field) {
      values[field.name] = field.initial;
    });
    return values;
  }

  function composeFormMessage(fields, values, submit) {
    const lines = [];
    if (submit.prompt !== '') lines.push(submit.prompt);
    fields.forEach(function (field) {
      const raw = Object.prototype.hasOwnProperty.call(values, field.name) ? values[field.name] : field.initial;
      let display = '';
      if (field.type === 'checkbox' || field.type === 'switch') {
        display = raw === true ? '是' : '否';
      } else if (field.type === 'date' || field.type === 'number') {
        control = h('input', {
          id: id,
          name: field.name,
          type: field.type,
          className: 'oui-field-input',
          value: asText(value, ''),
          placeholder: field.placeholder,
          onChange: function (event) { setFieldValue(field.name, readEventValue(event)); },
        });
      } else if (field.type === 'slider') {
        display = formatNumber(Number(raw));
      } else if (field.type === 'select') {
        let matched = null;
        field.options.forEach(function (option) {
          if (option.value === raw) matched = option;
        });
        display = matched === null ? asText(raw, '') : matched.label;
      } else {
        const text = String(raw === null || raw === undefined ? '' : raw).trim();
        display = text === '' ? '（空）' : text;
      }
      lines.push(field.label + ': ' + display);
    });
    if (submit.message !== '') lines.push(submit.message);
    return lines.join('\n').trim();
  }

  function FormView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const ctx = isObject(props.ctx) ? props.ctx : {};
    const uid = sanitizeId(useUid());
    const fields = normalizeFields(data.fields);
    const submit = normalizeSubmit(data.submit);
    const [values, setValues] = useState(function () { return initialFormValues(fields); });
    const [notice, setNotice] = useState('');
    const title = asText(data.title, '');
    const streaming = ctx.streaming === true;

    function currentValue(field) {
      if (Object.prototype.hasOwnProperty.call(values, field.name)) return values[field.name];
      return field.initial;
    }

    function setFieldValue(name, value) {
      setValues(function (previous) {
        const next = {};
        Object.keys(previous).forEach(function (key) { next[key] = previous[key]; });
        next[name] = value;
        return next;
      });
    }

    function submitForm() {
      if (streaming) return;
      const text = composeFormMessage(fields, values, submit);
      if (text === '') {
        setNotice('请先填写内容再提交');
        return;
      }
      setNotice('');
      if (typeof ctx.send === 'function') ctx.send(text);
    }

    const fieldNodes = fields.map(function (field, index) {
      const id = 'oui-form-' + uid + '-field-' + index;
      const value = currentValue(field);
      let control = null;
      if (field.type === 'select') {
        control = h(
          'select',
          {
            id: id,
            name: field.name,
            className: 'oui-field-select',
            value: asText(value, ''),
            onChange: function (event) { setFieldValue(field.name, readEventValue(event)); },
          },
          field.options.length === 0 ? h('option', { value: '' }, '（无可选项）') : null,
          ...field.options.map(function (option) {
            return h('option', { key: option.value, value: option.value }, option.label);
          }),
        );
      } else if (field.type === 'textarea') {
        control = h('textarea', {
          id: id,
          name: field.name,
          className: 'oui-field-textarea',
          rows: 3,
          value: asText(value, ''),
          placeholder: field.placeholder,
          onChange: function (event) { setFieldValue(field.name, readEventValue(event)); },
        });
      } else if (field.type === 'radio') {
        control = h(
          'div',
          { className: 'oui-field-radio', role: 'radiogroup', 'aria-label': field.label },
          ...field.options.map(function (option) {
            return h('label', { key: option.value, className: 'oui-radio-option' },
              h('input', {
                type: 'radio',
                name: field.name,
                value: option.value,
                checked: asText(value, '') === option.value,
                onChange: function () { setFieldValue(field.name, option.value); },
              }),
              h('span', {}, option.label),
            );
          }),
        );
      } else if (field.type === 'checkbox' || field.type === 'switch') {
        control = h('input', {
          id: id,
          name: field.name,
          type: 'checkbox',
          role: field.type === 'switch' ? 'switch' : undefined,
          className: field.type === 'switch' ? 'oui-field-switch' : 'oui-field-checkbox',
          checked: value === true,
          onChange: function (event) { setFieldValue(field.name, readEventChecked(event, value === true)); },
        });
      } else if (field.type === 'slider') {
        control = h(
          'span',
          { className: 'oui-field-slider-wrap' },
          h('input', {
            id: id,
            name: field.name,
            type: 'range',
            className: 'oui-field-slider',
            min: String(field.min),
            max: String(field.max),
            step: String(field.step),
            value: String(value),
            onChange: function (event) {
              const parsed = Number(readEventValue(event));
              setFieldValue(field.name, Number.isFinite(parsed) ? clamp(parsed, field.min, field.max) : field.min);
            },
          }),
          h('span', { className: 'oui-field-value' }, formatNumber(Number(value))),
        );
      } else {
        control = h('input', {
          id: id,
          name: field.name,
          type: 'text',
          className: 'oui-field-input',
          value: asText(value, ''),
          placeholder: field.placeholder,
          onChange: function (event) { setFieldValue(field.name, readEventValue(event)); },
        });
      }
      if (field.type === 'checkbox' || field.type === 'switch') {
        return h(
          'div',
          { key: field.name, className: 'oui-field oui-field-checkbox-field' },
          h('label', { className: 'oui-field-checkbox-label', htmlFor: id }, control, h('span', {}, field.label)),
        );
      }
      return h(
        'div',
        { key: field.name, className: 'oui-field oui-field-' + field.type },
        h('label', { className: 'oui-field-label', htmlFor: id }, field.label),
        control,
      );
    });

    if (fields.length === 0) {
      return h(
        'div',
        { className: 'oui-form' },
        title === '' ? null : h('div', { className: 'oui-form-title' }, title),
        h('div', { className: 'oui-fallback' }, '表单没有可用字段'),
      );
    }
    return h(
      'div',
      { className: 'oui-form' },
      title === '' ? null : h('div', { className: 'oui-form-title' }, title),
      h(
        'form',
        {
          className: 'oui-form-body',
          onSubmit: function (event) {
            if (event && typeof event.preventDefault === 'function') event.preventDefault();
            submitForm();
          },
        },
        h('div', { className: 'oui-form-grid' }, ...fieldNodes),
        h(
          'div',
          { className: 'oui-form-actions' },
          h('button', {
            type: 'submit',
            className: 'oui-button oui-button-primary',
            disabled: streaming,
            'aria-disabled': streaming ? 'true' : undefined,
          }, submit.label),
          notice === '' ? null : h('span', { className: 'oui-form-notice', role: 'status' }, notice),
        ),
      ),
    );
  }

  function normalizeAction(raw) {
    if (!isObject(raw)) return null;
    const action = {};
    if (typeof raw.send === 'string' && raw.send.trim() !== '') action.send = raw.send;
    if (isHttpUrl(raw.open)) action.open = raw.open;
    if (action.send === undefined && action.open === undefined) return null;
    return action;
  }

  function ButtonsView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const ctx = isObject(props.ctx) ? props.ctx : {};
    const streaming = ctx.streaming === true;
    const [chosen, setChosen] = useState(-1);
    const title = asText(data.title, '');
    const items = [];
    asArray(data.items).slice(0, 6).forEach(function (item) {
      if (typeof item === 'string') {
        const text = item.trim();
        if (text !== '') items.push({ label: text, tone: 'neutral', action: { send: text } });
        return;
      }
      if (!isObject(item)) return;
      const label = asText(item.label, '');
      const action = normalizeAction(item.action);
      if (label === '' && action === null) return;
      items.push({
        label: label === '' ? '执行' : label,
        tone: asTone(item.tone, 'neutral'),
        action: action,
      });
    });
    if (items.length === 0) return h('div', { className: 'oui-fallback' }, '按钮组没有可用按钮');
    return h(
      'div',
      { className: 'oui-buttons' },
      title === '' ? null : h('div', { className: 'oui-buttons-title' }, title),
      h(
        'div',
        { className: 'oui-buttons-row' },
        ...items.map(function (item, index) {
          const blocked = streaming || item.action === null;
          return h('button', {
            key: index,
            type: 'button',
            className: 'oui-button oui-button-' + item.tone + (chosen === index ? ' oui-button-chosen' : ''),
            disabled: blocked,
            'aria-disabled': blocked ? 'true' : undefined,
            title: blocked && streaming ? '正在生成，暂时不可操作' : (item.action === null ? '未配置动作' : undefined),
            onClick: function () {
              if (streaming || item.action === null) return;
              setChosen(index);
              if (typeof item.action.send === 'string' && typeof ctx.send === 'function') {
                ctx.send(item.action.send);
              } else if (typeof item.action.open === 'string' && typeof ctx.open === 'function') {
                ctx.open(item.action.open);
              }
            },
          }, item.label);
        }),
      ),
    );
  }

  function ChipsView(props) {
    const data = isObject(props.arg) ? props.arg : {};
    const ctx = isObject(props.ctx) ? props.ctx : {};
    const streaming = ctx.streaming === true;
    const [chosen, setChosen] = useState(-1);
    const title = asText(data.title, '');
    const items = [];
    asArray(data.items).slice(0, 8).forEach(function (item) {
      let label = '';
      let prompt = '';
      if (typeof item === 'string') {
        label = item.trim();
        prompt = label;
      } else if (isObject(item)) {
        label = asText(item.label, '');
        prompt = asText(item.prompt, '');
        if (prompt === '') prompt = label;
      }
      if (label === '' && prompt === '') return;
      items.push({ label: label === '' ? prompt : label, prompt: prompt === '' ? label : prompt });
    });
    if (items.length === 0) return h('div', { className: 'oui-fallback' }, '没有快捷建议');
    return h(
      'div',
      { className: 'oui-chips' },
      title === '' ? null : h('div', { className: 'oui-chips-title' }, title),
      h(
        'div',
        { className: 'oui-chips-row' },
        ...items.map(function (item, index) {
          return h('button', {
            key: index,
            type: 'button',
            className: 'oui-chip' + (chosen === index ? ' oui-chip-chosen' : ''),
            disabled: streaming,
            'aria-disabled': streaming ? 'true' : undefined,
            title: streaming ? '正在生成，暂时不可操作' : undefined,
            onClick: function () {
              if (streaming) return;
              setChosen(index);
              if (typeof ctx.send === 'function') ctx.send(item.prompt);
            },
          }, item.label);
        }),
      ),
    );
  }

  return { Node: Node };
}

// ── src/client-entry.mjs ──────────────────────────────────────────
/** Client 半：把 render_ui 的工具调用卡片换成一个可交互界面。
 *
 *  关键机制（2026-10-18 用宿主 Inspect 核验）：
 *  - `tool.call.toolview` 是按 wire tool 名分发的 keyed slot，key 域开放；
 *  - 工具卡片的三个阶段（preparing / start / result）都带 name 与惰性 args 读取器，
 *    preparing 阶段 args 会随模型输出增长 → 逐步渲染（不是等 JSON 闭合）。
 *  - 交互（按钮/表单/建议）只做两件事：把文本交给会话输入框发送，或打开链接。
 */

function clientMain(React) {
  const h = React.createElement;
  const ui = createUi(React);

  /** 从工具卡片的三个阶段里取出界面源码。 */
  function readUiSource(block, phase) {
    if (!block) return '';
    if (phase === 'result') {
      const raw = block.call && typeof block.call.argsRaw === 'string' ? block.call.argsRaw : '';
      if (raw !== '') {
        try {
          const args = JSON.parse(raw);
          if (args && typeof args.ui === 'string') return args.ui;
        } catch (error) {
          /* 结果参数不可解析时按没有界面处理，由错误态兜底 */
        }
      }
      return '';
    }
    try {
      if (block.args && typeof block.args.text === 'function') {
        const value = block.args.text('ui');
        if (typeof value === 'string') return value;
      }
    } catch (error) {
      /* 读取器在极早期可能还不接受该字段，回落 argsRaw */
    }
    return typeof block.argsRaw === 'string' ? block.argsRaw : '';
  }

  function useActions(props) {
    const send = React.useCallback((text) => {
      const actions = props && props.inputActions;
      if (!actions || typeof actions.setDraft !== 'function') {
        console.error('[intelligent-ui] 当前会话没有可用的输入动作，消息未发送');
        return;
      }
      try {
        actions.setDraft(String(text));
        setTimeout(() => {
          try {
            if (typeof actions.submit === 'function') actions.submit();
          } catch (error) {
            console.error('[intelligent-ui] 发送失败', error);
          }
        }, 0);
      } catch (error) {
        console.error('[intelligent-ui] 写入草稿失败', error);
      }
    }, [props && props.inputActions]);
    const open = React.useCallback((url) => {
      if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return;
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('[intelligent-ui] 打开链接失败', error);
      }
    }, []);
    return React.useMemo(() => ({ send, open }), [send, open]);
  }

  function Skeleton() {
    const rows = [72, 46, 58, 34];
    return h(
      'div',
      { className: 'oui-skeleton', 'aria-hidden': true },
      ...rows.map((width, index) =>
        h('div', { key: index, className: 'oui-skeleton-row', style: { width: `${width}%` } }),
      ),
    );
  }

  function RenderUiRow(props) {
    const block = (props && props.block) || {};
    const phase = (props && props.phase) || (block.kind ? 'result' : 'preparing');
    const streaming = phase !== 'result';
    const source = readUiSource(block, phase);
    const program = React.useMemo(() => compileUi(source, { final: !streaming }), [source, streaming]);
    const actions = useActions(props);
    const ctx = React.useMemo(() => ({ streaming, send: actions.send, open: actions.open }), [streaming, actions]);

    const overflow = program.stats && program.stats.tooMany;
    let body;
    if (program.root && !overflow) {
      body = h(ui.Node, { node: program.root, ctx, depth: 0 });
    } else if (streaming && !overflow) {
      body = h(Skeleton);
    } else {
      const reason = program.errors.length > 0 ? program.errors[0].message : (overflow ? '界面组件超过上限' : '界面源码为空');
      body = h(
        'div',
        { className: 'oui-empty' },
        h('div', { className: 'oui-empty-title' }, '界面没有生成成功'),
        h('div', { className: 'oui-empty-hint' }, reason),
        h('div', { className: 'oui-empty-hint' }, '可以让 Agent 重新生成一次，或要求用文字回答。'),
      );
    }

    return h(
      'div',
      {
        className: 'oui-root',
        'data-oui-phase': phase,
        'data-oui-nodes': String(program.stats.nodes || 0),
        'data-oui-errors': String(program.errors.length || 0),
        'aria-busy': streaming ? 'true' : 'false',
      },
      body,
      streaming
        ? h(
            'div',
            { className: 'oui-stream-note', role: 'status' },
            h('span', { className: 'oui-stream-dot', 'aria-hidden': true }),
            '正在生成界面…',
          )
        : null,
    );
  }


  /** 回合尾部的持久卡片：turnTail 在回合结束后仍保留，回答即界面。
   *  数据来源：uiConversation.events 里注册的 turn definition，把 render_ui 的 ui 源
   *  存在本回合的 data('intelligentUi') 上；turnTail 通过 props.turn 读取。
   */
  function createTurnDefinition() {
    return {
      kind: 'intelligentUi',
      match(event) {
        if (event.type === 'turn/start') return { id: String(event.data.turn), role: 'start' };
        if (event.type === 'tool/call' || event.type === 'tool/result') {
          return { id: String(event.data.turn), role: 'update' };
        }
        return null;
      },
      start(_context, match) {
        if (match.event.type !== 'turn/start') throw new Error('intelligentUi start match must be turn/start');
        return { turn: match.event.data.turn, ui: null };
      },
      update(context, match) {
        const state = context.state;
        if (match.event.type === 'tool/call') {
          const data = match.event.data || {};
          let args = data.arguments;
          if (typeof args === 'string') {
            try { args = JSON.parse(args); } catch (error) { args = null; }
          }
          const toolName = typeof data.name === 'string' ? data.name : '';
          if ((toolName === 'render_ui' || toolName.endsWith('render_ui')) && args && typeof args.ui === 'string' && args.ui.trim() !== '') {
            return { turn: state.turn, ui: args.ui };
          }
          return state;
        }
        return state;
      },
      buildLocationData(context, scope) {
        const state = context.state;
        if (scope !== 'turn' || !state || typeof state.ui !== 'string') return null;
        return { kind: 'turn', turn: state.turn, key: 'intelligentUi', value: { ui: state.ui } };
      },
    };
  }

  function selectIntelligentTurn(owner) {
    const data = owner && owner.turn && owner.turn.data && typeof owner.turn.data.get === 'function'
      ? owner.turn.data.get('intelligentUi')
      : undefined;
    if (!data || typeof data.ui !== 'string' || data.ui.trim() === '') return null;
    return { ui: data.ui, turn: owner.turn.turn };
  }

  function TurnTailCard(props) {
    const matched = props && props.matched && typeof props.matched.ui === 'string'
      ? props.matched
      : selectIntelligentTurn(props);
    const source = matched ? matched.ui : '';
    const program = React.useMemo(() => (matched ? compileUi(source, { final: true }) : null), [matched, source]);
    const actions = useActions(props);
    const ctx = React.useMemo(() => ({
      streaming: false,
      send: actions.send,
      open: actions.open,
    }), [actions]);
    if (!matched) return null;
    const nodes = program && program.stats ? program.stats.nodes || 0 : 0;
    const errors = program && program.errors ? program.errors.length || 0 : 0;
    const overflow = program && program.stats && program.stats.tooMany;
    const body = program && program.root && !overflow
      ? h(ui.Node, { node: program.root, ctx, depth: 0 })
      : h(
          'div',
          { className: 'oui-empty' },
          h('div', { className: 'oui-empty-title' }, '界面没有生成成功'),
          h('div', { className: 'oui-empty-hint' }, program && program.errors.length > 0 ? program.errors[0].message : '界面源码为空'),
          h('div', { className: 'oui-empty-hint' }, '可以让 Agent 重新生成一次，或要求用文字回答。'),
        );
    return h(
      'div',
      {
        className: 'oui-turn-card',
        'data-oui-phase': 'result',
        'data-oui-nodes': String(nodes),
        'data-oui-errors': String(errors),
        'aria-busy': 'false',
      },
      h('div', { className: 'oui-root' }, body),
    );
  }

  return {
    name: 'dsh-intelligent-ui',
    inject: ['slots', 'uiConversation'],
    apply(ctx) {
      // 1) 流式阶段：工具卡片随参数增长逐步渲染（过程组里可见）
      ctx.slots.inject('tool.call.toolview', () =>
        ctx.slots.register({ name: 'tool.call.toolview', key: 'render_ui' }, RenderUiRow),
      );
      // 2) 回合结尾：把界面留在对话里（回答即界面，不折叠）
      try {
        const uiConversation = ctx.get('uiConversation');
        if (uiConversation && uiConversation.events && typeof uiConversation.events.register === 'function') {
          try {
            uiConversation.events.register(createTurnDefinition());
          } catch (error) {
            if (!(error instanceof Error) || !error.message.includes('already registered')) throw error;
          }
        }
      } catch (error) {
        console.error('[intelligent-ui] 回合尾部卡片注册失败', error);
      }
      ctx.slots.inject('conversation.chat.turnTail', () => {
        const options = { name: 'conversation.chat.turnTail', id: 'intelligent-ui-turn-tail', select: selectIntelligentTurn };
        try {
          return ctx.slots.register(options, TurnTailCard);
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes('requires options.select')) throw error;
          return ctx.slots.register({ ...options, priority: -10 }, TurnTailCard);
        }
      });
    },
  };
}

    // 样式表由宿主 client-modules 在工厂物化时认领（claimStyles → style[data-plugin]），
    // 插件卸载/HMR 时一并移除；不要 require('styles')：模块表里没有这个 specifier。
    const styleEl = document.createElement('style');
    styleEl.textContent = RENDERER_CSS;
    document.head.appendChild(styleEl);

    return clientMain(React);
  },
});
