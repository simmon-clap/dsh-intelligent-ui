import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileUi, LIMITS } from '../src/kit.mjs';
import { COMPONENTS, COMPONENT_NAMES, describeCatalog } from '../src/catalog.mjs';
import { buildSystemPrompt, TOOL_NAME, SECTION_NAME } from '../src/prompt.mjs';

const ok = (source, options) => compileUi(source, { final: true, ...options });

test('编译一个最小可用界面', () => {
  const result = ok(`
root = Stack([title, body])
title = Heading({text: '旧金山一日游', level: 1})
body = Text({text: '从渔人码头出发'})
`);
  assert.equal(result.errors.length, 0, JSON.stringify(result.errors));
  assert.ok(result.root);
  assert.equal(result.root.type, 'Stack');
  assert.equal(result.stats.nodes, 3);
  assert.equal(result.root.arg.length, 2);
  assert.equal(result.root.arg[1].type, 'Text');
});

test('前向引用与嵌套内联组件', () => {
  const result = ok(`
root = Stack([Card({title: 'A', children: [Text({text: 'hi'})]})])
`);
  assert.equal(result.errors.length, 0, JSON.stringify(result.errors));
  const card = result.root.arg[0];
  assert.equal(card.type, 'Card');
  assert.equal(card.arg.children[0].type, 'Text');
});

test('流式未完成时不报错、不渲染半截', () => {
  const result = compileUi('root = Stack([title\n', { final: false });
  assert.equal(result.pending, true);
  assert.equal(result.root, null);
  assert.equal(result.errors.length, 0);
});

test('未知组件被拒绝', () => {
  const result = ok('root = Hologram({text: "x"})');
  assert.ok(result.errors.some((error) => error.code === 'unknown-component'));
});

test('最终代码引用不存在的组件会报错', () => {
  const result = ok('root = Stack([ghost])');
  assert.ok(result.errors.some((error) => error.code === 'unresolved'));
});

test('缺少 root 会报错', () => {
  const result = ok('a = Text({text: "x"})');
  assert.ok(result.errors.some((error) => error.code === 'no-root'));
});

test('循环引用被识别', () => {
  const result = ok('root = Stack([a])\na = Stack([root])');
  assert.ok(result.errors.some((error) => error.code === 'cycle'));
});

test('组件参数形态错误被拒绝', () => {
  const result = ok('root = Stack("not an array")');
  assert.ok(result.errors.some((error) => error.code === 'bad-arg-kind'));
});

test('缺少必填字段被拒绝', () => {
  const result = ok('root = Table({columns: ["a"]})');
  assert.ok(result.errors.some((error) => error.code === 'missing-prop'));
});

test('非 http(s) 图片地址被清空', () => {
  const result = ok('root = Image({src: "javascript:alert(1)"})');
  assert.equal(result.root.arg.src, '');
  assert.ok(result.errors.some((error) => error.code === 'bad-url'));
});

test('数组上限被截断', () => {
  const rows = Array.from({ length: 80 }, (_, index) => `["${index}", "x"]`).join(',');
  const result = ok(`root = Table({columns: ["a", "b"], rows: [${rows}]})`);
  assert.ok(result.errors.some((error) => error.code === 'too-many'));
  assert.equal(result.root.arg.rows.length, COMPONENTS.Table.limits.rows);
});

test('超长文本被截断', () => {
  const long = 'x'.repeat(LIMITS.stringChars + 10);
  const result = ok(`root = Text({text: "${long}"})`);
  assert.equal(result.root.arg.text.length, LIMITS.stringChars);
  assert.ok(result.errors.some((error) => error.code === 'too-long'));
});

test('重复标识符只保留第一条并报错', () => {
  const result = ok('root = Text({text: "a"})\nroot = Text({text: "b"})');
  assert.equal(result.root.arg.text, 'a');
  assert.ok(result.errors.some((error) => error.code === 'duplicate'));
});

test('注释与空行被忽略', () => {
  const result = ok("# 说明\n\nroot = Text({text: 'a'})   # 行尾注释");
  assert.equal(result.errors.length, 0, JSON.stringify(result.errors));
  assert.equal(result.root.arg.text, 'a');
});

test('多行数组可以解析', () => {
  const result = ok(`root = Stack([
  a,
  b,
])
a = Text({text: '1'})
b = Text({text: '2'})
`);
  assert.equal(result.errors.length, 0, JSON.stringify(result.errors));
  assert.equal(result.root.arg.length, 2);
});

test('动作只接受 send/open', () => {
  const result = ok(`root = Buttons({items: [{label: 'A', action: {hack: 'x'}}]})`);
  assert.ok(result.errors.some((error) => error.code === 'bad-action'));
  assert.equal(result.root.arg.items[0].action, null);
});

test('超过 200 个组件记 too-many 并标记失败', () => {
  const ids = Array.from({ length: 210 }, (_, index) => 'n' + index);
  const source = 'root = Stack([' + ids.join(', ') + '])\n' + ids.map((id) => id + " = Text({text: 'x'})").join('\n');
  const result = compileUi(source, { final: true });
  assert.equal(result.stats.tooMany, true);
  assert.equal(result.stats.nodes, LIMITS.nodes);
  assert.ok(result.errors.some((error) => error.code === 'too-many'));
});

test('超过源码上限直接拒绝', () => {
  const result = compileUi('x'.repeat(LIMITS.sourceChars + 1), { final: true });
  assert.equal(result.root, null);
  assert.ok(result.errors.some((error) => error.code === 'too-large'));
});

test('目录里每个组件都有签名且提示词覆盖全部组件', () => {
  for (const name of COMPONENT_NAMES) {
    assert.equal(typeof COMPONENTS[name].signature, 'string');
    assert.ok(COMPONENTS[name].signature.startsWith(name), `${name} 的签名应以组件名开头`);
    assert.ok(COMPONENTS[name].summary.trim().length >= 3, `${name} 缺少说明`);
  }
  const catalogText = describeCatalog();
  const prompt = buildSystemPrompt();
  for (const name of COMPONENT_NAMES) {
    assert.ok(catalogText.includes(name), `目录文本缺少 ${name}`);
    assert.ok(prompt.includes(name), `提示词缺少 ${name}`);
  }
  assert.ok(prompt.includes(TOOL_NAME), '提示词必须点名工具');
  assert.equal(SECTION_NAME, 'intelligent-ui');
});
