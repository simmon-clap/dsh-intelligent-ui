/** Host 半：注册 render_ui 工具 + 生成式界面的系统提示词。
 *
 *  设计约束（对应 spec/19）：
 *  - 模型只输出"界面源码"，不执行代码；Host 侧做白名单与规模校验；
 *  - 界面源码随工具调用参数进入 Session 日志 → 重放、fork、导出天然可复现；
 *  - 不做模型调用、不写第二套入口、不持久化业务数据。
 */
import { compileUi, LIMITS } from './kit.mjs';
import { buildSystemPrompt, SECTION_NAME, SECTION_ORDER, TOOL_NAME } from './prompt.mjs';

export const name = 'dsh-intelligent-ui';
export const inject = ['tools', 'systemPrompt'];

const TOOL_DESCRIPTION = `把回答渲染成可交互界面（卡片/表格/图表/时间线/地图/表单/按钮），在对话里直接给用户"看和点"的结果。
当答案看比读更合适时使用：行程/路线、对比与选择、趋势与分布、多步计划、表单收集、需要用户点选下一步。
参数 ui 是界面源码（一行一条 \`id = 组件(...)\`，入口 root），语法与组件目录见系统提示的"生成式界面"一节。
不要用于简单问答、代码、日志；一次回答最多调用一次；界面之外只写 1–2 句短话。`;

const PARAMETERS = {
  type: 'object',
  properties: {
    ui: {
      type: 'string',
      description:
        `界面源码。行式语法：每条 \`标识符 = 组件(参数)\`，入口必须是 root，引用可先用后写；` +
        `组件只能用系统提示里登记的那批；最多 ${LIMITS.nodes} 个组件、${LIMITS.sourceChars} 字符。`,
    },
  },
  required: ['ui'],
  additionalProperties: false,
};

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    nodes: { type: 'integer' },
    errors: { type: 'array', items: { type: 'string' } },
  },
  required: ['ok', 'nodes', 'errors'],
  additionalProperties: false,
};

export function apply(ctx) {
  ctx.effect(() =>
    ctx.tools.register({
      name: TOOL_NAME,
      description: TOOL_DESCRIPTION,
      parameters: PARAMETERS,
      output: {
        schema: OUTPUT_SCHEMA,
        render(args, value) {
          const data = value && typeof value === 'object' ? value : {};
          const reasons = Array.isArray(data.errors) ? data.errors : [];
          if (data.ok === true) {
            const ignored = reasons.length === 0 ? '' : `，忽略了 ${reasons.length} 处不合规内容（${reasons.join('；')}）`;
            return [
              {
                type: 'text',
                text:
                  `界面已显示（${data.nodes ?? 0} 个组件${ignored}）。` +
                  (reasons.length === 0
                    ? '接下来只写 1–2 句短话，不要复述界面内容。'
                    : '如缺失影响表达，可修正后重试一次；否则只写 1–2 句短话。'),
              },
            ];
          }
          return [{ type: 'text', text: `界面没有生成成功：${reasons.length > 0 ? reasons.join('；') : '没有可渲染的内容'}。修正后用同一工具重试一次，或改用纯文字回答。` }];
        },
      },
      isConcurrencySafe: () => true,
      async execute(args) {
        const source = args && typeof args.ui === 'string' ? args.ui : '';
        if (source.trim() === '') {
          throw new Error('ui 参数为空：请在 ui 里给出界面源码（一行一条 `id = 组件(...)`，入口 root）。');
        }
        const compiled = compileUi(source, { final: true });
        // “成功”= 有可渲染内容；个别越界/缺字段不阻断整张卡，错误作为警告回给模型。
        return {
          ok: compiled.root !== null && compiled.stats.nodes > 0 && compiled.stats.tooMany !== true,
          nodes: compiled.stats.nodes,
          errors: compiled.errors.slice(0, 8).map((error) => error.message),
        };
      },
    }),
  );

  ctx.effect(() =>
    ctx.systemPrompt.section({
      name: SECTION_NAME,
      order: SECTION_ORDER,
      text: buildSystemPrompt(),
    }),
  );
}
