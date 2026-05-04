"use client";

import { Menu } from "lucide-react";
import { IconLock, IconUnlock } from "./note-icons";

type EditorTopbarProps = {
  pageTitle: string;
  isEditMode: boolean;
  isSaving: boolean;
  wordCount: number;
  onToggleEdit: () => void;
  onToggleSidebar?: () => void;
};

export function EditorTopbar({
  pageTitle,
  isEditMode,
  isSaving,
  wordCount,
  onToggleEdit,
  onToggleSidebar,
}: EditorTopbarProps) {
  return (
    <div className="flex flex-col shrink-0">
      {/* Main topbar row */}
      <div className="h-[52px] flex items-center justify-between px-3 sm:px-5 lg:px-7 border-b border-[var(--border)] gap-2 sm:gap-4">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border2)] text-[var(--text-soft)] hover:text-[var(--text)] hover:border-[var(--text-soft)] transition-colors shrink-0"
            aria-label="Open pages"
          >
            <Menu size={15} />
          </button>
        )}

        {/* Page title */}
        <span className="font-['Instrument_Serif'] text-[1.05rem] text-[var(--text)] flex-1 truncate">
          {pageTitle}
        </span>

        {/* Lock / Unlock toggle */}
        <button
          type="button"
          onClick={onToggleEdit}
          title={isEditMode ? "Lock — stop editing" : "Unlock — start editing"}
          className={[
            "flex items-center gap-2 px-3 py-1.5 rounded-md border text-[0.72rem] tracking-[0.04em] font-['Geist_Mono'] transition-all duration-200 shrink-0 cursor-pointer",
            isEditMode
              ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--bg)] font-medium shadow-[0_0_12px_rgba(0,0,0,0.12)]"
              : "bg-transparent border-[var(--border2)] text-[var(--text-soft)] hover:border-[var(--text-soft)] hover:text-[var(--text)]",
          ].join(" ")}
        >
          {isEditMode ? (
            <>
              <IconUnlock size={13} />
              <span className="hidden sm:inline">Unlocked</span>
            </>
          ) : (
            <>
              <IconLock size={13} />
              <span className="hidden sm:inline">Locked</span>
            </>
          )}
        </button>
      </div>

      {/* Status bar sits below topbar */}
      <div className="h-8 flex items-center justify-between px-3 sm:px-5 lg:px-7 border-b border-[var(--border)] gap-2">
        <div className="flex items-center gap-2 text-[0.6rem] sm:text-[0.62rem] text-[var(--text-faint)] tracking-widest uppercase">
          {/* Save indicator */}
          <span
            className={[
              "block transition-all duration-300",
              isSaving
                ? "w-1.5 h-1.5 rounded-sm bg-[var(--accent)] animate-spin"
                : "w-1.25 h-1.25 rounded-full bg-[var(--text-faint)]",
            ].join(" ")}
          />
          {isSaving ? "Saving…" : "Saved"}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[0.6rem] sm:text-[0.62rem] text-[var(--text-faint)] tracking-[0.08em]">
          {/* Edit mode badge */}
          {isEditMode && (
            <span className="hidden sm:inline text-[var(--accent)] tracking-widest uppercase text-[0.58rem] animate-[fadeIn_0.2s_ease_both]">
              editing
            </span>
          )}
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
        </div>
      </div>
    </div>
  );
}
