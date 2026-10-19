import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createUi } from '../src/renderer.mjs';
import { RENDERER_CSS } from '../src/renderer-css.mjs';
import { COMPONENT_NAMES } from '../src/catalog.mjs';
import { compileUi } from '../src/kit.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const rendererSource = readFileSync(join(root, 'src/renderer.mjs'), 'utf8');

const ALLOWED_TOKENS = new Set([
  '--dsw-alias-bg-base',
  '--dsw-alias-bg-layer-1',
  '--dsw-alias-bg-layer-2',
  '--dsw-alias-bg-overlay',
  '--dsw-alias-border-l1',
  '--dsw-alias-border-l2',
  '--dsw-alias-brand-primary',
  '--dsw-alias-label-primary',
  '--dsw-alias-label-secondary',
  '--dsw-alias-state-error-primary',
  '--dsw-alias-state-idle-primary',
  '--dsw-alias-state-success-primary',
  '--dsw-alias-state-warn-primary',
  '--dsw-alias-specific-sidebar-fill',
]);

/* 局部变量只允许在 .oui-root 作用域里由宿主 token 派生；不能是新的字面色。 */
function localTokenNames(css) {
  const names = new Set();
  for (const match of css.matchAll(/(--oui-[a-z0-9-]+)\s*:/g)) names.add(match[1]);
  return names;
}
const LOCAL_TOKENS = localTokenNames(RENDERER_CSS);

/* ── 最小假 React：createElement + 最小 hooks（不执行 useEffect）──────── */

function flatten(list, out) {
  for (const item of list) {
    if (Array.isArray(item)) flatten(item, out);
    else out.push(item);
  }
  return out;
}

function createHarness() {
  const instances = new Map();
  let activeInstance = null;

  function requireActive() {
    if (activeInstance === null) throw new Error('hook 在组件外被调用');
    return activeInstance;
  }

  const React = {
    createElement(type, props, ...children) {
      return { __el: true, type, props: props || {}, children: flatten(children, []) };
    },
    useState(initial) {
      const instance = requireActive();
      const index = instance.index;
      instance.index += 1;
      if (instance.slots.length <= index) {
        instance.slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      }
      const slot = instance.slots[index];
      return [slot.value, function setState(next) {
        slot.value = typeof next === 'function' ? next(slot.value) : next;
      }];
    },
    useMemo(factory) {
      requireActive().index += 1;
      return factory();
    },
    useCallback(fn) {
      requireActive().index += 1;
      return fn;
    },
    useEffect() {
      requireActive().index += 1;
    },
    useId() {
      requireActive().index += 1;
      return ':oui:';
    },
  };

  const ui = createUi(React);
  let rootElement = null;

  function evaluate(element, path) {
    if (element === null || element === undefined || element === false || element === true) return null;
    if (typeof element === 'string' || typeof element === 'number') return String(element);
    if (Array.isArray(element)) {
      return element
        .map((child, index) => evaluate(child, path + '[' + index + ']'))
        .filter((child) => child !== null);
    }
    if (!element || element.__el !== true) return null;
    if (typeof element.type === 'function') {
      const name = element.type.name || 'Anonymous';
      const key = path + '::' + name;
      let instance = instances.get(key);
      if (!instance) {
        instance = { slots: [], index: 0 };
        instances.set(key, instance);
      }
      instance.index = 0;
      const previous = activeInstance;
      activeInstance = instance;
      let output;
      try {
        output = element.type(Object.assign({}, element.props, { children: element.children }));
      } finally {
        activeInstance = previous;
      }
      return evaluate(output, key + '>');
    }
    const children = element.children
      .map((child, index) => evaluate(child, path + '/' + index))
      .filter((child) => child !== null);
    return { __el: true, type: element.type, props: element.props, children: children };
  }

  return {
    React,
    ui,
    render(node, ctx) {
      rootElement = React.createElement(ui.Node, { node, ctx, depth: 0 });
      return evaluate(rootElement, 'root');
    },
    rerender() {
      return evaluate(rootElement, 'root');
    },
  };
}

function makeContext(overrides) {
  const ctx = { streaming: false, sent: [], opened: [] };
  ctx.send = function send(text) { ctx.sent.push(text); };
  ctx.open = function open(url) { ctx.opened.push(url); };
  return Object.assign(ctx, overrides || {});
}

