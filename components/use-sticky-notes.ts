"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import { StickyNote, StickyColor } from "./sticky-note-types";
import { supabase } from "@/lib/supabase";

type DraftNote = {
  anchorText: string;
  from: number;
  to: number;
  x: number;
  y: number;
};

type ActiveNote = {
  note: StickyNote;
  x: number;
  y: number;
};

export function useStickyNotes(
  editor: Editor | null,
  pageId: string,
  userId: string,
  editorScrollRef: React.RefObject<HTMLDivElement>,
) {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [draft, setDraft] = useState<DraftNote | null>(null);
  const [activeNote, setActiveNote] = useState<ActiveNote | null>(null);
  // Track pixel positions of all markers (recomputed on scroll/resize)
  const [markerPositions, setMarkerPositions] = useState<Record<string, { x: number; y: number }>>({});

  /* ── Load notes for current page ── */
  useEffect(() => {
    if (!pageId) return;
    supabase
      .from("sticky_notes")
      .select("*")
      .eq("page_id", pageId)
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) { console.error(error.message); return; }
        setNotes((data ?? []).map((r: any) => ({
          id: r.id,
          pageId: r.page_id,
          anchorText: r.anchor_text,
          content: r.content,
          color: r.color,
          from: r.from_pos,
          to: r.to_pos,
          createdAt: r.created_at,
        })));
      });
  }, [pageId, userId]);

  /* ── Recompute marker pixel positions ── */
  const recomputePositions = useCallback(() => {
    if (!editor) return;
    const container = editorScrollRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const positions: Record<string, { x: number; y: number }> = {};

    notes.forEach((note) => {
      try {
        // Get DOM position from ProseMirror pos
        const coords = editor.view.coordsAtPos(note.from);
        positions[note.id] = {
          x: coords.left - containerRect.left + container.scrollLeft,
          y: coords.top  - containerRect.top  + container.scrollTop,
        };
      } catch {
        // pos may be out of range if page content changed
      }
    });

    setMarkerPositions(positions);
  }, [editor, notes, editorScrollRef]);

  useEffect(() => {
    recomputePositions();
  }, [recomputePositions]);

  useEffect(() => {
    const container = editorScrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", recomputePositions);
    window.addEventListener("resize", recomputePositions);
    return () => {
      container.removeEventListener("scroll", recomputePositions);
      window.removeEventListener("resize", recomputePositions);
    };
  }, [recomputePositions, editorScrollRef]);

  /* ── Open draft from current text selection ── */
  const openDraftFromSelection = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return; // nothing selected

    const selectedText = editor.state.doc.textBetween(from, to, " ");
    if (!selectedText.trim()) return;

    const container = editorScrollRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    // Get coords of the selection start
    const coords = editor.view.coordsAtPos(from);
    const x = coords.left - containerRect.left + container.scrollLeft;
    const y = coords.top  - containerRect.top  + container.scrollTop;

    setDraft({ anchorText: selectedText, from, to, x, y });
    setActiveNote(null);
  }, [editor, editorScrollRef]);

  /* ── Save a new note ── */
  const saveNote = useCallback(async (content: string, color: StickyColor) => {
    if (!draft) return;

    const newNote: StickyNote = {
      id: crypto.randomUUID(),
      pageId,
      anchorText: draft.anchorText,
      content,
      color,
      from: draft.from,
      to: draft.to,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setNotes((prev) => [...prev, newNote]);
    setDraft(null);

    // Apply highlight decoration to editor
    editor?.chain().focus().setTextSelection({ from: draft.from, to: draft.to }).run();

    await supabase.from("sticky_notes").insert([{
      id: newNote.id,
      page_id: pageId,
      user_id: userId,
      anchor_text: newNote.anchorText,
      content: newNote.content,
      color: newNote.color,
      from_pos: newNote.from,
      to_pos: newNote.to,
    }]);
  }, [draft, pageId, userId, editor]);

  /* ── Update an existing note ── */
  const updateNote = useCallback(async (id: string, content: string, color: StickyColor) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, content, color } : n));
    setActiveNote(null);
    await supabase.from("sticky_notes").update({ content, color }).eq("id", id);
  }, []);

  /* ── Delete a note ── */
  const deleteNote = useCallback(async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setActiveNote(null);
    await supabase.from("sticky_notes").delete().eq("id", id);
  }, []);

  /* ── Open an existing note by clicking its marker ── */
  const openNote = useCallback((note: StickyNote) => {
    const pos = markerPositions[note.id];
    if (!pos) return;
    setActiveNote({ note, x: pos.x, y: pos.y });
    setDraft(null);
  }, [markerPositions]);

  return {
    notes,
    draft,
    activeNote,
    markerPositions,
    openDraftFromSelection,
    saveNote,
    updateNote,
    deleteNote,
    openNote,
    closeDraft: () => setDraft(null),
    closeNote:  () => setActiveNote(null),
  };
}
