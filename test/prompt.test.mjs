import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSystemPrompt } from '../src/prompt.mjs';
import { COMPONENT_NAMES } from '../src/catalog.mjs';
import { LIMITS } from '../src/kit.mjs';

const prompt = buildSystemPrompt();

test('提示词覆盖目录里全部组件', () => {
  for (const name of COMPONENT_NAMES) {
    assert.ok(prompt.includes(name), '提示词缺少组件：' + name);
  }
});

test('提示词含硬约束（不编数/未知/单次/上限/短话）', () => {
  assert.ok(prompt.includes('不编造'), '缺少不编造约束');
  assert.ok(prompt.includes('未知/待确认'), '缺少未知/待确认约束');
  assert.ok(prompt.includes('最多调用 1 次'), '缺少单次调用约束');
  assert.ok(prompt.includes(String(LIMITS.nodes)) && prompt.includes(String(LIMITS.sourceChars)), '缺少规模上限');
  assert.ok(prompt.includes('1–2 句'), '缺少界面外短话约束');
});

test('提示词要求动作只有 send/open', () => {
  assert.ok(prompt.includes('send') && prompt.includes('open'), '缺少动作说明');
  assert.ok(prompt.includes('动作只有两种'), '缺少动作白名单');
});
