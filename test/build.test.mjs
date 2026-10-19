import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const artifact = join(root, 'client/client.js');

test('client/client.js 与源码同步（改源码后必须重新 build）', () => {
  const before = readFileSync(artifact, 'utf8');
  execFileSync(process.execPath, [join(root, 'build.mjs')], { cwd: root, stdio: 'pipe' });
  const after = readFileSync(artifact, 'utf8');
  assert.equal(after, before, 'client/client.js 不是最新的：运行 node build.mjs 后重新提交');
});

test('产物是 ModuleLoader 动态包且不直接 import Client 包', () => {
  const text = readFileSync(artifact, 'utf8');
  assert.ok(text.includes("window.__ModuleLoader__.load({"), '缺少 ModuleLoader 包装');
  assert.ok(text.includes("id: 'dsh-intelligent-ui'"), '模块 id 不对');
  assert.ok(text.includes("require('react')"), '需要 require(react)');
  assert.ok(!/require\(['"]@deepseek-ai\//.test(text), '不允许 require Harness Client 包');
  assert.ok(!/^\s*import\s/m.test(text), '产物里不允许 ESM import');
});

test('package.json 的导出与文件清单存在', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.equal(pkg.dsh.client.platform, 'web');
  for (const key of ['.', './client', './icon']) assert.ok(pkg.exports[key], `缺少导出 ${key}`);
  for (const file of ['cordis.patch.yml', 'icon.svg', 'client/client.js', 'locale/zh.json', 'locale/en.json']) {
    assert.doesNotThrow(() => readFileSync(join(root, file)), `缺少文件 ${file}`);
  }
});

test('重复构建的字节一致（确定性）', () => {
  const first = readFileSync(artifact);
  execFileSync(process.execPath, [join(root, 'build.mjs')], { cwd: root, stdio: 'pipe' });
  const second = readFileSync(artifact);
  assert.deepEqual(second, first, '两次构建的产物字节不一致');
});
