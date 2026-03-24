"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./editor-toolbar";
import { BlockInsertMenu } from "./block-insert-menu";

const STORAGE_KEY = "noted.pages.v1";
const DEFAULT_NOTE = "<p></p>";

type NotePage = {
  id: string;
  title: string;
  content: string;
};

type StoredData = {
  activePageId: string;
  pages: NotePage[];
};

type PlusAnchor = {
  top: number;
  visible: boolean;
};

function createDefaultPage(): NotePage {
  return {
    id: crypto.randomUUID(),
    title: "Page 1",
    content: DEFAULT_NOTE,
  };
}

function getInitialData(): StoredData {
  if (typeof window === "undefined") {
    const page = createDefaultPage();
    return { activePageId: page.id, pages: [page] };
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const page = createDefaultPage();
    return { activePageId: page.id, pages: [page] };
  }

  try {
    const parsed = JSON.parse(stored) as StoredData;
    if (!parsed.pages?.length) {
      const page = createDefaultPage();
      return { activePageId: page.id, pages: [page] };
    }

    return parsed;
  } catch {
    const page = createDefaultPage();
    return { activePageId: page.id, pages: [page] };
  }
}

export function NoteEditor() {
  const initialData = useMemo(() => getInitialData(), []);
  const [pages, setPages] = useState<NotePage[]>(initialData.pages);
  const [activePageId, setActivePageId] = useState(initialData.activePageId);
  const [isEditMode, setIsEditMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [plusAnchor, setPlusAnchor] = useState<PlusAnchor>({
    top: 0,
    visible: false,
  });
  const editorWrapRef = useRef<HTMLDivElement | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const skipSaveForHydrationRef = useRef(true);

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0],
    [activePageId, pages],
  );

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: DEFAULT_NOTE,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "noted-editor min-h-[68vh] focus:outline-none px-12 py-8",
      },
    },
    onCreate: ({ editor: createdEditor }) => {
      createdEditor.commands.setContent(activePage.content, { emitUpdate: false });
    },
    onUpdate: ({ editor: updatedEditor }) => {
      if (skipSaveForHydrationRef.current) {
        skipSaveForHydrationRef.current = false;
        return;
      }

      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(() => {
        const html = updatedEditor.getHTML();
        setPages((prevPages) =>
          prevPages.map((page) =>
            page.id === activePageId ? { ...page, content: html } : page,
          ),
        );
      }, 250);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(isEditMode);
  }, [editor, isEditMode]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activePageId,
        pages,
      }),
    );
  }, [activePageId, pages]);

  useEffect(() => {
    if (!editor || !activePage) {
      return;
    }

    skipSaveForHydrationRef.current = true;
    editor.commands.setContent(activePage.content, { emitUpdate: false });
  }, [activePage, editor]);

  const createNewPage = useCallback(() => {
    const newPage: NotePage = {
      id: crypto.randomUUID(),
      title: `Page ${pages.length + 1}`,
      content: DEFAULT_NOTE,
    };

    setPages((prev) => [...prev, newPage]);
    setActivePageId(newPage.id);
    setIsEditMode(true);
  }, [pages.length]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isEditMode || !editorWrapRef.current) {
        return;
      }

      const blockEl = (event.target as HTMLElement).closest(
        ".ProseMirror > p, .ProseMirror > h1, .ProseMirror > h2, .ProseMirror > ul",
      ) as HTMLElement | null;

      if (!blockEl) {
        if (!menuOpen) {
          setPlusAnchor((prev) => ({ ...prev, visible: false }));
        }
        return;
      }

      const blockRect = blockEl.getBoundingClientRect();
      const wrapRect = editorWrapRef.current.getBoundingClientRect();

      setPlusAnchor({
        top: blockRect.top - wrapRect.top + 2,
        visible: true,
      });
    },
    [isEditMode, menuOpen],
  );

  const insertBlockFromMenu = useCallback(
    (type: "heading" | "paragraph" | "bulletList") => {
      if (!editor) {
        return;
      }

      const actions = {
        heading: () => editor.chain().focus().setHeading({ level: 1 }).run(),
        paragraph: () => editor.chain().focus().setParagraph().run(),
        bulletList: () => editor.chain().focus().toggleBulletList().run(),
      };

      actions[type]();
    },
    [editor],
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 md:px-8">
      <header className="mb-4 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <select
            value={activePageId}
            onChange={(event) => {
              setMenuOpen(false);
              setActivePageId(event.target.value);
            }}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition-colors focus:border-zinc-400"
            aria-label="Switch page"
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={createNewPage}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            New page
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditMode((prev) => !prev);
              setMenuOpen(false);
            }}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
          >
            {isEditMode ? "Done" : "Edit"}
          </button>
        </div>
      </header>

      <div className="relative flex-1 rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-200">
        <div
          className={[
            "px-4 pt-4 transition-all duration-200",
            isEditMode
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0",
          ].join(" ")}
        >
          <EditorToolbar
            canBold={editor.can().chain().focus().toggleBold().run()}
            canToggleHeading={
              editor.can().chain().focus().toggleHeading({ level: 1 }).run()
            }
            canToggleBulletList={editor.can().chain().focus().toggleBulletList().run()}
            isBold={editor.isActive("bold")}
            isHeading={editor.isActive("heading", { level: 1 })}
            isBulletList={editor.isActive("bulletList")}
            onBold={() => editor.chain().focus().toggleBold().run()}
            onHeading={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            onBulletList={() => editor.chain().focus().toggleBulletList().run()}
          />
        </div>

        <div
          ref={editorWrapRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            if (!menuOpen) {
              setPlusAnchor((prev) => ({ ...prev, visible: false }));
            }
          }}
          className={[
            "relative rounded-2xl border border-transparent bg-white transition-all duration-200",
            isEditMode ? "border-zinc-200 shadow-sm" : "",
          ].join(" ")}
        >
          {isEditMode && plusAnchor.visible && (
            <div
              style={{ top: plusAnchor.top }}
              className="absolute left-3 z-30"
            >
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:bg-zinc-100"
                aria-label="Insert block"
              >
                +
              </button>
              <BlockInsertMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                onInsert={insertBlockFromMenu}
              />
            </div>
          )}

          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
