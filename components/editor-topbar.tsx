"use client";

import { IconLock, IconUnlock } from "./note-icons";

type EditorTopbarProps = {
  pageTitle: string;
  isEditMode: boolean;
  isSaving: boolean;
  wordCount: number;
  onToggleEdit: () => void;
};

export function EditorTopbar({
  pageTitle,
  isEditMode,
  isSaving,
  wordCount,
  onToggleEdit,
}: EditorTopbarProps) {
  return (
    <div className="flex flex-col shrink-0">
      {/* Main topbar row */}
      <div className="h-[52px] flex items-center justify-between px-7 border-b border-[#2a2a26] gap-4">
        {/* Page title */}
        <span className="font-['Instrument_Serif'] text-[1.05rem] text-[#e8e6e0] flex-1 truncate">
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
              ? "bg-[#c8b97a] border-[#c8b97a] text-[#0f0f0d] font-medium shadow-[0_0_12px_rgba(200,185,122,0.2)]"
              : "bg-transparent border-[#333330] text-[#8a8880] hover:border-[#8a8880] hover:text-[#e8e6e0]",
          ].join(" ")}
        >
          {isEditMode ? (
            <>
              <IconUnlock size={13} />
              <span>Unlocked</span>
            </>
          ) : (
            <>
              <IconLock size={13} />
              <span>Locked</span>
            </>
          )}
        </button>
      </div>

      {/* Status bar sits below topbar */}
      <div className="h-8 flex items-center justify-between px-7 border-b border-[#2a2a26]">
        <div className="flex items-center gap-2 text-[0.62rem] text-[#4a4a46] tracking-widest uppercase">
          {/* Save indicator */}
          <span
            className={[
              "block transition-all duration-300",
              isSaving
                ? "w-1.5 h-1.5 rounded-sm bg-[#c8b97a] animate-spin"
                : "w-1.25 h-1.25 rounded-full bg-[#4a4a46]",
            ].join(" ")}
          />
          {isSaving ? "Saving…" : "Saved"}
        </div>

        <div className="flex items-center gap-3 text-[0.62rem] text-[#4a4a46] tracking-[0.08em]">
          {/* Edit mode badge */}
          {isEditMode && (
            <span className="text-[#c8b97a] tracking-widest uppercase text-[0.58rem] animate-[fadeIn_0.2s_ease_both]">
              editing
            </span>
          )}
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
        </div>
      </div>
    </div>
  );
}