function walk(tree, visit) {
  if (tree === null || tree === undefined || typeof tree === 'string') return;
  visit(tree);
  const children = tree.children || [];
  for (const child of children) walk(child, visit);
}

function findAll(tree, predicate) {
  const found = [];
  walk(tree, function (element) {
    if (predicate(element)) found.push(element);
  });
  return found;
}

function textOf(tree) {
  if (tree === null || tree === undefined) return '';
  if (typeof tree === 'string') return tree;
  return (tree.children || []).map(textOf).join('');
}

function byClass(tree, className) {
  return findAll(tree, function (element) {
    const value = element.props.className;
    return typeof value === 'string' && value.split(/\s+/).indexOf(className) !== -1;
  });
}

/* ── 组件样例（覆盖 catalog 全部组件）───────────────────────────────── */

const nodeOf = (type, arg) => ({ __node: true, id: String(type).toLowerCase(), type: type, arg: arg });
const textNode = (text) => nodeOf('Text', { text: text });

const FIXTURES = {
  Stack: [textNode('子文本 A'), textNode('子文本 B')],
  Row: [textNode('子文本 A'), textNode('子文本 B')],
  Card: { title: '卡片标题', children: [textNode('卡片正文')] },
  Heading: { text: '一级标题', level: 1 },
  Text: { text: '正文内容' },
  Callout: { title: '提示', text: '注意安全', tone: 'warning' },
  Badge: { text: '已完成', tone: 'success' },
  Divider: null,
  Code: { text: 'npm test', lang: 'bash' },
  Stat: { label: '完成率', value: '80%', hint: '本周' },
  Table: { columns: ['项目', '状态'], rows: [['甲', '完成'], ['乙', '进行中']], caption: '对比表' },
  Chart: { kind: 'bar', data: [{ label: '一月', value: 3 }, { label: '二月', value: 5 }], title: '月度', unit: '次' },
  Timeline: { items: [{ time: '09:00', title: '出发', detail: '酒店大堂', tone: 'info' }, { title: '抵达' }], title: '行程' },
  List: { items: ['第一点', '第二点'], ordered: true, title: '要点' },
  Steps: { title: '步骤', items: [{ title: '确认需求', status: 'done' }, { title: '实现', detail: '先跑通', status: 'active' }, { title: '验收', status: 'todo' }] },
  Progress: { title: '进度', items: [{ label: '测试', value: 8, max: 10, tone: 'info' }, { label: '文档', value: 3, max: 10, tone: 'success' }] },
  Image: { src: 'https://example.com/a.png', alt: '示例图', caption: '说明' },
  Gallery: { images: [{ src: 'https://example.com/a.png', alt: '图一' }, { src: 'https://example.com/b.png', alt: '图二' }], columns: 2, title: '图片墙' },
  Map: {
    center: [31.23, 121.47],
    zoom: 12,
    markers: [{ lat: 31.24, lng: 121.48, label: '外滩', tone: 'success' }],
    route: [[31.23, 121.47], [31.24, 121.48]],
    title: '路线',
    height: 220,
  },
  Accordion: {
    title: '折叠',
    items: [
      { title: '第一节', children: [textNode('第一节内容')] },
      { title: '第二节', children: [textNode('第二节内容')] },
    ],
  },
  Tabs: {
    tabs: [
      { label: '概览', children: [textNode('概览内容')] },
      { label: '详情', children: [textNode('详情内容')] },
    ],
    title: '页签',
  },
  Form: {
    fields: [
      { name: 'city', label: '城市', type: 'text' },
      { name: 'days', label: '天数', type: 'slider', min: 1, max: 7, value: 3 },
      { name: 'like', label: '喜欢', type: 'checkbox' },
      { name: 'plan', label: '方案', type: 'select', options: ['A', 'B'] },
    ],
    submit: { label: '提交', prompt: '帮我规划' },
    title: '表单',
  },
  Buttons: {
    title: '操作',
    items: [
      { label: '发送', action: { send: '你好' }, tone: 'info' },
      { label: '打开', action: { open: 'https://example.com' } },
    ],
  },
  Chips: {
    title: '建议',
    items: [{ label: '建议一', prompt: '请给我建议一' }, { label: '建议二' }],
  },
};

