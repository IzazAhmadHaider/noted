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
    background: #2a2a26;
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
    color: #4a4a46;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    transition: background 0.11s ease, color 0.11s ease, transform 0.09s ease;
    outline: none;
  }
  .tb-b:hover:not(:disabled) {
    background: #1e1e1b;
    color: #e8e6e0;
    transform: scale(1.07);
  }
  .tb-b:active:not(:disabled) { transform: scale(0.91); }
  .tb-b.on {
    background: rgba(200,185,122,0.14);
    color: #c8b97a;
  }
  .tb-b.on:hover {
    background: rgba(200,185,122,0.22);
    color: #c8b97a;
  }
  .tb-b:disabled {
    opacity: 0.22;
    cursor: default;
    pointer-events: none;
  }
  .tb-b:focus-visible {
    box-shadow: 0 0 0 2px rgba(200,185,122,0.5);
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
    background: #1e1e1b;
    border: 1px solid #333330;
    color: #8a8880;
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
    color: #4a4a46;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    transition: background 0.11s ease, color 0.11s ease, transform 0.09s ease;
    outline: none;
  }
  .tb-cs:hover {
    background: #1e1e1b;
    color: #e8e6e0;
    transform: scale(1.07);
  }
  .tb-cs:active { transform: scale(0.91); }
  .tb-cs:focus-visible { box-shadow: 0 0 0 2px rgba(200,185,122,0.5); }

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
    background: #161614;
    border: 1px solid #2a2a26;
    border-radius: 12px;
    padding: 12px;
    z-index: 500;
    box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
    min-width: 170px;
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
    color: #4a4a46;
    margin-bottom: 9px;
    padding: 0 1px;
  }
  .tb-grid {
    display: grid;
    grid-template-columns: repeat(8, 18px);
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
  .tb-dot.sel { box-shadow: 0 0 0 2px #c8b97a; }
`;

const TEXT_COLORS = [
  "#e8e6e0","#c8b97a","#7dd3c8","#7db8f7",
  "#c77dda","#f47a7a","#f7a96b","#6bcb77",
  "#a0c4ff","#caffbf","#ffd6a5","#ffc6ff",
  "#8a8880","#5a5a56","#ffffff","#000000",
];
const HIGHLIGHT_COLORS = [
  "rgba(200,185,122,0.3)","rgba(125,211,200,0.3)","rgba(125,184,247,0.3)","rgba(199,125,218,0.3)",
  "rgba(244,122,122,0.3)","rgba(247,169,107,0.3)","rgba(107,203,119,0.3)","rgba(160,196,255,0.3)",
  "#c8b97a","#7dd3c8","#7db8f7","#c77dda",
  "#f47a7a","#f7a96b","#6bcb77","#a0c4ff",
];

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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

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
              <div
                key={c}
                className={`tb-dot${active === c ? " sel" : ""}`}
                style={{ background: c }}
                title={c}
                role="button"
                tabIndex={0}
                onClick={() => { onChange(c); setOpen(false); }}
                onKeyDown={e => { if (e.key === "Enter") { onChange(c); setOpen(false); } }}
              />
            ))}
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