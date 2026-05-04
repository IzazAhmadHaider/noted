export type StickyNote = {
  id: string;
  pageId: string;
  anchorText: string;       // the selected text this note is pinned to
  content: string;          // the note body
  color: StickyColor;
  from: number;             // ProseMirror pos
  to: number;
  createdAt: string;
};

export type StickyColor = "yellow" | "pink" | "green" | "blue" | "purple";

export const STICKY_COLORS: Record<StickyColor, { bg: string; border: string; dot: string; text: string; highlight: string }> = {
  yellow: { bg: "#fff7c2", border: "#d59e00", dot: "#a86f00", text: "#4a3100", highlight: "rgba(213,158,0,0.28)" },
  pink:   { bg: "#ffe4f1", border: "#c02672", dot: "#a21a5d", text: "#5f1239", highlight: "rgba(192,38,114,0.18)" },
  green:  { bg: "#daf8e2", border: "#168747", dot: "#087336", text: "#073f20", highlight: "rgba(22,135,71,0.18)" },
  blue:   { bg: "#dceeff", border: "#1d6fc2", dot: "#155ea8", text: "#12395f", highlight: "rgba(29,111,194,0.18)" },
  purple: { bg: "#f0e4ff", border: "#7951c8", dot: "#6138b0", text: "#32136e", highlight: "rgba(121,81,200,0.18)" },
};
