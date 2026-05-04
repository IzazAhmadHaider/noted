"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare,
  Quote, Code2, Minus,
  Undo2, Redo2,
  Baseline, Highlighter,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────── */
const S = `
  .tb {
    display: flex;
    align-items: center;
    gap: 1px;
    overflow-x: auto;
    scrollbar-width: none;
    padding: 1px 0;
    flex-wrap: nowrap;
  }
  .tb::-webkit-scrollbar { display: none; }

  .tb-group {
    display: flex;
    align-items: center;
    gap: 1px;
    flex-shrink: 0;
  }

  /* Divider */
  .tb-div {
    width: 1px;
    height: 16px;
    background: var(--border);
    margin: 0 6px;
    border-radius: 1px;
    flex-shrink: 0;
  }

  /* Button */
  .tb-b {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 7px;
    border: none;
    background: transparent;
    color: var(--text-faint);
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    transition: background 0.11s ease, color 0.11s ease, transform 0.09s ease;
    outline: none;
  }
  .tb-b:hover:not(:disabled) {
    background: var(--surface-2);
    color: var(--text);
    transform: scale(1.07);
  }
  .tb-b:active:not(:disabled) { transform: scale(0.91); }
  .tb-b.on {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .tb-b.on:hover {
    background: var(--accent-soft);
    color: var(--accent-hover);
  }
  .tb-b:disabled {
    opacity: 0.22;
    cursor: default;
    pointer-events: none;
  }
  .tb-b:focus-visible {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 50%, transparent);
  }

  /* Tooltip */
  .tb-b::after, .tb-cs::after {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 9px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    opacity: 0;
    pointer-events: none;
    background: var(--surface-2);
    border: 1px solid var(--border2);
    color: var(--text-soft);
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.05em;
    white-space: nowrap;
    padding: 4px 8px;
    border-radius: 5px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.45);
    transition: opacity 0.12s ease, transform 0.12s ease;
    z-index: 999;
  }
  .tb-b:hover::after, .tb-cs:hover::after {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* Color swatch button */
  .tb-cs {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 32px;
    height: 32px;
    border-radius: 7px;
    border: none;
    background: transparent;
    color: var(--text-faint);
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    transition: background 0.11s ease, color 0.11s ease, transform 0.09s ease;
    outline: none;
  }
  .tb-cs:hover {
    background: var(--surface-2);
    color: var(--text);
    transform: scale(1.07);
  }
  .tb-cs:active { transform: scale(0.91); }
  .tb-cs:focus-visible { box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 50%, transparent); }

  .tb-cs-bar {
    width: 14px;
    height: 3px;
    border-radius: 2px;
    transition: background 0.18s ease;
    flex-shrink: 0;
  }

  /* Dropdown panel */
  .tb-panel {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    z-index: 500;
    box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
    min-width: 230px;
    animation: tb-pop 0.14s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes tb-pop {
    from { opacity: 0; transform: translateX(-50%) scale(0.94) translateY(-4px); }
    to   { opacity: 1; transform: translateX(-50%) scale(1)    translateY(0); }
  }
  .tb-panel-label {
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-faint);
    margin-bottom: 9px;
    padding: 0 1px;
  }
  .tb-grid {
    display: grid;
    grid-template-columns: repeat(10, 18px);
    gap: 4px;
  }
  .tb-dot {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    cursor: pointer;
    border: 1.5px solid rgba(255,255,255,0.04);
    transition: transform 0.1s ease, box-shadow 0.1s ease;
    flex-shrink: 0;
  }
  .tb-dot:hover { transform: scale(1.22); }
  .tb-dot.sel { box-shadow: 0 0 0 2px var(--accent); }
  .tb-custom {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }
  .tb-custom input[type="color"] {
    width: 34px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--border2);
    border-radius: 7px;
    background: transparent;
    cursor: pointer;
  }
  .tb-custom input[type="text"] {
    min-width: 0;
    flex: 1;
    height: 28px;
    border: 1px solid var(--border);
    border-radius: 7px;
    background: var(--surface-2);
    color: var(--text);
    padding: 0 8px;
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 10px;
    outline: none;
  }
`;

