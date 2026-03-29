"use client";

import { StickyNote, STICKY_COLORS } from "./sticky-note-types";

type Props = {
  note: StickyNote;
  x: number;
  y: number;
  onClick: () => void;
};

const STYLES = `
  @keyframes sn-marker-in {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }
  .sn-marker {
    animation: sn-marker-in 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
    cursor: pointer;
    position: absolute;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sn-marker:hover .sn-marker-ring {
    transform: scale(1.35);
  }
  .sn-marker-ring {
    transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
  }
  .sn-marker-preview {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sn-marker:hover .sn-marker-preview {
    opacity: 1;
  }
`;

export function StickyNoteMarker({ note, x, y, onClick }: Props) {
  const c = STICKY_COLORS[note.color];

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="sn-marker"
        style={{ left: x, top: y - 10, width: 18, height: 18 }}
        onClick={onClick}
        title={note.content}
      >
        {/* Outer ring */}
        <div
          className="sn-marker-ring"
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: c.bg,
            border: `2px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 2px 8px ${c.dot}44`,
          }}
        >
          {/* Inner dot */}
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} />
        </div>

        {/* Hover preview tooltip */}
        <div className="sn-marker-preview">
          <span style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 6,
            padding: "3px 8px",
            fontSize: "0.65rem",
            fontFamily: "'Geist Mono', monospace",
            color: c.text,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            {note.content.length > 40 ? note.content.slice(0, 40) + "…" : note.content}
          </span>
        </div>
      </div>
    </>
  );
}
