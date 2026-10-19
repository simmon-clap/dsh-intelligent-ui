/** Client 半：把 render_ui 的工具调用卡片换成一个可交互界面。
 *
 *  关键机制（2026-10-18 用宿主 Inspect 核验）：
 *  - `tool.call.toolview` 是按 wire tool 名分发的 keyed slot，key 域开放；
 *  - 工具卡片的三个阶段（preparing / start / result）都带 name 与惰性 args 读取器，
 *    preparing 阶段 args 会随模型输出增长 → 逐步渲染（不是等 JSON 闭合）。
 *  - 交互（按钮/表单/建议）只做两件事：把文本交给会话输入框发送，或打开链接。
 */
import { compileUi } from './kit.mjs';
import { createUi } from './renderer.mjs';
import { RENDERER_CSS } from './renderer-css.mjs';

export function clientMain(React) {
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
