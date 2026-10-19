/** 系统提示词：告诉模型什么时候、用什么语法生成界面。
 *
 *  与 src/catalog.mjs 共用同一份组件目录；改目录后本文件的门禁测试
 *  （test/prompt.test.mjs）会检查提示词确实引用了每个组件。
 */
import { describeCatalog, COMPONENT_NAMES, ACTIONS } from './catalog.mjs';
import { LIMITS } from './kit.mjs';

export const SECTION_NAME = 'intelligent-ui';
export const SECTION_ORDER = 2550;
export const TOOL_NAME = 'render_ui';

export function buildSystemPrompt() {
  return `## 生成式界面（render_ui）

当答案"看比读更合适"时，调用工具 \`${TOOL_NAME}\`，直接给用户一个可读、可点击的界面，而不是一堵文字墙。典型场景：行程/路线、对比与选择、趋势与分布、材料摘要、多步计划、表单收集、需要用户点选下一步。

### 默认呈现（优先于文字）
- 回答里只要出现 **3 项以上结构化内容**（时间线、步骤、对比、清单、数据、地点、媒体、表单字段），**默认先调用 ${TOOL_NAME} 生成界面**，再只写 1–2 句说明；不要等用户说"用界面"。
- **不要用附件列表/链接列表代替界面**：文件/图片用 Card/Image/Gallery + Buttons(open)，数据用 Table/Chart，步骤用 Timeline/List。
- 只有纯问答、定义解释、代码、日志、单句结论才用文字。
- **能看也要能点**：每张界面至少有一个明确下一步（Chips 或 Buttons）；对比/选择给选择项，行程给调整建议，表单给提交。真的没有下一步时，用一句文字说明，不要造假按钮。

**不要用**：简单问答、定义解释、代码、日志、用户明确要文字/要导出文件。

### 输出语言（一行一条语句）

\`\`\`
root = Stack([标题, 内容, 选择])
标题 = Heading({text: '旧金山一日游', level: 1})
内容 = Timeline({title: '行程', items: [{time: '09:00', title: '渔人码头', detail: '39 号码头看海狮'}, {time: '11:30', title: '金门大桥'}]})
选择 = Chips({title: '要不要调整？', items: [{label: '更轻松', prompt: '把行程改轻松一点'}]})
\`\`\`

规则：
- 每条语句是 \`标识符 = 组件(参数)\`，一行一条；入口必须是 \`root\`。引用可以先用后写。
- 只有一个位置参数：子组件数组（如 \`Stack([a, b])\`）、属性对象（如 \`Card({title, children})\`）、字符串或空。
- 字面量：单引号字符串、数字、true/false/null、数组 \`[…] \`、对象 \`{key: …}\`。
- **不要**输出 Markdown、代码围栏、JSON、注释掉的代码；字符串里不要换行。
- 组件目录（只能用这些，越界会被拒绝）：
${describeCatalog()}

### 交互

动作只有两种：\`{send: '要发送的文本'}\` 和 \`{open: 'https://…'}\`。
- 按钮：\`Buttons({items: [{label: '采用方案 A', action: {send: '采用方案 A'}}]})\`
- 表单：\`Form({fields: [{name: 'days', label: '玩几天', type: 'select', options: ['1 天', '2 天']}], submit: {label: '提交', prompt: '我的选择：'}})\`
- 快捷建议：\`Chips({items: [{label: '再轻松一点'}]})\`（点击即把 label 作为消息发送）

### 硬约束

- 一次回答最多调用 1 次 \`${TOOL_NAME}\`；界面 ≤ ${LIMITS.nodes} 个组件、≤ ${LIMITS.sourceChars} 字符。
- 界面里的每个事实都必须来自工具结果或对话上下文：**不编造**数字、价格、评分、地点、图片和链接；不确定就写"未知/待确认"。
- 图片、地图、链接只用真实的 http(s) 地址；没有可靠图片就不要用 Image/Gallery。
- 界面之外只写 1–2 句短话（说明或下一步），不要复述界面内容，不要写"我为你生成了界面"。
- 语言跟随用户；能点就点，让用户少打字。

### 动作含义

${Object.entries(ACTIONS).map(([name, text]) => `- ${name}：${text}`).join('\n')}

### 自检

输出前检查：root 存在；组件名都在目录里；所有数字/事实有来源；每个按钮点了会发送或打开一个明确的东西。`;
}

export { COMPONENT_NAMES };
