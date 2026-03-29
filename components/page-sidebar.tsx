"use client";

import { useRef } from "react";
import { NotePage } from "./note-editor-types";
import { IconPencil, IconTrash, IconCheck, IconXmark } from "./note-icons";

type PageSidebarProps = {
  pages: NotePage[];
  activePageId: string;
  renamingId: string | null;
  renameValue: string;
  onSelectPage: (id: string) => void;
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
  onSelectPage,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onRenameValueChange,
  onConfirmDelete,
  onNewPage,
}: PageSidebarProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-60 shrink-0 bg-[#161614] border-r border-[#2a2a26] flex flex-col animate-[slideInLeft_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* Header */}
      <div className="px-5 py-[0.73rem] border-b border-[#2a2a26] flex items-center gap-2">
        <span className="w-1.75 h-1.75 rounded-full bg-[#c8b97a] shrink-0 animate-[pulseGlow_2.5s_ease-in-out_infinite]" />
        <span className="font-['Instrument_Serif'] text-[1.3rem] text-[#e8e6e0] tracking-[0.01em]">
          Notivo
        </span>
      </div>

      {/* Pages label */}
      <p className="text-[0.62rem] tracking-[0.18em] uppercase text-[#4a4a46] px-5 pt-4 pb-2">
        Pages · {pages.length}
      </p>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#333330]">
        {pages.map((page) => {
          const isActive = page.id === activePageId;
          const isRenaming = renamingId === page.id;

          return (
            <div
              key={page.id}
              onClick={() => { if (!isRenaming) onSelectPage(page.id); }}
              className={[
                "group flex items-center gap-2 px-3 py-[0.55rem] rounded-[7px] cursor-pointer transition-colors duration-150",
                isActive ? "bg-[rgba(200,185,122,0.12)]" : "hover:bg-[#1e1e1b]",
              ].join(" ")}
            >
              {/* Page number */}
              <span className={[
                "text-[0.6rem] tracking-[0.05em] w-4 shrink-0",
                isActive ? "text-[#c8b97a]" : "text-[#4a4a46]",
              ].join(" ")}>
                {page.pageNumber}
              </span>

              {isRenaming ? (
                <>
                  <input
                    ref={renameInputRef}
                    className="flex-1 min-w-0 bg-[#161614] border border-[#c8b97a] rounded px-1.5 py-0.5 text-[0.78rem] text-[#e8e6e0] font-['Geist_Mono'] outline-none"
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
                    className="flex items-center justify-center p-1 rounded text-[#4a4a46] hover:bg-[#161614] hover:text-[#e8e6e0] transition-colors"
                    onClick={(e) => { e.stopPropagation(); onCommitRename(page.id); }}
                    title="Save"
                  >
                    <IconCheck />
                  </button>
                  <button
                    className="flex items-center justify-center p-1 rounded text-[#4a4a46] hover:bg-[#161614] hover:text-[#e8e6e0] transition-colors"
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
                    isActive ? "text-[#e8e6e0]" : "text-[#8a8880] group-hover:text-[#e8e6e0]",
                  ].join(" ")}>
                    {page.title}
                  </span>

                  {/* Actions — visible on hover */}
                  <div
                    className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex items-center justify-center p-1 rounded text-[#4a4a46] hover:bg-[#1e1e1b] hover:text-[#e8e6e0] transition-colors"
                      title="Rename"
                      onClick={() => onStartRename(page)}
                    >
                      <IconPencil />
                    </button>
                    {pages.length > 1 && (
                      <button
                        className="flex items-center justify-center p-1 rounded text-[#4a4a46] hover:bg-[rgba(224,82,82,0.1)] hover:text-[#e05252] transition-colors"
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
        onClick={onNewPage}
        className="m-2 py-[0.65rem] flex items-center justify-center gap-1.5 text-[0.72rem] tracking-[0.04em] text-[#4a4a46] border border-dashed border-[#333330] rounded-[7px] transition-all duration-200 hover:border-[#c8b97a] hover:text-[#c8b97a] hover:bg-[rgba(200,185,122,0.08)]"
      >
        <span>+</span> New page
      </button>
    </aside>
  );
}