"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./editor-toolbar";
import { supabase } from "@/lib/supabase";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #0f0f0d;
    --surface:    #161614;
    --surface2:   #1e1e1b;
    --border:     #2a2a26;
    --border2:    #333330;
    --text:       #e8e6e0;
    --text-soft:  #8a8880;
    --text-faint: #4a4a46;
    --accent:     #c8b97a;
    --accent-dim: rgba(200,185,122,0.12);
    --danger:     #e05252;
    --danger-dim: rgba(224,82,82,0.1);
    --radius:     10px;
    --ease:       cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.97); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
    40%           { transform: translateY(-4px); opacity: 1; }
  }

  .ne-shell {
    display: flex;
    height: 100vh;
    background: var(--bg);
    font-family: 'Geist Mono', monospace;
    color: var(--text);
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .ne-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    animation: slideInLeft 0.5s var(--ease) both;
  }

  .ne-sidebar-header {
    padding: 0.73rem 1.25rem;
    border-bottom: 1px solid var(--border);
  }
  .ne-brand {
    font-family: 'Instrument Serif', serif;
    font-size: 1.3rem;
    color: var(--text);
    letter-spacing: 0.01em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .ne-brand-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
    animation: pulseGlow 2.5s ease-in-out infinite;
  }

  .ne-pages-label {
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-faint);
    padding: 1rem 1.25rem 0.5rem;
  }

  .ne-pages-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.25rem 0.5rem;
    scrollbar-width: thin;
    scrollbar-color: var(--border2) transparent;
  }

  .ne-page-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 0.75rem;
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.15s ease;
    position: relative;
  }
  .ne-page-item:hover { background: var(--surface2); }
  .ne-page-item.active { background: var(--accent-dim); }

  .ne-page-num {
    font-size: 0.6rem;
    color: var(--text-faint);
    letter-spacing: 0.05em;
    width: 16px;
    flex-shrink: 0;
  }
  .ne-page-item.active .ne-page-num { color: var(--accent); }

  .ne-page-name {
    flex: 1;
    font-size: 0.78rem;
    color: var(--text-soft);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s;
  }
  .ne-page-item.active .ne-page-name { color: var(--text); }
  .ne-page-item:hover .ne-page-name { color: var(--text); }

  .ne-page-name-input {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--accent);
    border-radius: 4px;
    padding: 0.1rem 0.35rem;
    font-family: 'Geist Mono', monospace;
    font-size: 0.78rem;
    color: var(--text);
    outline: none;
    min-width: 0;
  }

  .ne-page-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }
  .ne-page-item:hover .ne-page-actions { opacity: 1; }

  .ne-icon-btn {
    background: transparent;
    border: none;
    padding: 3px 5px;
    border-radius: 4px;
    cursor: pointer;
    color: var(--text-faint);
    line-height: 1;
    transition: background 0.15s, color 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ne-icon-btn:hover { background: var(--surface); color: var(--text); }
  .ne-icon-btn.danger:hover { background: var(--danger-dim); color: var(--danger); }

  .ne-new-page-btn {
    margin: 0.5rem;
    padding: 0.65rem 1rem;
    background: transparent;
    border: 1px dashed var(--border2);
    border-radius: 7px;
    color: var(--text-faint);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    letter-spacing: 0.04em;
  }
  .ne-new-page-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
  }

  /* ── Main ── */
  .ne-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: fadeIn 0.5s 0.1s var(--ease) both;
    min-width: 0;
  }

  /* ── Top bar ── */
  .ne-topbar {
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.75rem;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    gap: 1rem;
  }

  .ne-page-title-display {
    font-family: 'Instrument Serif', serif;
    font-size: 1.05rem;
    color: var(--text);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ne-topbar-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .ne-pill-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    border-radius: 6px;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text-soft);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    letter-spacing: 0.04em;
  }
  .ne-pill-btn:hover { border-color: var(--text-soft); color: var(--text); }
  .ne-pill-btn.edit-active {
    background: var(--accent);
    border-color: var(--accent);
    color: #0f0f0d;
    font-weight: 500;
  }

  /* ── Toolbar ── */
  .ne-toolbar-wrapper {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.35s var(--ease);
    border-bottom: 1px solid transparent;
    flex-shrink: 0;
  }
  .ne-toolbar-wrapper.show {
    max-height: 60px;
    border-bottom-color: var(--border);
  }
  .ne-toolbar-inner {
    padding: 0.6rem 1.75rem;
  }

  /* ── Editor scroll ── */
  .ne-editor-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: var(--border2) transparent;
  }

  /* ── KEY FIX: left-aligned, no centering ── */
  .ne-editor-wrap {
    width: 100%;
    padding: 2.5rem 2rem 6rem 1.75rem;
    animation: scaleIn 0.4s 0.2s var(--ease) both;
  }

  /* Tiptap */
  .ne-editor-wrap .ProseMirror {
    font-family: 'Instrument Serif', serif;
    font-size: 1.15rem;
    line-height: 1.9;
    color: var(--text);
    outline: none;
    min-height: 60vh;
    caret-color: var(--accent);
    width: 100%;
  }
  .ne-editor-wrap .ProseMirror p { margin-bottom: 0.75em; }
  .ne-editor-wrap .ProseMirror h1 {
    font-size: 2rem; font-weight: 400; font-style: italic;
    margin: 1em 0 0.4em; color: var(--text); letter-spacing: -0.01em;
  }
  .ne-editor-wrap .ProseMirror h2 {
    font-size: 1.4rem; font-weight: 400; font-style: italic;
    margin: 0.8em 0 0.35em; color: var(--text);
  }
  .ne-editor-wrap .ProseMirror h3 {
    font-size: 1.15rem; font-weight: 400; font-style: italic;
    margin: 0.7em 0 0.3em; color: var(--text);
  }
  .ne-editor-wrap .ProseMirror ul,
  .ne-editor-wrap .ProseMirror ol { padding-left: 1.6em; margin-bottom: 0.75em; }
  .ne-editor-wrap .ProseMirror li { margin-bottom: 0.3em; }
  .ne-editor-wrap .ProseMirror blockquote {
    border-left: 2px solid var(--accent);
    padding-left: 1.2em;
    color: var(--text-soft);
    font-style: italic;
    margin: 0 0 0.75em;
  }
  .ne-editor-wrap .ProseMirror code {
    font-family: 'Geist Mono', monospace;
    font-size: 0.82em;
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 0.1em 0.4em;
    border-radius: 4px;
    color: var(--accent);
  }
  .ne-editor-wrap .ProseMirror pre {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1em 1.2em;
    margin-bottom: 0.75em;
    overflow-x: auto;
  }
  .ne-editor-wrap .ProseMirror pre code {
    background: transparent; border: none; padding: 0; font-size: 0.85em;
  }
  .ne-editor-wrap .ProseMirror hr {
    border: none; border-top: 1px solid var(--border2); margin: 1.5em 0;
  }
  .ne-editor-wrap .ProseMirror .is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: var(--text-faint);
    pointer-events: none;
    float: left;
    height: 0;
    font-style: italic;
  }
  .ne-editor-wrap .ProseMirror ul[data-type="taskList"] {
    list-style: none; padding-left: 0.5em;
  }
  .ne-editor-wrap .ProseMirror ul[data-type="taskList"] li {
    display: flex; align-items: flex-start; gap: 0.6em;
  }
  .ne-editor-wrap .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
    margin-top: 0.4em; accent-color: var(--accent);
  }

  /* ── Read-only hint ── */
  .ne-readonly-hint {
    text-align: center;
    padding: 0.6rem;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-faint);
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  /* ── Status bar ── */
  .ne-statusbar {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.75rem;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }
  .ne-status-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.62rem;
    color: var(--text-faint);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .ne-save-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--text-faint);
    flex-shrink: 0;
    transition: background 0.3s;
  }
  .ne-save-dot.saving {
    background: var(--accent);
    border-radius: 1px;
    width: 6px; height: 6px;
    animation: spin 0.8s linear infinite;
  }
  .ne-status-right {
    font-size: 0.62rem;
    color: var(--text-faint);
    letter-spacing: 0.08em;
  }

  /* ── Delete confirm modal ── */
  .ne-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    animation: fadeIn 0.2s ease both;
  }
  .ne-modal {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 14px;
    padding: 2rem;
    width: 360px;
    max-width: 90vw;
    animation: scaleIn 0.25s var(--ease) both;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  }
  .ne-modal-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: var(--danger-dim);
    border: 1px solid rgba(224,82,82,0.2);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1rem;
  }
  .ne-modal-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.2rem;
    color: var(--text);
    margin-bottom: 0.5rem;
  }
  .ne-modal-body {
    font-size: 0.78rem;
    color: var(--text-soft);
    line-height: 1.65;
    margin-bottom: 1.5rem;
  }
  .ne-modal-body strong { color: var(--text); }
  .ne-modal-actions { display: flex; gap: 0.6rem; justify-content: flex-end; }
  .ne-modal-cancel {
    padding: 0.5rem 1.1rem;
    border-radius: 7px;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text-soft);
    font-family: 'Geist Mono', monospace;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }
  .ne-modal-cancel:hover { border-color: var(--text-soft); color: var(--text); }
  .ne-modal-confirm {
    padding: 0.5rem 1.1rem;
    border-radius: 7px;
    border: 1px solid var(--danger);
    background: var(--danger);
    color: #fff;
    font-family: 'Geist Mono', monospace;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }
  .ne-modal-confirm:hover { background: transparent; color: var(--danger); }

  /* ── Loading ── */
  .ne-fullload {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 100vh; background: var(--bg); gap: 1rem;
  }
  .ne-load-dots { display: flex; gap: 6px; }
  .ne-load-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
    animation: dotBounce 1.2s ease-in-out infinite;
  }
  .ne-load-dot:nth-child(2) { animation-delay: 0.2s; }
  .ne-load-dot:nth-child(3) { animation-delay: 0.4s; }
  .ne-load-label {
    font-family: 'Geist Mono', monospace;
    font-size: 0.68rem; letter-spacing: 0.2em;
    text-transform: uppercase; color: var(--text-faint);
  }

  /* ── Empty ── */
  .ne-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    flex: 1; gap: 0.75rem; color: var(--text-faint);
  }
  .ne-empty-icon { font-size: 2rem; opacity: 0.25; }
  .ne-empty-label { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }
