/** 构建 client/client.js：把 src 里几份纯 ESM 源码拼成一个 ModuleLoader 动态包。
 *
 *  为什么手写拼接而不是上打包器：客户端插件必须是 `window.__ModuleLoader__.load({factory})`
 *  形式的单文件，且不能依赖构建链；这里只做"去掉 import/export 后同作用域拼接"。
 *  拼接是**确定性的**：同样的源码 → 同样的字节（test/build.test.mjs 守住）。
 *
 *  约束：被拼接的文件顶层只允许 `function/const/class` 声明，且名字不能重复
 *  （重复会在同作用域里冲突，构建直接失败而不是静默覆盖）。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = here;

const FILES = ['src/catalog.mjs', 'src/kit.mjs', 'src/renderer-css.mjs', 'src/renderer.mjs', 'src/client-entry.mjs'];
const ID = 'dsh-intelligent-ui';

/** 去掉 ESM 的 import/export 语法：只处理行首声明，避免误伤字符串里的单词。 */
function inline(file, text) {
  const kept = [];
  for (const [index, line] of text.split('\n').entries()) {
    if (/^\s*import\b/.test(line)) continue;
    if (/^\s*export\s*\{/.test(line)) continue;
    if (/^\s*export\s+default\b/.test(line)) throw new Error(`${file}:${index + 1} 不支持 export default`);
    kept.push(line.replace(/^(\s*)export\s+/, '$1'));
  }
  const stripped = kept.join('\n');
  const leftover = stripped.split('\n').find((line) => /^\s*(import|export)\b/.test(line));
  if (leftover) throw new Error(`${file}: 仍有未处理的 ESM 语法 → ${leftover.trim()}`);
  return stripped;
}

const TOP_LEVEL = /^(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/;

function topLevelNames(file, text) {
  const names = [];
  let depth = 0;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    const match = depth === 0 ? TOP_LEVEL.exec(line) : null;
    if (match) names.push([match[1], file]);
    if (/^\s*export\b/.test(line) === false) {
      // 只在非模板字符串区域统计大括号，足够用于"顶层声明"判断
      depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (depth < 0) depth = 0;
    }
  }
  return names;
}

const bodies = FILES.map((file) => {
  const text = readFileSync(join(root, file), 'utf8');
  return { file, text: inline(file, text) };
});

const seen = new Map();
for (const { file, text } of bodies) {
  for (const [name] of topLevelNames(file, text)) {
    if (seen.has(name)) throw new Error(`顶层标识符重名：${name}（${seen.get(name)} 与 ${file}）`);
    seen.set(name, file);
  }
}

const body = bodies.map(({ file, text }) => `// ── ${file} ──────────────────────────────────────────\n${text.trim()}`).join('\n\n');

const artifact = `/* 自动生成，不要手改：源文件在 src/*.mjs，运行 \`node build.mjs\` 重新生成。
 * 生成式界面（Intelligent UI）Client 动态包：把 render_ui 工具卡片换成可交互界面。
 * 目标：${ID} */
window.__ModuleLoader__.load({
  id: '${ID}',
  factory: (require) => {
    const React = require('react');

${body}

    // 样式表由宿主 client-modules 在工厂物化时认领（claimStyles → style[data-plugin]），
    // 插件卸载/HMR 时一并移除；不要 require('styles')：模块表里没有这个 specifier。
    const styleEl = document.createElement('style');
    styleEl.textContent = RENDERER_CSS;
    document.head.appendChild(styleEl);

    return clientMain(React);
  },
});
`;

const outPath = join(root, 'client/client.js');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, artifact);
const digest = createHash('sha256').update(artifact).digest('hex').slice(0, 16);
console.log(`built client/client.js  ${artifact.length} bytes  sha256:${digest}`);