const TEXT_COLORS = [
  "#111827", "#374151", "#6b7280", "#9ca3af", "#ffffff",
  "#991b1b", "#dc2626", "#f97316", "#ca8a04", "#eab308",
  "#166534", "#16a34a", "#0f766e", "#14b8a6", "#0891b2",
  "#1d4ed8", "#2563eb", "#4f46e5", "#7c3aed", "#a855f7",
  "#be185d", "#e11d48", "#f43f5e", "#fb7185", "#f9a8d4",
  "#256f68", "#d6bd6a", "#7dd3c8", "#7db8f7", "#c77dda",
  "#191714", "#5f5a50", "#918878", "#eeeae1", "#000000",
];
const HIGHLIGHT_COLORS = [
  "#fef08a", "#fde68a", "#fed7aa", "#fecaca", "#fbcfe8",
  "#e9d5ff", "#ddd6fe", "#c7d2fe", "#bfdbfe", "#bae6fd",
  "#a5f3fc", "#99f6e4", "#bbf7d0", "#d9f99d", "#fef3c7",
  "#fde047", "#facc15", "#fb923c", "#f87171", "#f472b6",
  "#c084fc", "#818cf8", "#60a5fa", "#22d3ee", "#2dd4bf",
  "#4ade80", "#a3e635", "#d6bd6a", "#7dd3c8", "#7db8f7",
  "#f47a7a", "#f7a96b", "#6bcb77", "#a0c4ff", "#ffc6ff",
];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */
function Btn({ icon, tip, on = false, off = false, onClick }: {
  icon: React.ReactNode; tip: string;
  on?: boolean; off?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`tb-b${on ? " on" : ""}`}
      data-tip={tip}
      disabled={off}
      onClick={onClick}
      aria-label={tip}
      aria-pressed={on}
    >
      {icon}
    </button>
  );
}

function Div() { return <div className="tb-div" aria-hidden />; }