`;

const DEFAULT_NOTE: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

type NotePage = {
  id: string;
  title: string;
  pageNumber: number;
  content: JSONContent;
};

const IconPencil = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 2.5l2 2L5 13l-3 1 1-3z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8L13 4"/>
  </svg>
);
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l4 4 6-6"/>
  </svg>
);
const IconXmark = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 3l10 10M13 3L3 13"/>
  </svg>
);

export function NoteEditor({ userId }: { userId: string }) {
  const [pages, setPages] = useState<NotePage[]>([]);
  const [activePageId, setActivePageId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotePage | null>(null);

  const saveTimeoutRef = useRef<number | null>(null);
  const skipSaveForHydrationRef = useRef(true);

  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId) ?? pages[0],
    [activePageId, pages],
  );

  const wordCount = useMemo(() => {
    const getText = (node: JSONContent): string => {
      if (node.text) return node.text;
      return (node.content ?? []).map(getText).join(" ");
    };
    const raw = activePage ? getText(activePage.content) : "";
    return raw.trim().split(/\s+/).filter(Boolean).length;
  }, [activePage]);

  const extensions = useMemo(
    () => [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      TaskList, TaskItem, TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      Underline, Strike,
      Link.configure({ openOnClick: false }),
    ],
    [],
  );

  const createFirstPage = useCallback(async (): Promise<NotePage | null> => {
    const { data, error } = await supabase
      .from("pages")
      .insert([{ id: crypto.randomUUID(), title: "Untitled", page_number: 1, content_json: DEFAULT_NOTE, user_id: userId }])
      .select().single();
    if (error) { console.error(error.message); return null; }
    return { id: data.id, title: data.title, pageNumber: data.page_number, content: data.content_json };
  }, [userId]);

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("pages").select("*").eq("user_id", userId)
      .order("page_number", { ascending: true });
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

  const editor = useEditor({
    extensions,
    content: DEFAULT_NOTE,
    immediatelyRender: false,
    editorProps: { attributes: { class: "ne-prose" } },
    onCreate: ({ editor: e }) => {
      if (activePage?.content) e.commands.setContent(activePage.content, { emitUpdate: false });
    },
    onUpdate: ({ editor: e }) => {
      if (skipSaveForHydrationRef.current) { skipSaveForHydrationRef.current = false; return; }
      if (!activePageId) return;
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(async () => {
        const json = e.getJSON();
        setPages((prev) => prev.map((p) => p.id === activePageId ? { ...p, content: json } : p));
        await savePageToSupabase(activePageId, json);
      }, 600);
    },
  });

  useEffect(() => { loadPages(); }, [loadPages]);
  useEffect(() => { editor?.setEditable(isEditMode); }, [editor, isEditMode]);
  useEffect(() => () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current); }, []);
  useEffect(() => {
    if (!editor || !activePage) return;
    skipSaveForHydrationRef.current = true;
    editor.commands.setContent(activePage.content || DEFAULT_NOTE, { emitUpdate: false });
  }, [activePage?.id, editor]);
  useEffect(() => {
    if (renamingId && renameInputRef.current) renameInputRef.current.focus();
  }, [renamingId]);

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

  const startRename = useCallback((page: NotePage) => {
    setRenamingId(page.id); setRenameValue(page.title);
  }, []);

  const commitRename = useCallback(async (pageId: string) => {
    const trimmed = renameValue.trim() || "Untitled";
    setPages((prev) => prev.map((p) => p.id === pageId ? { ...p, title: trimmed } : p));
    setRenamingId(null);
    await supabase.from("pages").update({ title: trimmed }).eq("id", pageId);
  }, [renameValue]);

  const confirmDelete = useCallback((page: NotePage) => setDeleteTarget(page), []);

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
      if (activePageId === pageId) {
        const next = renumbered[0];
        if (next) setActivePageId(next.id); else setActivePageId("");
      }
      return renumbered;
    });
  }, [deleteTarget, activePageId]);

  if (isLoading || !editor) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="ne-fullload">
          <div className="ne-load-dots">
            <div className="ne-load-dot" /><div className="ne-load-dot" /><div className="ne-load-dot" />
          </div>
          <span className="ne-load-label">Loading pages</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>

      {deleteTarget && (
        <div className="ne-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="ne-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ne-modal-icon">
              <IconTrash />
            </div>
            <div className="ne-modal-title">Delete page?</div>
            <div className="ne-modal-body">
              <strong>"{deleteTarget.title}"</strong> will be permanently removed.
              This action cannot be undone.
            </div>
            <div className="ne-modal-actions">
              <button className="ne-modal-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="ne-modal-confirm" onClick={deletePage}>Delete page</button>
            </div>
          </div>
        </div>
      )}

      <div className="ne-shell">
        {/* Sidebar */}
        <aside className="ne-sidebar">
          <div className="ne-sidebar-header">
            <div className="ne-brand">
              <span className="ne-brand-dot" />
              noted
            </div>
          </div>

          <div className="ne-pages-label">Pages · {pages.length}</div>

          <div className="ne-pages-list">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`ne-page-item${page.id === activePageId ? " active" : ""}`}
                onClick={() => { if (renamingId !== page.id) setActivePageId(page.id); }}
              >
                <span className="ne-page-num">{page.pageNumber}</span>

                {renamingId === page.id ? (
                  <>
                    <input
                      ref={renameInputRef}
                      className="ne-page-name-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(page.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button className="ne-icon-btn" onClick={(e) => { e.stopPropagation(); commitRename(page.id); }} title="Save">
                      <IconCheck />
                    </button>
                    <button className="ne-icon-btn" onClick={(e) => { e.stopPropagation(); setRenamingId(null); }} title="Cancel">
                      <IconXmark />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="ne-page-name">{page.title}</span>
                    <div className="ne-page-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="ne-icon-btn" title="Rename" onClick={() => startRename(page)}>
                        <IconPencil />
                      </button>
                      {pages.length > 1 && (
                        <button className="ne-icon-btn danger" title="Delete" onClick={() => confirmDelete(page)}>
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <button type="button" className="ne-new-page-btn" onClick={createNewPage}>
            <span>+</span> New page
          </button>
        </aside>

        {/* Main */}
        <main className="ne-main">
          <div className="ne-topbar">
            <span className="ne-page-title-display">{activePage?.title ?? "—"}</span>
            <div className="ne-topbar-actions">
              <button
                type="button"
                className={`ne-pill-btn${isEditMode ? " edit-active" : ""}`}
                onClick={() => setIsEditMode((v) => !v)}
              >
                {isEditMode ? <><IconCheck /> Done</> : <><IconPencil /> Edit</>}
              </button>
            </div>
          </div>

          <div className={`ne-toolbar-wrapper${isEditMode ? " show" : ""}`}>
            <div className="ne-toolbar-inner">
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

          {activePage ? (
            <div className="ne-editor-scroll">
              <div className="ne-editor-wrap">
                <EditorContent editor={editor} />
              </div>
            </div>
          ) : (
            <div className="ne-empty">
              <div className="ne-empty-icon">✦</div>
              <div className="ne-empty-label">No pages yet — create one</div>
            </div>
          )}

          {!isEditMode && activePage && (
            <div className="ne-readonly-hint">
              Click <strong style={{ color: "var(--text-soft)" }}>Edit</strong> to start writing
            </div>
          )}

          <div className="ne-statusbar">
            <div className="ne-status-left">
              <span className={`ne-save-dot${isSaving ? " saving" : ""}`} />
              {isSaving ? "Saving…" : "Saved"}
            </div>
            <div className="ne-status-right">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}