"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";

import { supabase } from "@/lib/supabase";
import { EditorToolbar } from "./editor-toolbar";
import { PageSidebar } from "./page-sidebar";
import { EditorTopbar } from "./editor-topbar";
import { DeletePageModal } from "./delete-page-modal";
import { NotePage, DEFAULT_NOTE } from "./note-editor-types";
import { useStickyNotes } from "./use-sticky-notes";
import { StickyNotePopup } from "./sticky-note-popup";
import { StickyNoteMarker } from "./sticky-note-marker";

/* ─── Keyframe + prose styles ─── */
const ANIM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap');

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.97); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
    40%           { transform: translateY(-4px); opacity: 1; }
  }

  /* Selection toolbar */
  @keyframes sel-pop {
    from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.94); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0)   scale(1); }
  }
  .sel-toolbar {
    animation: sel-pop 0.15s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  /* ProseMirror prose styles */
  .ne-prose {
    font-family: 'Instrument Serif', serif;
    font-size: 1.15rem;
    line-height: 1.9;
    color: var(--text);
    outline: none;
    min-height: 60vh;
    caret-color: var(--accent);
    width: 100%;
  }
  .ne-prose p { margin-bottom: 0.75em; }
  .ne-prose h1 { font-size: 2rem; font-weight: 400; font-style: italic; margin: 1em 0 0.4em; letter-spacing: -0.01em; }
  .ne-prose h2 { font-size: 1.4rem; font-weight: 400; font-style: italic; margin: 0.8em 0 0.35em; }
  .ne-prose h3 { font-size: 1.15rem; font-weight: 400; font-style: italic; margin: 0.7em 0 0.3em; }
  .ne-prose ul,
  .ne-prose ol { padding-left: 1.6em; margin-bottom: 0.75em; }
  .ne-prose li { margin-bottom: 0.3em; }
  .ne-prose blockquote {
    border-left: 2px solid var(--accent);
    padding-left: 1.2em;
    color: var(--text-soft);
    font-style: italic;
    margin: 0 0 0.75em;
  }
  .ne-prose code {
    font-family: 'Geist Mono', monospace;
    font-size: 0.82em;
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 0.1em 0.4em;
    border-radius: 4px;
    color: var(--accent);
  }
  .ne-prose pre {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1em 1.2em;
    margin-bottom: 0.75em;
    overflow-x: auto;
  }
  .ne-prose pre code { background: transparent; border: none; padding: 0; font-size: 0.85em; }
  .ne-prose hr { border: none; border-top: 1px solid var(--border2); margin: 1.5em 0; }
  .ne-prose .is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: var(--text-faint);
    pointer-events: none;
    float: left;
    height: 0;
    font-style: italic;
  }
  .ne-prose ul[data-type="taskList"] { list-style: none; padding-left: 0.5em; }
  .ne-prose ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.6em; }
  .ne-prose ul[data-type="taskList"] input[type="checkbox"] { margin-top: 0.4em; accent-color: var(--accent); }