function renderOne(type, arg, ctx) {
  const harness = createHarness();
  return { harness: harness, tree: harness.render(nodeOf(type, arg), ctx || makeContext()) };
}

/* ── 门禁 1：导出形状与目录覆盖 ────────────────────────────────────── */

test('createUi 返回 { Node }，Node 是函数组件', () => {
  const harness = createHarness();
  assert.equal(typeof harness.ui.Node, 'function');
  assert.deepEqual(Object.keys(harness.ui), ['Node']);
});

test('样例覆盖 catalog 全部组件，且每个都能渲染出元素', () => {
  assert.deepEqual(Object.keys(FIXTURES).sort(), COMPONENT_NAMES.slice().sort());
  for (const name of COMPONENT_NAMES) {
    const rendered = renderOne(name, FIXTURES[name]);
    assert.ok(rendered.tree, name + ' 没有渲染出元素');
    assert.equal(rendered.tree.__el, true, name + ' 的渲染结果不是元素');
  }
});

/* ── 门禁 2：缺字段 / 类型不对时降级不抛错 ─────────────────────────── */

test('缺字段与错误类型全部降级，不抛错', () => {
  const args = [undefined, null, {}, 'oops', 42, [], [null], { children: 'bad' }];
  for (const name of COMPONENT_NAMES) {
    for (const arg of args) {
      assert.doesNotThrow(() => {
        const harness = createHarness();
        const tree = harness.render(nodeOf(name, arg), makeContext());
        assert.notEqual(tree, undefined);
      }, name + ' 在 arg=' + JSON.stringify(arg) + ' 时抛错');
    }
  }
});

test('未解析引用与未知组件不抛错', () => {
  const harness = createHarness();
  const tree = harness.render(
    nodeOf('Stack', [{ __missing: 'ghost' }, { __unknown: 'Hologram' }]),
    makeContext(),
  );
  assert.ok(tree);
  assert.ok(textOf(tree).indexOf('Hologram') !== -1, '未知组件应有可见提示');
  assert.doesNotThrow(() => {
    const single = createHarness();
    assert.equal(single.render({ __missing: 'ghost' }, makeContext()), null);
  });
  const unknownRoot = createHarness().render({ __unknown: 'Hologram' }, makeContext());
  assert.ok(textOf(unknownRoot).indexOf('Hologram') !== -1);
});

test('ctx 缺失时交互组件也不抛错', () => {
  const chips = createHarness().render(nodeOf('Chips', FIXTURES.Chips), undefined);
  byClass(chips, 'oui-chip').forEach(function (chip) {
    assert.doesNotThrow(() => chip.props.onClick());
  });
  const form = createHarness().render(nodeOf('Form', FIXTURES.Form), undefined);
  const formEl = findAll(form, (element) => element.type === 'form')[0];
  assert.doesNotThrow(() => formEl.props.onSubmit({ preventDefault() {} }));
});

/* ── 门禁 3：动作回传 ctx.send / ctx.open ──────────────────────────── */

test('Chips 点击调用 ctx.send，缺省 prompt 用 label', () => {
  const ctx = makeContext();
  const rendered = renderOne('Chips', FIXTURES.Chips, ctx);
  const chips = byClass(rendered.tree, 'oui-chip');
  assert.equal(chips.length, 2);
  chips[0].props.onClick({});
  chips[1].props.onClick({});
  assert.deepEqual(ctx.sent, ['请给我建议一', '建议二']);
  assert.equal(ctx.opened.length, 0);
});

test('Buttons 的 send 与 open 动作分别回传', () => {
  const ctx = makeContext();
  const rendered = renderOne('Buttons', FIXTURES.Buttons, ctx);
  const buttons = byClass(rendered.tree, 'oui-button');
  assert.equal(buttons.length, 2);
  buttons[0].props.onClick({});
  buttons[1].props.onClick({});
  assert.deepEqual(ctx.sent, ['你好']);
  assert.deepEqual(ctx.opened, ['https://example.com']);
});

