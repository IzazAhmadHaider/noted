"use client";

import { useRef } from "react";
import { NotePage } from "./note-editor-types";
import { IconPencil, IconTrash, IconCheck, IconXmark } from "./note-icons";

type PageSidebarProps = {
  pages: NotePage[];
  activePageId: string;
  renamingId: string | null;
  renameValue: string;
  isMobileOpen: boolean;
  onSelectPage: (id: string) => void;
  onCloseMobile: () => void;
  onStartRename: (page: NotePage) => void;
  onCommitRename: (pageId: string) => void;
  onCancelRename: () => void;
  onRenameValueChange: (v: string) => void;
  onConfirmDelete: (page: NotePage) => void;
  onNewPage: () => void;
};

export function PageSidebar({
  pages,
  activePageId,
  renamingId,
  renameValue,
  isMobileOpen,
  onSelectPage,
  onCloseMobile,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onRenameValueChange,
  onConfirmDelete,
  onNewPage,
}: PageSidebarProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside
      className={[
        "bg-[var(--surface)] border-r border-[var(--border)] flex flex-col animate-[slideInLeft_0.5s_cubic-bezier(0.16,1,0.3,1)_both]",
        "absolute inset-y-0 left-0 z-40 w-72 max-w-[84vw] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:relative lg:inset-auto lg:z-auto lg:w-60 lg:max-w-none lg:shrink-0 lg:translate-x-0",
      ].join(" ")}
    >
      {/* Header */}
      <div className="px-5 py-[0.73rem] border-b border-[var(--border)] flex items-center gap-2">
        <span className="w-1.75 h-1.75 rounded-full bg-[var(--accent)] shrink-0 animate-[pulseGlow_2.5s_ease-in-out_infinite]" />
        <span className="font-['Instrument_Serif'] text-[1.3rem] text-[var(--text)] tracking-[0.01em]">
          Notivo
        </span>
      </div>

      {/* Pages label */}
      <p className="text-[0.62rem] tracking-[0.18em] uppercase text-[var(--text-faint)] px-5 pt-4 pb-2">
        Pages · {pages.length}
      </p>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border2)]">
        {pages.map((page) => {
          const isActive = page.id === activePageId;
          const isRenaming = renamingId === page.id;

          return (
            <div
              key={page.id}
              onClick={() => {
                if (!isRenaming) {
                  onSelectPage(page.id);
                  onCloseMobile();
                }
              }}
              className={[
                "group flex items-center gap-2 px-3 py-[0.55rem] rounded-[7px] cursor-pointer transition-colors duration-150",
                isActive ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--surface-2)]",
              ].join(" ")}
            >
              {/* Page number */}
              <span className={[
                "text-[0.6rem] tracking-[0.05em] w-4 shrink-0",
                isActive ? "text-[var(--accent)]" : "text-[var(--text-faint)]",
              ].join(" ")}>
                {page.pageNumber}
              </span>

              {isRenaming ? (
                <>
                  <input
                    ref={renameInputRef}
                    className="flex-1 min-w-0 bg-[var(--surface)] border border-[var(--accent)] rounded px-1.5 py-0.5 text-[0.78rem] text-[var(--text)] font-['Geist_Mono'] outline-none"
                    value={renameValue}
                    onChange={(e) => onRenameValueChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onCommitRename(page.id);
                      if (e.key === "Escape") onCancelRename();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <button
                    className="flex items-center justify-center p-1 rounded text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
                    onClick={(e) => { e.stopPropagation(); onCommitRename(page.id); }}
                    title="Save"
                  >
                    <IconCheck />
                  </button>
                  <button
                    className="flex items-center justify-center p-1 rounded text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
                    onClick={(e) => { e.stopPropagation(); onCancelRename(); }}
                    title="Cancel"
                  >
                    <IconXmark />
                  </button>
                </>
              ) : (
                <>
                  <span className={[
                    "flex-1 text-[0.78rem] truncate transition-colors duration-150",
                    isActive ? "text-[var(--text)]" : "text-[var(--text-soft)] group-hover:text-[var(--text)]",
                  ].join(" ")}>
                    {page.title}
                  </span>

                  {/* Actions — visible on hover */}
                  <div
                    className="flex gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex items-center justify-center p-1 rounded text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
                      title="Rename"
                      onClick={() => onStartRename(page)}
                    >
                      <IconPencil />
                    </button>
                    {pages.length > 1 && (
                      <button
                        className="flex items-center justify-center p-1 rounded text-[var(--text-faint)] hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] hover:text-[var(--danger)] transition-colors"
                        title="Delete"
                        onClick={() => onConfirmDelete(page)}
                      >
                        <IconTrash />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* New page button */}
      <button
        type="button"
        onClick={() => {
          onNewPage();
          onCloseMobile();
        }}
        className="m-2 py-[0.65rem] flex items-center justify-center gap-1.5 text-[0.72rem] tracking-[0.04em] text-[var(--text-faint)] border border-dashed border-[var(--border2)] rounded-[7px] transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
      >
        <span>+</span> New page
      </button>
    </aside>
  );
}
