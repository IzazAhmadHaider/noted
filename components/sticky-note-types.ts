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
  yellow: { bg: "#fefce8", border: "#fde047", dot: "#eab308", text: "#713f12", highlight: "rgba(250,204,21,0.35)" },
  pink:   { bg: "#fdf2f8", border: "#f0abfc", dot: "#d946ef", text: "#701a75", highlight: "rgba(217,70,239,0.2)"  },
  green:  { bg: "#f0fdf4", border: "#86efac", dot: "#22c55e", text: "#14532d", highlight: "rgba(34,197,94,0.2)"  },
  blue:   { bg: "#eff6ff", border: "#93c5fd", dot: "#3b82f6", text: "#1e3a5f", highlight: "rgba(59,130,246,0.2)" },
  purple: { bg: "#faf5ff", border: "#c4b5fd", dot: "#8b5cf6", text: "#3b0764", highlight: "rgba(139,92,246,0.2)" },
};