function ColorBtn({ icon, tip, label, colors, active, bar, onChange }: {
  icon: React.ReactNode; tip: string; label: string;
  colors: string[]; active: string; bar: string;
  onChange: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(
    HEX_COLOR.test(active) ? active : colors[0],
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const selectColor = (color: string) => {
    onChange(color);
    if (HEX_COLOR.test(color)) setCustomColor(color);
  };

  return (
    <div style={{ position: "relative", flexShrink: 0 }} ref={ref}>
      <button
        type="button"
        className="tb-cs"
        data-tip={tip}
        onClick={() => setOpen(v => !v)}
        aria-label={tip}
        aria-expanded={open}
      >
        {icon}
        <div className="tb-cs-bar" style={{ background: bar }} />
      </button>
      {open && (
        <div className="tb-panel" role="dialog" aria-label={label}>
          <div className="tb-panel-label">{label}</div>
          <div className="tb-grid">
            {colors.map(c => (
              <button
                type="button"
                key={c}
                className={`tb-dot${active === c ? " sel" : ""}`}
                style={{ background: c }}
                title={c}
                aria-label={`${label} ${c}`}
                onClick={() => { selectColor(c); setOpen(false); }}
              />
            ))}
          </div>
          <div className="tb-custom">
            <input
              type="color"
              value={customColor}
              aria-label={`Custom ${label.toLowerCase()}`}
              onChange={(e) => {
                setCustomColor(e.target.value);
                selectColor(e.target.value);
              }}
            />
            <input
              type="text"
              value={customColor}
              aria-label={`${label} hex value`}
              onChange={(e) => {
                const next = e.target.value;
                setCustomColor(next);
                if (HEX_COLOR.test(next)) selectColor(next);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && HEX_COLOR.test(customColor)) {
                  selectColor(customColor);
                  setOpen(false);
                }
              }}
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
type EditorToolbarProps = {
  canBold: boolean; canItalic: boolean; canUnderline: boolean; canStrike: boolean;
  canHeading1: boolean; canHeading2: boolean; canHeading3: boolean;
  canBulletList: boolean; canOrderedList: boolean; canTaskList: boolean;
  canBlockquote: boolean; canCodeBlock: boolean; canHorizontalRule: boolean;
  canUndo: boolean; canRedo: boolean;
  isBold: boolean; isItalic: boolean; isUnderline: boolean; isStrike: boolean;
  isHeading1: boolean; isHeading2: boolean; isHeading3: boolean;
  isBulletList: boolean; isOrderedList: boolean; isTaskList: boolean;
  isBlockquote: boolean; isCodeBlock: boolean;
  onBold: () => void; onItalic: () => void; onUnderline: () => void; onStrike: () => void;
  onHeading1: () => void; onHeading2: () => void; onHeading3: () => void;
  onBulletList: () => void; onOrderedList: () => void; onTaskList: () => void;
  onBlockquote: () => void; onCodeBlock: () => void; onHorizontalRule: () => void;
  onUndo: () => void; onRedo: () => void;
  onTextColor: (color: string) => void;
  onHighlightColor: (color: string) => void;
};

/* ─────────────────────────────────────────────────────────
   EditorToolbar
───────────────────────────────────────────────────────── */
export function EditorToolbar(p: EditorToolbarProps) {
  const sz = 14;
  const [textColor,    setTextColor]    = useState(TEXT_COLORS[0]);
  const [hlColor,      setHlColor]      = useState(HIGHLIGHT_COLORS[0]);

  return (
    <>
      <style>{S}</style>
      <div className="tb" role="toolbar" aria-label="Formatting">

        {/* History */}
        <div className="tb-group">
          <Btn icon={<Undo2 size={sz}/>}  tip="Undo" off={!p.canUndo} onClick={p.onUndo}/>
          <Btn icon={<Redo2 size={sz}/>}  tip="Redo" off={!p.canRedo} onClick={p.onRedo}/>
        </div>

        <Div/>

        {/* Headings */}
        <div className="tb-group">
          <Btn icon={<Heading1 size={sz}/>} tip="Heading 1" on={p.isHeading1} off={!p.canHeading1} onClick={p.onHeading1}/>
          <Btn icon={<Heading2 size={sz}/>} tip="Heading 2" on={p.isHeading2} off={!p.canHeading2} onClick={p.onHeading2}/>
          <Btn icon={<Heading3 size={sz}/>} tip="Heading 3" on={p.isHeading3} off={!p.canHeading3} onClick={p.onHeading3}/>
        </div>

        <Div/>

        {/* Inline marks */}
        <div className="tb-group">
          <Btn icon={<Bold         size={sz}/>} tip="Bold"          on={p.isBold}      off={!p.canBold}      onClick={p.onBold}/>
          <Btn icon={<Italic       size={sz}/>} tip="Italic"        on={p.isItalic}    off={!p.canItalic}    onClick={p.onItalic}/>
          <Btn icon={<Underline    size={sz}/>} tip="Underline"     on={p.isUnderline} off={!p.canUnderline} onClick={p.onUnderline}/>
          <Btn icon={<Strikethrough size={sz}/>} tip="Strikethrough" on={p.isStrike}   off={!p.canStrike}    onClick={p.onStrike}/>
        </div>

        <Div/>

        {/* Color */}
        <div className="tb-group">
          <ColorBtn
            icon={<Baseline size={sz}/>}
            tip="Text color" label="Text color"
            colors={TEXT_COLORS} active={textColor} bar={textColor}
            onChange={c => { setTextColor(c); p.onTextColor(c); }}
          />
          <ColorBtn
            icon={<Highlighter size={sz}/>}
            tip="Highlight" label="Highlight"
            colors={HIGHLIGHT_COLORS} active={hlColor} bar={hlColor}
            onChange={c => { setHlColor(c); p.onHighlightColor(c); }}
          />
        </div>

        <Div/>

        {/* Lists */}
        <div className="tb-group">
          <Btn icon={<List         size={sz}/>} tip="Bullet list"   on={p.isBulletList}  off={!p.canBulletList}  onClick={p.onBulletList}/>
          <Btn icon={<ListOrdered  size={sz}/>} tip="Numbered list" on={p.isOrderedList} off={!p.canOrderedList} onClick={p.onOrderedList}/>
          <Btn icon={<CheckSquare  size={sz}/>} tip="Task list"     on={p.isTaskList}    off={!p.canTaskList}    onClick={p.onTaskList}/>
        </div>

        <Div/>

        {/* Blocks */}
        <div className="tb-group">
          <Btn icon={<Quote  size={sz}/>} tip="Blockquote" on={p.isBlockquote} off={!p.canBlockquote} onClick={p.onBlockquote}/>
          <Btn icon={<Code2  size={sz}/>} tip="Code block" on={p.isCodeBlock}  off={!p.canCodeBlock}  onClick={p.onCodeBlock}/>
          <Btn icon={<Minus  size={sz}/>} tip="Divider"                        off={!p.canHorizontalRule} onClick={p.onHorizontalRule}/>
        </div>

      </div>
    </>
  );
}
