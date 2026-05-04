"use client";

import { NotePage } from "./note-editor-types";
import { IconTrash } from "./note-icons";

type DeletePageModalProps = {
  page: NotePage;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeletePageModal({ page, onConfirm, onCancel }: DeletePageModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease_both]"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--border2)] rounded-2xl p-8 w-[360px] max-w-[90vw] shadow-[0_32px_80px_rgba(0,0,0,0.35)] animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)_both]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-[10px] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] border border-[color-mix(in_srgb,var(--danger)_24%,transparent)] flex items-center justify-center mb-4 text-[var(--danger)]">
          <IconTrash size={15} />
        </div>

        <h2 className="font-['Instrument_Serif'] text-xl text-[var(--text)] mb-2">
          Delete page?
        </h2>
        <p className="text-[0.78rem] text-[var(--text-soft)] leading-relaxed mb-6">
          <span className="text-[var(--text)] font-medium">
            &quot;{page.title}&quot;
          </span>{" "}
          will be
          permanently removed. This action cannot be undone.
        </p>

        <div className="flex gap-2.5 justify-end">
          <button
            className="px-4 py-2 rounded-[7px] border border-[var(--border2)] text-[var(--text-soft)] text-[0.75rem] font-['Geist_Mono'] cursor-pointer transition-all hover:border-[var(--text-soft)] hover:text-[var(--text)]"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-[7px] border border-[var(--danger)] bg-[var(--danger)] text-white text-[0.75rem] font-['Geist_Mono'] cursor-pointer transition-all hover:bg-transparent hover:text-[var(--danger)]"
            onClick={onConfirm}
          >
            Delete page
          </button>
        </div>
      </div>
    </div>
  );
}
