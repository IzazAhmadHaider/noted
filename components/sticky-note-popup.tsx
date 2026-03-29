"use client";

import { useEffect, useRef, useState } from "react";
import { StickyNote, StickyColor, STICKY_COLORS } from "./sticky-note-types";

type Props = {
  /** Pixel position relative to the editor scroll container */
  x: number;
  y: number;
  /** When creating a new note — null means we're viewing/editing an existing one */
  draftAnchorText?: string;
  note?: StickyNote;
  onSave: (content: string, color: StickyColor) => void;
  onDelete?: () => void;
  onClose: () => void;
};

const COLORS: StickyColor[] = ["yellow", "pink", "green", "blue", "purple"];

const STYLES = `
  @keyframes sn-pop {
    from { opacity: 0; transform: scale(0.88) translateY(-6px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  @keyframes sn-shake {
    0%,100% { transform: rotate(0deg); }
    25%      { transform: rotate(-1.5deg); }
    75%      { transform: rotate(1.5deg); }
  }
  .sn-card {
    animation: sn-pop 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .sn-tape {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 20px;
    background: rgba(255,255,255,0.55);
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    backdrop-filter: blur(2px);
  }
  .sn-shadow {
    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.22)) drop-shadow(0 2px 6px rgba(0,0,0,0.12));
  }
  .sn-textarea {
    resize: none;
    outline: none;
    background: transparent;
    width: 100%;
    min-height: 80px;
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 0.8rem;
    line-height: 1.65;
    border: none;
    padding: 0;
  }
  .sn-textarea::placeholder { opacity: 0.45; }
  .sn-textarea:focus { outline: none; }
`;

export function StickyNotePopup({ x, y, draftAnchorText, note, onSave, onDelete, onClose }: Props) {
  const [content, setContent] = useState(note?.content ?? "");
  const [color, setColor] = useState<StickyColor>(note?.color ?? "yellow");
  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const c = STICKY_COLORS[color];

  // Focus textarea on mount
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 60);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const anchorLabel = note?.anchorText ?? draftAnchorText ?? "";

  return (
    <>
      <style>{STYLES}</style>

      {/* Connector line from anchor to card */}
      <svg
        style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 39 }}
      >
        <line
          x1={x} y1={y}
          x2={x + 16} y2={y - 16}
          stroke={c.dot}
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.6"
        />
      </svg>

      <div
        ref={ref}
        className="sn-shadow sn-card"
        style={{
          position: "absolute",
          left: x + 12,
          top: y - 180,
          zIndex: 40,
          width: 260,
        }}
      >
        {/* Tape strip */}
        <div className="sn-tape" style={{ background: `${c.border}cc` }} />

        {/* Card body */}
        <div
          style={{
            background: c.bg,
            border: `1.5px solid ${c.border}`,
            borderRadius: 10,
            padding: "1rem",
            position: "relative",
          }}
        >
          {/* Anchor text label */}
          {anchorLabel && (
            <div
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.06em",
                fontFamily: "'Geist Mono', monospace",
                color: c.dot,
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                opacity: 0.8,
              }}
            >
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
              <span
                style={{
                  background: c.highlight,
                  borderRadius: 3,
                  padding: "0 4px",
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                "{anchorLabel.length > 28 ? anchorLabel.slice(0, 28) + "…" : anchorLabel}"
              </span>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="sn-textarea"
            placeholder="Add a note…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ color: c.text }}
          />

          {/* Divider */}
          <div style={{ height: 1, background: c.border, margin: "0.6rem 0", opacity: 0.5 }} />

          {/* Footer: color picker + actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

            {/* Color dots */}
            <div style={{ display: "flex", gap: 5 }}>
              {COLORS.map((col) => {
                const cc = STICKY_COLORS[col];
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    title={col}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: cc.dot,
                      border: color === col ? `2px solid ${c.text}` : "2px solid transparent",
                      cursor: "pointer",
                      padding: 0,
                      outline: "none",
                      transition: "transform 0.1s",
                      transform: color === col ? "scale(1.25)" : "scale(1)",
                    }}
                  />
                );
              })}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 6 }}>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  title="Delete note"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "3px 6px",
                    borderRadius: 5,
                    color: c.dot,
                    opacity: 0.6,
                    fontSize: "0.68rem",
                    fontFamily: "'Geist Mono', monospace",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => { if (content.trim()) onSave(content.trim(), color); else onClose(); }}
                style={{
                  background: c.dot,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "3px 10px",
                  fontSize: "0.68rem",
                  fontFamily: "'Geist Mono', monospace",
                  cursor: "pointer",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