`;

/* ── Icon: sticky note pin ── */
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 1.5l5 5-7 7-1.5-1.5 1-4-4.5-4.5 4-1 3 3z" />
    <line x1="1.5" y1="14.5" x2="5" y2="11" />
  </svg>
);

export function NoteEditor({ userId }: { userId: string }) {
  const [pages, setPages] = useState<NotePage[]>([]);
  const [activePageId, setActivePageId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<NotePage | null>(null);

  // Selection toolbar state (the "Add note" bubble that appears on text selection)
  const [selToolbar, setSelToolbar] = useState<{ x: number; y: number } | null>(null);

  const saveTimeoutRef = useRef<number | null>(null);
  const skipSaveRef = useRef(true);
  const editorScrollRef = useRef<HTMLDivElement | null>(null);

  /* ── Derived ── */
  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId) ?? pages[0],
    [activePageId, pages],
  );

  const wordCount = useMemo(() => {
    const getText = (node: JSONContent): string =>
      node.text ?? (node.content ?? []).map(getText).join(" ");
    const raw = activePage ? getText(activePage.content) : "";
    return raw.trim().split(/\s+/).filter(Boolean).length;
  }, [activePage]);

  /* ── Extensions ── */
  const extensions = useMemo(() => [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Placeholder.configure({ placeholder: "Start writing…" }),
    TaskList, TaskItem, TextStyle,
    Color.configure({ types: ["textStyle"] }),
    Highlight.configure({ multicolor: true }),
    Underline, Strike,
    Link.configure({ openOnClick: false }),
  ], []);

  /* ── Supabase helpers ── */
  const createFirstPage = useCallback(async (): Promise<NotePage | null> => {
    const { data, error } = await supabase.from("pages")
      .insert([{ id: crypto.randomUUID(), title: "Untitled", page_number: 1, content_json: DEFAULT_NOTE, user_id: userId }])
      .select().single();
    if (error) { console.error(error.message); return null; }
    return { id: data.id, title: data.title, pageNumber: data.page_number, content: data.content_json };
  }, [userId]);

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("pages").select("*")
      .eq("user_id", userId).order("page_number", { ascending: true });
    if (error) { console.error(error.message); setIsLoading(false); return; }
    const mapped: NotePage[] = (data ?? []).map((p: any) => ({
      id: p.id, title: p.title, pageNumber: p.page_number, content: p.content_json,
    }));
    if (mapped.length > 0) { setPages(mapped); setActivePageId(mapped[0].id); }
    else {
      const first = await createFirstPage();
      if (first) { setPages([first]); setActivePageId(first.id); }
    }
    setIsLoading(false);
  }, [createFirstPage, userId]);

  const savePageToSupabase = useCallback(async (pageId: string, content: JSONContent) => {
    setIsSaving(true);
    const { error } = await supabase.from("pages")
      .update({ content_json: content, updated_at: new Date().toISOString() })
      .eq("id", pageId);
    if (error) console.error(error.message);
    setTimeout(() => setIsSaving(false), 700);
  }, []);

  /* ── Editor ── */
  const editor = useEditor({
    extensions,
    content: DEFAULT_NOTE,
    immediatelyRender: false,
    editorProps: { attributes: { class: "ne-prose" } },
    onCreate: ({ editor: e }) => {
      if (activePage?.content) e.commands.setContent(activePage.content, { emitUpdate: false });
    },
    onUpdate: ({ editor: e }) => {
      if (skipSaveRef.current) { skipSaveRef.current = false; return; }
      if (!activePageId) return;
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(async () => {
        const json = e.getJSON();
        setPages((prev) => prev.map((p) => p.id === activePageId ? { ...p, content: json } : p));
        await savePageToSupabase(activePageId, json);
      }, 600);
    },
    // Show selection toolbar when text is selected in edit mode
    onSelectionUpdate: ({ editor: e }) => {
      if (!isEditMode) return;
      const { from, to } = e.state.selection;
      if (from === to) { setSelToolbar(null); return; }

      const container = editorScrollRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const coords = e.view.coordsAtPos(from);

      setSelToolbar({
        x: coords.left - containerRect.left + (coords.right - coords.left) / 2,
        y: coords.top  - containerRect.top  + container.scrollTop - 8,
      });
    },
  });

  useEffect(() => { loadPages(); }, [loadPages]);
  useEffect(() => { editor?.setEditable(isEditMode); }, [editor, isEditMode]);
  useEffect(() => () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current); }, []);
  useEffect(() => {
    if (!editor || !activePage) return;
    skipSaveRef.current = true;
    editor.commands.setContent(activePage.content || DEFAULT_NOTE, { emitUpdate: false });
    setSelToolbar(null);
  }, [activePage?.id, editor]);

  // Hide selection toolbar when exiting edit mode
  useEffect(() => { if (!isEditMode) setSelToolbar(null); }, [isEditMode]);

  /* ── Sticky notes ── */
  const sticky = useStickyNotes(editor, activePageId, userId, editorScrollRef as React.RefObject<HTMLDivElement>);

  /* ── Page actions ── */
  const createNewPage = useCallback(async () => {
    const nextNum = pages.length + 1;
    const { data, error } = await supabase.from("pages")
      .insert([{ id: crypto.randomUUID(), title: "Untitled", page_number: nextNum, content_json: DEFAULT_NOTE, user_id: userId }])
      .select().single();
    if (error) { console.error(error.message); return; }
    const newPage: NotePage = { id: data.id, title: data.title, pageNumber: data.page_number, content: data.content_json };
    setPages((prev) => [...prev, newPage]);
    setActivePageId(newPage.id);
    setIsEditMode(true);
    setRenamingId(newPage.id);
    setRenameValue("Untitled");
  }, [pages.length, userId]);

  const commitRename = useCallback(async (pageId: string) => {
    const trimmed = renameValue.trim() || "Untitled";
    setPages((prev) => prev.map((p) => p.id === pageId ? { ...p, title: trimmed } : p));
    setRenamingId(null);
    await supabase.from("pages").update({ title: trimmed }).eq("id", pageId);
  }, [renameValue]);

  const deletePage = useCallback(async () => {
    if (!deleteTarget) return;
    const pageId = deleteTarget.id;
    setDeleteTarget(null);
    const { error } = await supabase.from("pages").delete().eq("id", pageId);
    if (error) { console.error(error.message); return; }
    setPages((prev) => {
      const remaining = prev.filter((p) => p.id !== pageId);
      const renumbered = remaining.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      renumbered.forEach((p) => supabase.from("pages").update({ page_number: p.pageNumber }).eq("id", p.id));
      if (activePageId === pageId) setActivePageId(renumbered[0]?.id ?? "");
      return renumbered;
    });
  }, [deleteTarget, activePageId]);

  /* ── Loading state ── */
  if (isLoading || !editor) {
    return (
      <>
        <style>{ANIM_STYLES}</style>
        <div className="flex flex-col items-center justify-center h-full bg-[var(--bg)] gap-4">
          <div className="flex gap-1.5">
            {[0, 0.2, 0.4].map((delay, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-[dotBounce_1.2s_ease-in-out_infinite]"
                style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
          <span className="text-[0.68rem] tracking-[0.2em] uppercase text-[var(--text-faint)] font-['Geist_Mono']">
            Loading pages
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{ANIM_STYLES}</style>

      {deleteTarget && (
        <DeletePageModal
          page={deleteTarget}
          onConfirm={deletePage}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="relative flex h-full min-h-0 bg-[var(--bg)] font-['Geist_Mono'] text-[var(--text)] overflow-hidden">

        {/* ── Sidebar ── */}
        <PageSidebar
          pages={pages}
          activePageId={activePageId}
          renamingId={renamingId}
          renameValue={renameValue}
          isMobileOpen={isSidebarOpen}
          onSelectPage={setActivePageId}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onStartRename={(page) => { setRenamingId(page.id); setRenameValue(page.title); }}
          onCommitRename={commitRename}
          onCancelRename={() => setRenamingId(null)}
          onRenameValueChange={setRenameValue}
          onConfirmDelete={setDeleteTarget}
          onNewPage={createNewPage}
        />

        {isSidebarOpen && (
          <button
            type="button"
            className="lg:hidden absolute inset-0 z-30 bg-black/55 backdrop-blur-[1px]"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close pages"
          />
        )}

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0 animate-[fadeIn_0.5s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]">

          <EditorTopbar
            pageTitle={activePage?.title ?? "—"}
            isEditMode={isEditMode}
            isSaving={isSaving}
            wordCount={wordCount}
            onToggleEdit={() => setIsEditMode((v) => !v)}
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />

          {/* Formatting toolbar */}
          <div className={[
            "overflow-hidden shrink-0 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] border-b",
            isEditMode ? "max-h-15 border-[var(--border)]" : "max-h-0 border-transparent",
          ].join(" ")}>
            <div className="px-3 sm:px-5 lg:px-7 py-2.5">
              <EditorToolbar
                canBold={editor.can().chain().focus().toggleBold().run()}
                canItalic={editor.can().chain().focus().toggleItalic().run()}
                canUnderline={editor.can().chain().focus().toggleUnderline().run()}
                canStrike={editor.can().chain().focus().toggleStrike().run()}
                canHeading1={editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
                canHeading2={editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
                canHeading3={editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
                canBulletList={editor.can().chain().focus().toggleBulletList().run()}
                canOrderedList={editor.can().chain().focus().toggleOrderedList().run()}
                canTaskList={editor.can().chain().focus().toggleTaskList().run()}
                canBlockquote={editor.can().chain().focus().toggleBlockquote().run()}
                canCodeBlock={editor.can().chain().focus().toggleCodeBlock().run()}
                canHorizontalRule={editor.can().chain().focus().setHorizontalRule().run()}
                canUndo={editor.can().undo()}
                canRedo={editor.can().redo()}
                isBold={editor.isActive("bold")}
                isItalic={editor.isActive("italic")}
                isUnderline={editor.isActive("underline")}
                isStrike={editor.isActive("strike")}
                isHeading1={editor.isActive("heading", { level: 1 })}
                isHeading2={editor.isActive("heading", { level: 2 })}
                isHeading3={editor.isActive("heading", { level: 3 })}
                isBulletList={editor.isActive("bulletList")}
                isOrderedList={editor.isActive("orderedList")}
                isTaskList={editor.isActive("taskList")}
                isBlockquote={editor.isActive("blockquote")}
                isCodeBlock={editor.isActive("codeBlock")}
                onBold={() => editor.chain().focus().toggleBold().run()}
                onItalic={() => editor.chain().focus().toggleItalic().run()}
                onUnderline={() => editor.chain().focus().toggleUnderline().run()}
                onStrike={() => editor.chain().focus().toggleStrike().run()}
                onHeading1={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                onHeading2={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                onHeading3={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                onBulletList={() => editor.chain().focus().toggleBulletList().run()}
                onOrderedList={() => editor.chain().focus().toggleOrderedList().run()}
                onTaskList={() => editor.chain().focus().toggleTaskList().run()}
                onBlockquote={() => editor.chain().focus().toggleBlockquote().run()}
                onCodeBlock={() => editor.chain().focus().toggleCodeBlock().run()}
                onHorizontalRule={() => editor.chain().focus().setHorizontalRule().run()}
                onUndo={() => editor.chain().focus().undo().run()}
                onRedo={() => editor.chain().focus().redo().run()}
                onTextColor={(color) => editor.chain().focus().setColor(color).run()}
                onHighlightColor={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
              />
            </div>
          </div>

          {/* ── Editor scroll area (position: relative for sticky markers) ── */}
          {activePage ? (
            <div
              ref={editorScrollRef}
              className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border2)] relative"
            >
              {/* Editor prose */}
              <div className="w-full px-4 sm:px-6 lg:px-7 pt-6 sm:pt-8 lg:pt-10 pb-20 sm:pb-24 animate-[scaleIn_0.4s_0.2s_cubic-bezier(0.16,1,0.3,1)_both]">
                <EditorContent editor={editor} />
              </div>

              {/* ── Selection "Add note" toolbar ── */}
              {selToolbar && isEditMode && (
                <div
                  className="sel-toolbar absolute z-20 pointer-events-auto"
                  style={{ left: selToolbar.x, top: selToolbar.y, transform: "translateX(-50%)" }}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // keep selection alive
                      sticky.openDraftFromSelection();
                      setSelToolbar(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.68rem] font-['Geist_Mono'] tracking-wide text-[var(--bg)] bg-[var(--accent)] border border-[var(--accent-hover)] shadow-[0_4px_16px_rgba(0,0,0,0.22)] hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    <IconPin />
                    Add note
                  </button>
                </div>
              )}

              {/* ── Sticky note markers (one dot per saved note) ── */}
              {sticky.notes.map((note) => {
                const pos = sticky.markerPositions[note.id];
                if (!pos) return null;
                return (
                  <StickyNoteMarker
                    key={note.id}
                    note={note}
                    x={pos.x}
                    y={pos.y}
                    onClick={() => sticky.openNote(note)}
                  />
                );
              })}

              {/* ── Draft sticky note popup ── */}
              {sticky.draft && (
                <StickyNotePopup
                  x={sticky.draft.x}
                  y={sticky.draft.y}
                  draftAnchorText={sticky.draft.anchorText}
                  onSave={sticky.saveNote}
                  onClose={sticky.closeDraft}
                />
              )}

              {/* ── Open existing sticky note popup ── */}
              {sticky.activeNote && (
                <StickyNotePopup
                  x={sticky.activeNote.x}
                  y={sticky.activeNote.y}
                  note={sticky.activeNote.note}
                  onSave={(content, color) => sticky.updateNote(sticky.activeNote!.note.id, content, color)}
                  onDelete={() => sticky.deleteNote(sticky.activeNote!.note.id)}
                  onClose={sticky.closeNote}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--text-faint)]">
              <span className="text-3xl opacity-25">✦</span>
              <span className="text-[0.68rem] sm:text-[0.72rem] tracking-[0.12em] uppercase text-center px-4">No pages yet — create one</span>
            </div>
          )}

          {/* Read-only hint */}
          {!isEditMode && activePage && (
            <div className="shrink-0 py-2.5 px-4 text-center text-[0.58rem] sm:text-[0.65rem] tracking-[0.12em] uppercase text-[var(--text-faint)] border-t border-[var(--border)]">
              Click <span className="text-[var(--text-soft)]">🔒 Locked</span> to start writing
            </div>
          )}
        </main>
      </div>
    </>
  );
}
