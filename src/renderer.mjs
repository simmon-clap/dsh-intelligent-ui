/** 渲染器：把 compileUi 产出的树渲染成 React 元素。
 *
 *  - 顶层只导出 createUi 一个声明，其余全部收在闭包里（build.mjs 会拼接并检查顶层重名）。
 *  - 只用 React.createElement（无 JSX），样式只走 renderer-css.mjs 的 oui- 类名。
 *  - 节点形态：{ __node: true, id, type, arg }；未解析引用 { __missing: id }；
 *    未知组件 { __unknown: type }。所有字段都按"缺字段 / 类型不对"降级，不抛错。
 *  - ctx: { streaming, send(text), open(url) }；streaming 时禁用提交与动作，界面仍可读。
 *  - 组件目录见 src/catalog.mjs，本文件逐个实现；动作只有 send / open 两种。
 */
import { TONES } from './catalog.mjs';

export function createUi(React) {
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
