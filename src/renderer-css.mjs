/** 渲染器样式。只用宿主主题 token（--dsw-alias-*），不引任何 Client 包。
 *  约定：
 *  - 组件类名统一 oui- 前缀；不写 !important，不引外部字体/图片；
 *  - 颜色只用下方 token，尺寸/圆角/字号用字面量，正文跟随宿主 14/22；
 *  - 任何块级容器 min-width: 0，窄屏（390px）不产生横向溢出；
 *  - 动效只有骨架与脉动，prefers-reduced-motion 下全部降级。
 */
export const RENDERER_CSS = `
.oui-root {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 4px 0 2px;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.oui-root *,
.oui-root *::before,
.oui-root *::after { box-sizing: border-box; }
.oui-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  max-width: 100%;
}
.oui-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: stretch;
  min-width: 0;
  max-width: 100%;
}
.oui-row > * { flex: 1 1 220px; min-width: 0; max-width: 100%; }
/* 内容型组件在 Row 里按内容宽度，不参与拉伸（否则 Badge/Chips/Buttons 会被拉满整行） */
.oui-row > .oui-badge,
.oui-row > .oui-buttons,
.oui-row > .oui-chips,
.oui-row > .oui-text,
.oui-row > .oui-heading,
.oui-row > .oui-code-block,
.oui-row > .oui-divider { flex: 0 1 auto; }

/* ── 卡片 / 标题 / 正文 ─────────────────────────────────────────────── */
.oui-card {
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
}
.oui-card-info { border-left: 3px solid var(--dsw-alias-brand-primary); }
.oui-card-success { border-left: 3px solid var(--dsw-alias-state-success-primary); }
.oui-card-warning { border-left: 3px solid var(--dsw-alias-state-warn-primary); }
.oui-card-danger { border-left: 3px solid var(--dsw-alias-state-error-primary); }
.oui-card-neutral { border-left: 3px solid var(--dsw-alias-border-l2); }
.oui-card-title { font-size: 15px; line-height: 22px; font-weight: 600; }
.oui-heading { font-weight: 600; margin: 0; min-width: 0; }
.oui-heading-1 { font-size: 22px; line-height: 30px; }
.oui-heading-2 { font-size: 18px; line-height: 26px; }
.oui-heading-3 { font-size: 15px; line-height: 22px; }
.oui-text { white-space: pre-wrap; word-break: break-word; min-width: 0; }
.oui-text-default { color: var(--dsw-alias-label-primary); }
.oui-text-muted { color: var(--dsw-alias-label-secondary); }
.oui-text-strong { font-weight: 600; }
.oui-divider {
  height: 1px;
  margin: 2px 0;
  background: var(--dsw-alias-border-l1);
  flex: 0 0 auto;
}
.oui-callout {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-left-width: 3px;
  background: var(--dsw-alias-bg-layer-2);
  min-width: 0;
}
.oui-callout-title { font-size: 13px; line-height: 20px; font-weight: 600; }
.oui-callout-text { white-space: pre-wrap; word-break: break-word; }
.oui-callout-info { border-left-color: var(--dsw-alias-brand-primary); }
.oui-callout-info .oui-callout-title { color: var(--dsw-alias-brand-primary); }
.oui-callout-success { border-left-color: var(--dsw-alias-state-success-primary); }
.oui-callout-success .oui-callout-title { color: var(--dsw-alias-state-success-primary); }
.oui-callout-warning { border-left-color: var(--dsw-alias-state-warn-primary); }
.oui-callout-warning .oui-callout-title { color: var(--dsw-alias-state-warn-primary); }
.oui-callout-danger { border-left-color: var(--dsw-alias-state-error-primary); }
.oui-callout-danger .oui-callout-title { color: var(--dsw-alias-state-error-primary); }
.oui-callout-neutral { border-left-color: var(--dsw-alias-border-l2); }
.oui-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  align-self: flex-start;
}
.oui-badge-info { color: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.oui-badge-success { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.oui-badge-warning { color: var(--dsw-alias-state-warn-primary); border-color: var(--dsw-alias-state-warn-primary); }
.oui-badge-danger { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }
.oui-badge-neutral { color: var(--dsw-alias-label-secondary); border-color: var(--dsw-alias-border-l2); }
.oui-code-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
}
.oui-code-lang {
  font-size: 11px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary);
}
.oui-code {
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-specific-sidebar-fill);
  overflow-x: auto;
  max-width: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 20px;
  white-space: pre;
  color: var(--dsw-alias-label-primary);
}
.oui-fallback {
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
  min-width: 0;
}
.oui-unknown {
  color: var(--dsw-alias-state-warn-primary);
  font-size: 12px;
  line-height: 18px;
  min-width: 0;
}

/* ── 数据：Stat / Table / Chart ─────────────────────────────────────── */
.oui-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  min-width: 0;
}
.oui-stat-label { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-stat-value { font-size: 22px; line-height: 30px; font-weight: 600; }
.oui-stat-hint { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-stat-value, .oui-table td, .oui-table th, .oui-field-value, .oui-chart-svg text { font-variant-numeric: tabular-nums; }
.oui-table-wrap { display: flex; flex-direction: column; gap: 6px; min-width: 0; max-width: 100%; }
.oui-table-scroll {
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
}
.oui-table { border-collapse: collapse; width: 100%; font-size: 13px; line-height: 20px; }
.oui-table-caption {
  caption-side: top;
  padding: 10px 12px 6px;
  text-align: left;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
}
.oui-table th,
.oui-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  text-align: left;
  white-space: nowrap;
}
.oui-table th {
  font-weight: 600;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}
.oui-table tbody tr:last-child td { border-bottom: none; }
.oui-table-note { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
}
.oui-chart-title { font-weight: 600; font-size: 14px; line-height: 22px; }
.oui-chart-body { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.oui-chart-svg { display: block; width: 100%; height: auto; max-width: 100%; }
.oui-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
  min-width: 0;
}
.oui-legend-item { display: inline-flex; align-items: center; gap: 6px; min-width: 0; max-width: 100%; }
.oui-legend-swatch { width: 10px; height: 10px; border-radius: 3px; flex: 0 0 auto; }
.oui-legend-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

/* ── Timeline / List ────────────────────────────────────────────────── */
.oui-timeline { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.oui-timeline-title { font-weight: 600; margin-bottom: 4px; }
.oui-timeline-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; min-width: 0; }
.oui-timeline-item {
  position: relative;
  display: flex;
  gap: 10px;
  padding: 6px 0 10px 20px;
  min-width: 0;
}
.oui-timeline-item::before {
  content: "";
  position: absolute;
  left: 5px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--dsw-alias-border-l1);
}
.oui-timeline-item:first-child::before { top: 12px; }
.oui-timeline-item:last-child::before { bottom: auto; height: 12px; }
.oui-timeline-dot {
  position: absolute;
  left: 0;
  top: 9px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--dsw-alias-state-idle-primary);
  border: 2px solid var(--dsw-alias-bg-base);
}
.oui-timeline-dot-info { background: var(--dsw-alias-brand-primary); }
.oui-timeline-dot-success { background: var(--dsw-alias-state-success-primary); }
.oui-timeline-dot-warning { background: var(--dsw-alias-state-warn-primary); }
.oui-timeline-dot-danger { background: var(--dsw-alias-state-error-primary); }
.oui-timeline-dot-neutral { background: var(--dsw-alias-state-idle-primary); }
.oui-timeline-time {
  flex: 0 0 auto;
  min-width: 52px;
  font-size: 12px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
}
.oui-timeline-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.oui-timeline-item-title { font-weight: 600; }
.oui-timeline-detail {
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}
.oui-list { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.oui-list-title { font-weight: 600; }
.oui-list-items { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oui-list-items li { word-break: break-word; }

/* ── 步骤 / 进度 / 折叠 ────────────────────────────────────────────── */
.oui-steps { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.oui-steps-title, .oui-progress-title, .oui-accordion-title { font-weight: 600; }
.oui-step-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; min-width: 0; }
.oui-step { position: relative; display: flex; gap: 10px; padding: 0 0 14px 0; min-width: 0; }
.oui-step:last-child { padding-bottom: 0; }
.oui-step::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 26px;
  bottom: 0;
  width: 1px;
  background: var(--dsw-alias-border-l1);
}
.oui-step:last-child::before { display: none; }
.oui-step-index {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
}
.oui-step-done .oui-step-index { background: var(--dsw-alias-state-success-primary); border-color: transparent; color: var(--dsw-alias-bg-base); }
.oui-step-active .oui-step-index { background: var(--dsw-alias-brand-primary); border-color: transparent; color: var(--dsw-alias-bg-base); }
.oui-step-warning .oui-step-index { background: var(--dsw-alias-state-warn-primary); border-color: transparent; color: var(--dsw-alias-bg-base); }
.oui-step-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; padding-top: 2px; }
.oui-step-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; min-width: 0; }
.oui-step-title { font-weight: 600; min-width: 0; }
.oui-step-status { flex: 0 0 auto; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); }
.oui-step-active .oui-step-status { color: var(--dsw-alias-brand-primary); }
.oui-step-done .oui-step-status { color: var(--dsw-alias-state-success-primary); }
.oui-step-warning .oui-step-status { color: var(--dsw-alias-state-warn-primary); }
.oui-step-detail { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }

.oui-progress { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.oui-progress-item { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oui-progress-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 12px; line-height: 18px; }
.oui-progress-label { color: var(--dsw-alias-label-secondary); min-width: 0; }
.oui-progress-value { color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; flex: 0 0 auto; }
.oui-progress-track { height: 8px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; }
.oui-progress-fill { display: block; height: 100%; border-radius: 999px; background-image: linear-gradient(90deg, var(--oui-action, var(--dsw-alias-brand-primary)), var(--dsw-alias-label-secondary)); }
.oui-progress-success { background-image: linear-gradient(90deg, var(--dsw-alias-state-success-primary), var(--dsw-alias-label-secondary)); }
.oui-progress-warning { background-image: linear-gradient(90deg, var(--dsw-alias-state-warn-primary), var(--dsw-alias-label-secondary)); }
.oui-progress-danger { background-image: linear-gradient(90deg, var(--dsw-alias-state-error-primary), var(--dsw-alias-label-secondary)); }

.oui-accordion { display: flex; flex-direction: column; min-width: 0; border-top: 1px solid var(--dsw-alias-border-l1); }
.oui-accordion-item { border-bottom: 1px solid var(--dsw-alias-border-l1); min-width: 0; }
.oui-accordion-trigger {
  appearance: none;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.oui-accordion-trigger:hover { color: var(--dsw-alias-brand-primary); }
.oui-accordion-label { font-weight: 600; min-width: 0; }
.oui-accordion-caret { color: var(--dsw-alias-label-secondary); font-size: 18px; line-height: 1; flex: 0 0 auto; }
.oui-accordion-panel { padding: 0 0 12px 0; display: flex; flex-direction: column; gap: 8px; min-width: 0; }

/* ── 媒体：Image / Gallery / Map ────────────────────────────────────── */
.oui-media { margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; max-width: 100%; }
.oui-media-frame {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  max-width: 100%;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
}
.oui-media-img { display: block; width: 100%; max-width: 100%; height: auto; object-fit: cover; }
.oui-media-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}
.oui-media-placeholder {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 18px 12px;
  border-radius: 12px;
  border: 1px dashed var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
  text-align: center;
  min-width: 0;
}
.oui-media-placeholder-text { font-weight: 600; }
.oui-media-placeholder-hint { font-size: 12px; line-height: 18px; }
.oui-media-caption { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); word-break: break-word; }
.oui-media-compact .oui-media-frame { min-height: 90px; }
.oui-media-compact .oui-media-caption { font-size: 11px; line-height: 16px; }
.oui-gallery { display: flex; flex-direction: column; gap: 8px; min-width: 0; max-width: 100%; }
.oui-gallery-title { font-weight: 600; }
.oui-gallery-grid { display: grid; gap: 8px; min-width: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.oui-gallery-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.oui-gallery-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.oui-gallery-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.oui-gallery-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.oui-map { display: flex; flex-direction: column; gap: 6px; min-width: 0; max-width: 100%; }
.oui-map-title { font-weight: 600; }
.oui-map-canvas {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
}
.oui-map-tiles {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
}
.oui-map-tile { display: block; width: 100%; height: 100%; object-fit: cover; user-select: none; pointer-events: none; }
.oui-map-tile-missing { background: var(--dsw-alias-bg-layer-2); }
.oui-map-grid {
  position: absolute;
  inset: 0;
  background-color: var(--dsw-alias-bg-layer-1);
  background-image:
    linear-gradient(to right, var(--dsw-alias-border-l1) 1px, transparent 1px),
    linear-gradient(to bottom, var(--dsw-alias-border-l1) 1px, transparent 1px);
  background-size: 40px 40px;
}
.oui-map-route,
.oui-map-markers {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.oui-map-labels { position: absolute; inset: 0; pointer-events: none; }
.oui-map-label {
  position: absolute;
  transform: translate(-50%, 10px);
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-size: 11px;
  line-height: 16px;
}
.oui-map-badge {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
}
.oui-map-attr {
  position: absolute;
  right: 6px;
  bottom: 4px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 14px;
  text-decoration: none;
}
.oui-map-note { margin: 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }

/* ── 交互：Tabs / Form / Buttons / Chips ────────────────────────────── */
.oui-tabs { display: flex; flex-direction: column; gap: 10px; min-width: 0; max-width: 100%; }
.oui-tabs-title { font-weight: 600; }
.oui-tablist {
  display: flex;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.oui-tab {
  appearance: none;
  flex: 0 0 auto;
  margin-bottom: -1px;
  padding: 7px 10px;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 8px 8px 0 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}
.oui-tab:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.oui-tab-active { color: var(--dsw-alias-brand-primary); border-bottom-color: var(--dsw-alias-brand-primary); font-weight: 600; }
.oui-tabpanel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
  border-radius: 8px;
}
.oui-form { display: flex; flex-direction: column; gap: 10px; min-width: 0; max-width: 100%; }
.oui-form-title { font-weight: 600; }
.oui-form-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.oui-form-grid {
  display: grid;
  gap: 10px 12px;
  min-width: 0;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}
.oui-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oui-field-text { min-width: 0; }
.oui-field-label { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-field-input,
.oui-field-select,
.oui-field-textarea {
  width: 100%;
  min-width: 0;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  padding: 7px 8px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
}
.oui-field-textarea { min-height: 84px; resize: vertical; }
.oui-field-radio { display: flex; flex-wrap: wrap; gap: 8px 14px; min-width: 0; }
.oui-radio-option { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; line-height: 20px; min-width: 0; }
.oui-radio-option input { accent-color: var(--dsw-alias-brand-primary); width: 16px; height: 16px; flex: 0 0 auto; }
.oui-field-switch {
  appearance: none;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
  position: relative;
  cursor: pointer;
  flex: 0 0 auto;
  transition: background-color 180ms ease, border-color 180ms ease;
}
.oui-field-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  transition: transform 180ms ease;
}
.oui-field-switch:checked { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.oui-field-switch:checked::after { transform: translateX(16px); }
.oui-field-input::placeholder, .oui-field-textarea::placeholder { color: var(--dsw-alias-label-secondary); }
.oui-field-slider-wrap { display: flex; align-items: center; gap: 8px; min-width: 0; }
.oui-field-slider { flex: 1 1 auto; min-width: 0; accent-color: var(--dsw-alias-brand-primary); }
.oui-field-value { flex: 0 0 auto; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.oui-field-checkbox-field { justify-content: flex-end; }
.oui-field-checkbox-label { display: flex; align-items: center; gap: 8px; min-height: 34px; font-size: 13px; line-height: 20px; }
.oui-field-checkbox { width: 16px; height: 16px; flex: 0 0 auto; accent-color: var(--dsw-alias-brand-primary); }
.oui-form-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; min-width: 0; }
.oui-form-notice { font-size: 12px; line-height: 18px; color: var(--dsw-alias-state-warn-primary); }
.oui-buttons { display: flex; flex-direction: column; gap: 8px; min-width: 0; max-width: 100%; }
.oui-buttons-title { font-weight: 600; }
.oui-buttons-row { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.oui-button {
  appearance: none;
  max-width: 100%;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.oui-button:hover { background: var(--dsw-alias-bg-layer-2); }
.oui-button-primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }
.oui-button-primary:hover { background: var(--dsw-alias-brand-primary); opacity: 0.9; }
.oui-button-info { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.oui-button-success { border-color: var(--dsw-alias-state-success-primary); color: var(--dsw-alias-state-success-primary); }
.oui-button-warning { border-color: var(--dsw-alias-state-warn-primary); color: var(--dsw-alias-state-warn-primary); }
.oui-button-danger { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.oui-button-neutral { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }
.oui-button-chosen { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-2); }
.oui-button:disabled,
.oui-button[aria-disabled="true"] { cursor: not-allowed; opacity: 0.55; }
.oui-chips { display: flex; flex-direction: column; gap: 8px; min-width: 0; max-width: 100%; }
.oui-chips-title { font-weight: 600; }
.oui-chips-row { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.oui-chip {
  appearance: none;
  max-width: 100%;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.oui-chip:hover { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.oui-chip-chosen { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); font-weight: 600; }
.oui-chip:disabled,
.oui-chip[aria-disabled="true"] { cursor: not-allowed; opacity: 0.55; }

/* ── 焦点可见（键盘可达）────────────────────────────────────────────── */
.oui-root :focus-visible {
  outline: 3px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.oui-root a:focus-visible,
.oui-root button:focus-visible,
.oui-root input:focus-visible,
.oui-root select:focus-visible,
.oui-root [tabindex]:focus-visible {
  outline: 3px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.oui-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* ── 流式骨架与空态（client-entry 使用）────────────────────────────── */
.oui-skeleton { display: flex; flex-direction: column; gap: 10px; padding: 6px 0; }
.oui-skeleton-row {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--dsw-alias-bg-layer-2), var(--dsw-alias-bg-layer-1), var(--dsw-alias-bg-layer-2));
  background-size: 200% 100%;
  animation: oui-shimmer 1.4s ease-in-out infinite;
}
@keyframes oui-shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
.oui-empty {
  border: 1px dashed var(--dsw-alias-border-l2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.oui-empty-title { font-weight: 600; }
.oui-empty-hint { color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 20px; }
.oui-stream-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}
.oui-stream-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dsw-alias-brand-primary);
  animation: oui-pulse 1.1s ease-in-out infinite;
}
@keyframes oui-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

/* ── 窄屏（390px）与动效降级 ───────────────────────────────────────── */
@media (max-width: 480px) {
  .oui-row > * { flex-basis: 100%; }
  .oui-row > .oui-badge,
  .oui-row > .oui-buttons,
  .oui-row > .oui-chips,
  .oui-row > .oui-text,
  .oui-row > .oui-heading,
  .oui-row > .oui-code-block,
  .oui-row > .oui-divider { flex-basis: auto; }
  .oui-card { padding: 12px; }
  .oui-form-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .oui-gallery-cols-3,
  .oui-gallery-cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .oui-chart-legend { gap: 2px 10px; }
  .oui-legend-text { max-width: 140px; }
}

.oui-turn-card {
  margin: 8px 0 2px;
  min-width: 0;
  max-width: 100%;
}

/* ── 纸上玻璃 Paper Glass v1.0 适配层（2026-10-18） ─────────────────────
 * 结构色全部来自宿主 dsw-alias；渐变只用品牌色与语义色 color-mix 派生。
 * 原则：玻璃只做控制层（按钮/标签/工具条），内容卡保持标准表面。
 */
.oui-root {
  --oui-surface: var(--dsw-alias-bg-layer-1);
  --oui-ink: var(--dsw-alias-label-primary);
  --oui-muted: var(--dsw-alias-label-secondary);
  --oui-line: var(--dsw-alias-border-l1);
  --oui-action: var(--dsw-alias-brand-primary);
  --oui-success: var(--dsw-alias-state-success-primary);
  --oui-warning: var(--dsw-alias-state-warn-primary);
  --oui-danger: var(--dsw-alias-state-error-primary);
  --oui-grad: linear-gradient(135deg, var(--oui-action), color-mix(in srgb, var(--oui-action) 55%, var(--dsw-alias-label-secondary)));
  --oui-grad-soft: linear-gradient(150deg, color-mix(in srgb, var(--oui-action) 12%, transparent), transparent 62%);
  --oui-glass: color-mix(in srgb, var(--oui-surface) 62%, transparent);
}
.oui-card {
  background-color: var(--oui-surface);
  border: 1px solid var(--oui-line);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--oui-ink) 6%, transparent);
}
.oui-button {
  border-radius: 8px;
  background-color: var(--oui-glass);
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  backdrop-filter: blur(16px) saturate(170%);
  border: 1px solid var(--oui-line);
}
.oui-button-primary {
  background-color: transparent;
  background-image: var(--oui-grad);
  border-color: transparent;
  color: var(--dsw-alias-bg-base);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--oui-surface) 35%, transparent);
}
.oui-button-primary:hover { filter: brightness(1.06); }
.oui-chip-chosen,
.oui-tab-chosen {
  background-image: linear-gradient(120deg, color-mix(in srgb, var(--oui-action) 22%, transparent), color-mix(in srgb, var(--oui-danger) 14%, transparent));
  border-color: color-mix(in srgb, var(--oui-action) 38%, transparent);
}
.oui-badge {
  border-radius: 999px;
  background-color: color-mix(in srgb, currentColor 8%, var(--oui-surface));
}
.oui-callout { border-radius: 12px; }
.oui-callout-info { background-color: color-mix(in srgb, var(--oui-action) 8%, var(--oui-surface)); }
.oui-callout-success { background-color: color-mix(in srgb, var(--oui-success) 8%, var(--oui-surface)); }
.oui-callout-warning { background-color: color-mix(in srgb, var(--oui-warning) 10%, var(--oui-surface)); }
.oui-callout-danger { background-color: color-mix(in srgb, var(--oui-danger) 8%, var(--oui-surface)); }
.oui-segmented, .oui-tablist { background-color: var(--oui-glass); -webkit-backdrop-filter: blur(18px) saturate(175%); backdrop-filter: blur(18px) saturate(175%); }
.oui-input, .oui-textarea, .oui-select { background-color: color-mix(in srgb, var(--oui-surface) 82%, transparent); }
.oui-stat-value {
  background-image: var(--oui-grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.oui-chart-title, .oui-card-title { letter-spacing: 0; }
@media (prefers-reduced-transparency: reduce) {
  .oui-button, .oui-segmented, .oui-tablist { -webkit-backdrop-filter: none; backdrop-filter: none; background-color: var(--dsw-alias-bg-layer-1); }
}
[data-transparency="reduced"] .oui-button,
[data-transparency="reduced"] .oui-segmented,
[data-transparency="reduced"] .oui-tablist {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  background-color: var(--dsw-alias-bg-layer-1);
}
@media (prefers-contrast: more) {
  .oui-card, .oui-stat, .oui-callout, .oui-field-input, .oui-field-select { border-color: var(--dsw-alias-label-secondary); }
  .oui-text-muted, .oui-stat-label, .oui-stat-hint, .oui-media-caption { color: var(--dsw-alias-label-primary); }
}
[data-contrast="high"] .oui-card,
[data-contrast="high"] .oui-stat,
[data-contrast="high"] .oui-callout,
[data-contrast="high"] .oui-field-input,
[data-contrast="high"] .oui-field-select { border-color: var(--dsw-alias-label-secondary); }
[data-contrast="high"] .oui-text-muted,
[data-contrast="high"] .oui-stat-label,
[data-contrast="high"] .oui-stat-hint,
[data-contrast="high"] .oui-media-caption { color: var(--dsw-alias-label-primary); }

@media (prefers-reduced-motion: reduce) {
  .oui-skeleton-row,
  .oui-stream-dot { animation: none; }
  .oui-button,
  .oui-chip,
  .oui-tab { transition: none; }
}
`;
