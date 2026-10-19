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
import { COMPONENTS } from './catalog.mjs';

export const LIMITS = {
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
export function compileUi(rawSource, options = {}) {
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