test('streaming 时禁用提交与动作（aria-disabled 且不触发）', () => {
  const ctx = makeContext({ streaming: true });
  const chips = byClass(renderOne('Chips', FIXTURES.Chips, ctx).tree, 'oui-chip');
  chips.forEach(function (chip) {
    assert.equal(chip.props.disabled, true);
    assert.equal(chip.props['aria-disabled'], 'true');
    chip.props.onClick({});
  });
  const buttons = byClass(renderOne('Buttons', FIXTURES.Buttons, ctx).tree, 'oui-button');
  buttons.forEach(function (button) {
    assert.equal(button.props.disabled, true);
    assert.equal(button.props['aria-disabled'], 'true');
    button.props.onClick({});
  });
  const formTree = renderOne('Form', FIXTURES.Form, ctx).tree;
  const submit = byClass(formTree, 'oui-button-primary')[0];
  assert.equal(submit.props.disabled, true);
  assert.equal(submit.props['aria-disabled'], 'true');
  findAll(formTree, (element) => element.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  assert.equal(ctx.sent.length, 0);
  assert.equal(ctx.opened.length, 0);
});

/* ── 门禁 4：本地 state 交互 ────────────────────────────────────────── */

test('Form 输入后提交，拼出 prompt + 字段标签: 值', () => {
  const ctx = makeContext();
  const harness = createHarness();
  let tree = harness.render(nodeOf('Form', FIXTURES.Form), ctx);
  const fieldByName = (name) => findAll(tree, (element) => element.props && element.props.name === name)[0];
  fieldByName('city').props.onChange({ target: { value: '杭州' } });
  fieldByName('days').props.onChange({ target: { value: '5' } });
  fieldByName('like').props.onChange({ target: { checked: true } });
  fieldByName('plan').props.onChange({ target: { value: 'B' } });
  tree = harness.rerender();
  findAll(tree, (element) => element.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  assert.equal(ctx.sent.length, 1);
  const message = ctx.sent[0];
  assert.ok(message.startsWith('帮我规划'), message);
  assert.ok(message.indexOf('城市: 杭州') !== -1, message);
  assert.ok(message.indexOf('天数: 5') !== -1, message);
  assert.ok(message.indexOf('喜欢: 是') !== -1, message);
  assert.ok(message.indexOf('方案: B') !== -1, message);
});

test('Tabs 点击 / 方向键切换页签', () => {
  const harness = createHarness();
  let tree = harness.render(nodeOf('Tabs', FIXTURES.Tabs), makeContext());
  assert.ok(textOf(tree).indexOf('概览内容') !== -1);
  assert.ok(textOf(tree).indexOf('详情内容') === -1);
  const tabs = findAll(tree, (element) => element.type === 'button' && element.props.role === 'tab');
  assert.equal(tabs.length, 2);
  tabs[1].props.onClick({});
  tree = harness.rerender();
  assert.ok(textOf(tree).indexOf('详情内容') !== -1);
  assert.ok(textOf(tree).indexOf('概览内容') === -1);
  const tabsAgain = findAll(tree, (element) => element.type === 'button' && element.props.role === 'tab');
  assert.doesNotThrow(() => tabsAgain[1].props.onKeyDown({ key: 'ArrowRight', preventDefault() {} }));
  tree = harness.rerender();
  assert.ok(textOf(tree).indexOf('概览内容') !== -1, 'ArrowRight 应循环回第一个页签');
});

test('Accordion 点击切换展开项', () => {
  const harness = createHarness();
  let tree = harness.render(nodeOf('Accordion', FIXTURES.Accordion), makeContext());
  assert.ok(textOf(tree).indexOf('第一节内容') !== -1);
  assert.ok(textOf(tree).indexOf('第二节内容') === -1);
  const triggers = findAll(tree, (element) => element.type === 'button' && String(element.props.className).indexOf('oui-accordion-trigger') !== -1);
  assert.equal(triggers.length, 2);
  triggers[1].props.onClick({});
  tree = harness.rerender();
  assert.ok(textOf(tree).indexOf('第二节内容') !== -1);
  assert.ok(textOf(tree).indexOf('第一节内容') === -1);
});

test('Form 支持 textarea/radio/switch', () => {
  const tree = renderOne('Form', {
    fields: [
      { name: 'note', label: '备注', type: 'textarea' },
      { name: 'level', label: '级别', type: 'radio', options: ['低', '高'] },
      { name: 'agree', label: '同意', type: 'switch' },
    ],
    submit: { label: '提交' },
  }).tree;
  assert.ok(textOf(tree).indexOf('备注') !== -1);
  assert.equal(findAll(tree, (element) => element.type === 'textarea').length, 1);
  assert.equal(findAll(tree, (element) => element.type === 'input' && element.props.type === 'radio').length, 2);
  assert.equal(findAll(tree, (element) => element.type === 'input' && element.props.role === 'switch').length, 1);
});

test('Steps 显示状态文字，Progress 显示百分比', () => {
  const steps = renderOne('Steps', FIXTURES.Steps).tree;
  assert.ok(textOf(steps).indexOf('已完成') !== -1);
  assert.ok(textOf(steps).indexOf('进行中') !== -1);
  const progress = renderOne('Progress', FIXTURES.Progress).tree;
  assert.ok(textOf(progress).indexOf('80%') !== -1);
  assert.ok(textOf(progress).indexOf('30%') !== -1);
  const bars = findAll(progress, (element) => element.type === 'div' && element.props.role === 'progressbar');
  assert.equal(bars.length, 2);
});

/* ── 门禁 5：Chart 手写 SVG 与降级 ─────────────────────────────────── */

test('Chart 支持 bar/line/area/pie 且 value 非数字被跳过', () => {
  const kinds = ['bar', 'line', 'area', 'pie'];
  for (const kind of kinds) {
    const data = [
      { label: '一', value: 3 },
      { label: '坏', value: 'abc' },
      { label: '空' },
      { label: '二', value: 5 },
    ];
    const rendered = renderOne('Chart', { kind: kind, data: data, title: '测试图', unit: '次' });
    const svg = findAll(rendered.tree, (element) => element.type === 'svg');
    assert.equal(svg.length, 1, kind + ' 应有一个 SVG');
    assert.ok(String(svg[0].props['aria-label']).indexOf('共 2 项') !== -1, kind + ' 应跳过非数字 value');
    assert.ok(String(svg[0].props['aria-label']).indexOf('次') !== -1, kind + ' 概述应带单位');
    if (kind === 'bar') {
      assert.equal(findAll(rendered.tree, (element) => element.type === 'rect').length, 2);
    }
    if (kind === 'pie') {
      assert.equal(findAll(rendered.tree, (element) => element.type === 'path').length, 2);
    }
    if (kind === 'line' || kind === 'area') {
      assert.equal(findAll(rendered.tree, (element) => element.type === 'polyline').length, 1);
    }
  }
});

test('Chart 未知 kind / 无有效数据时降级为文字说明', () => {
  const unknown = renderOne('Chart', { kind: 'radar', data: [{ label: '一', value: 1 }] }).tree;
  assert.ok(textOf(unknown).indexOf('暂不支持的图表类型') !== -1);
  const empty = renderOne('Chart', { kind: 'bar', data: [{ label: 'x', value: null }, { label: 'y', value: 'NaN' }] }).tree;
  assert.ok(textOf(empty).indexOf('没有可绘制的数据') !== -1);
  const pieNegative = renderOne('Chart', { kind: 'pie', data: [{ label: 'x', value: -1 }] }).tree;
  assert.ok(textOf(pieNegative).length > 0);
});

/* ── 门禁 6：Map 离线可用 ──────────────────────────────────────────── */

test('Map 用 3×3 OSM 瓦片 + SVG 路线/标记，瓦片失败自动退化且标记仍可见', () => {
  const harness = createHarness();
  let tree = harness.render(nodeOf('Map', FIXTURES.Map), makeContext());
  const tiles = findAll(tree, (element) => element.type === 'img');
  assert.equal(tiles.length, 9, '应有 3×3 九张瓦片');
  for (const tile of tiles) {
    assert.ok(String(tile.props.src).startsWith('https://tile.openstreetmap.org/'), String(tile.props.src));
    assert.ok(/\.png$/.test(String(tile.props.src)));
  }
  const polylines = findAll(tree, (element) => element.type === 'polyline');
  assert.equal(polylines.length, 1, 'route 应渲染 SVG 折线');
  const circles = findAll(tree, (element) => element.type === 'circle');
  assert.equal(circles.length, 1, 'markers 应渲染 SVG 标记点');
  assert.ok(String(circles[0].props.cx).endsWith('%'));
  // 模拟离线：前 3 张瓦片 onError 后整体退化为示意网格底图
  tiles.slice(0, 3).forEach(function (tile) {
    tile.props.onError({ target: { style: {} } });
  });
  tree = harness.rerender();
  assert.equal(findAll(tree, (element) => element.type === 'img').length, 0, '退化后不应残留瓦片 img');
  assert.equal(byClass(tree, 'oui-map-grid').length, 1, '应显示示意网格底图');
  assert.equal(findAll(tree, (element) => element.type === 'polyline').length, 1, '退化后路线仍可见');
  assert.equal(findAll(tree, (element) => element.type === 'circle').length, 1, '退化后标记仍可见');
  assert.ok(textOf(tree).indexOf('示意底图') !== -1);
});

test('Map 中心坐标缺失时直接使用示意底图，不产生 NaN', () => {
  const tree = renderOne('Map', { center: 'bad', markers: [{ lat: 1, lng: 2 }] }).tree;
  assert.ok(tree);
  assert.ok(!JSON.stringify(tree, (key, value) => value).includes('NaN'));
  assert.equal(findAll(tree, (element) => element.type === 'img').length, 0);
  assert.equal(byClass(tree, 'oui-map-grid').length, 1);
});

/* ── 门禁 7：媒体 onError 占位、表格横向滚动 ───────────────────────── */

test('Image/Gallery 加载失败显示占位框而不是破图', () => {
  const harness = createHarness();
  let tree = harness.render(nodeOf('Image', FIXTURES.Image), makeContext());
  const images = findAll(tree, (element) => element.type === 'img');
  assert.equal(images.length, 1);
  images[0].props.onError({});
  tree = harness.rerender();
  assert.equal(findAll(tree, (element) => element.type === 'img').length, 0);
  assert.ok(textOf(tree).indexOf('图片加载失败') !== -1);
  const invalid = renderOne('Image', { src: 'javascript:alert(1)' }).tree;
  assert.equal(findAll(invalid, (element) => element.type === 'img').length, 0);
  assert.ok(textOf(invalid).indexOf('图片地址无效') !== -1);
  const gallery = renderOne('Gallery', FIXTURES.Gallery).tree;
  assert.equal(findAll(gallery, (element) => element.type === 'img').length, 2);
});

test('Table 外层可横向滚动，且不撑破对话宽度', () => {
  const tree = renderOne('Table', FIXTURES.Table).tree;
  const scrollers = byClass(tree, 'oui-table-scroll');
  assert.equal(scrollers.length, 1);
  assert.equal(findAll(tree, (element) => element.type === 'table').length, 1);
  assert.equal(findAll(tree, (element) => element.type === 'th').length, 2);
  assert.equal(findAll(tree, (element) => element.type === 'td').length, 4);
  assert.ok(/\.oui-table-scroll\s*\{[^}]*overflow-x:\s*auto/s.test(RENDERER_CSS));
  assert.ok(/\.oui-root\s*\{[^}]*min-width:\s*0/s.test(RENDERER_CSS));
});

/* ── 门禁 8：compileUi 端到端 ──────────────────────────────────────── */

test('compileUi 产物可以端到端渲染并切换页签', () => {
  const program = compileUi(
    [
      'root = Stack([head, card, tabs])',
      "head = Heading({text: '端到端', level: 1})",
      "card = Card({title: '卡片', children: [body, tag]})",
      "body = Text({text: '卡片正文'})",
      "tag = Badge({text: '新'})",
      "tabs = Tabs({tabs: [{label: '一', children: [tabOne]}, {label: '二', children: [tabTwo]}]})",
      "tabOne = Text({text: '第一页内容'})",
      "tabTwo = Text({text: '第二页内容'})",
    ].join('\n'),
    { final: true },
  );
  assert.equal(program.errors.length, 0, JSON.stringify(program.errors));
  const harness = createHarness();
  let tree = harness.render(program.root, makeContext());
  assert.ok(textOf(tree).indexOf('端到端') !== -1);
  assert.ok(textOf(tree).indexOf('卡片正文') !== -1);
  assert.ok(textOf(tree).indexOf('第一页内容') !== -1);
  const tabs = findAll(tree, (element) => element.type === 'button' && element.props.role === 'tab');
  tabs[1].props.onClick({});
  tree = harness.rerender();
  assert.ok(textOf(tree).indexOf('第二页内容') !== -1);
});

/* ── 门禁 9：样式约束（token / !important / 外部资源 / 动效降级）───── */

test('CSS 只用宿主主题 token，无 !important / 外部字体图片 / 窄屏溢出', () => {
  assert.ok(!/!\s*important/i.test(RENDERER_CSS), '不允许 !important');
  assert.ok(!/@import/i.test(RENDERER_CSS), '不允许 @import');
  assert.ok(!/url\s*\(/i.test(RENDERER_CSS), '不允许外部图片/字体 url()');
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(RENDERER_CSS), '颜色必须是 token，不允许十六进制色值');
  assert.ok(!/\b(?:rgba?|hsla?)\(/i.test(RENDERER_CSS), '颜色必须是 token，不允许 rgb/hsl');
  for (const match of RENDERER_CSS.matchAll(/var\((--[a-z0-9-]+)\)/g)) {
    const token = match[1];
    assert.ok(
      ALLOWED_TOKENS.has(token) || LOCAL_TOKENS.has(token),
      '越界 token：' + token + '（宿主 token 或本文件已定义的 --oui-* 才允许）',
    );
  }
  for (const match of RENDERER_CSS.matchAll(/(--oui-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const value = match[2];
    assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(value), '局部变量不能写十六进制：' + match[1]);
    assert.ok(!/\b(?:rgba?|hsla?)\(/i.test(value), '局部变量不能写 rgb/hsl：' + match[1]);
  }
  assert.ok(RENDERER_CSS.indexOf('@media (prefers-reduced-motion: reduce)') !== -1, '缺少动效降级');
  assert.ok(/\.oui-skeleton-row[^}]*animation:\s*none/s.test(RENDERER_CSS), '骨架动效未降级');
  assert.ok(RENDERER_CSS.indexOf('@media (max-width: 480px)') !== -1, '缺少窄屏适配');
  assert.ok(RENDERER_CSS.indexOf('.oui-root :focus-visible') !== -1, '缺少可见焦点环');
  for (const name of ['oui-stack', 'oui-row', 'oui-card', 'oui-badge', 'oui-callout', 'oui-divider', 'oui-code', 'oui-stat', 'oui-table-scroll', 'oui-chart', 'oui-timeline', 'oui-list', 'oui-media', 'oui-gallery', 'oui-map', 'oui-tabs', 'oui-form', 'oui-buttons', 'oui-chip']) {
    assert.ok(RENDERER_CSS.indexOf('.' + name) !== -1, '缺少样式 .' + name);
  }
});

test('渲染器源码只用 createElement，不碰危险 API，且覆盖全部组件', () => {
  assert.ok(rendererSource.indexOf('React.createElement') !== -1, '必须用 React.createElement');
  assert.ok(!/dangerouslySetInnerHTML/.test(rendererSource), '不允许 dangerouslySetInnerHTML');
  assert.ok(!/\bdocument\s*\./.test(rendererSource), '不允许操作 document');
  assert.ok(!/\beval\s*\(/.test(rendererSource), '不允许 eval');
  assert.ok(!/new\s+Function/.test(rendererSource), '不允许 new Function');
  assert.ok(!/\brequire\s*\(/.test(rendererSource), '不允许 require');
  assert.ok(!/!important/.test(rendererSource), 'renderer.mjs 不允许 !important');
  for (const match of rendererSource.matchAll(/var\((--[a-z0-9-]+)\)/g)) {
    assert.ok(ALLOWED_TOKENS.has(match[1]), 'renderer.mjs 越界 token：' + match[1]);
  }
  for (const name of COMPONENT_NAMES) {
    assert.ok(rendererSource.indexOf("case '" + name + "':") !== -1, '渲染器缺少组件分支：' + name);
  }
  const topLevel = [];
  for (const match of rendererSource.matchAll(/^(?:export\s+)?(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    topLevel.push(match[1]);
  }
  assert.deepEqual(topLevel, ['createUi'], 'renderer.mjs 顶层只允许 createUi 一个声明');
});
