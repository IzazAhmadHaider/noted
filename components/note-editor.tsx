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

type EditorToolbarProps = {
  canBold: boolean;
  canToggleHeading: boolean;
  canToggleBulletList: boolean;
  isBold: boolean;
  isHeading: boolean;
  isBulletList: boolean;
  onBold: () => void;
  onHeading: (level: number) => void;
  onBulletList: () => void;
};

const DEFAULT_NOTE: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

type NotePage = {
  id: string;
  title: string;
  pageNumber: number;
  content: JSONContent;
};



export function NoteEditor({ userId }: { userId: string }) {
  const [pages, setPages] = useState<NotePage[]>([]);
  const [activePageId, setActivePageId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
      TaskList,
      TaskItem,
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    [],
  );

  const createFirstPage = useCallback(async (): Promise<NotePage | null> => {
    const firstPageId = crypto.randomUUID();

    const { data, error } = await supabase
      .from("pages")
      .insert([
        {
          id: firstPageId,
          title: "Page 1",
          page_number: 1,
          content_json: DEFAULT_NOTE,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating first page:", error.message);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      pageNumber: data.page_number,
      content: data.content_json,
    };
  }, [userId]);

  const loadPages = useCallback(async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("user_id", userId)
      .order("page_number", { ascending: true });

    if (error) {
      console.error("Error loading pages:", error.message);
      setIsLoading(false);
      return;
    }

    const mappedPages: NotePage[] =
      data?.map(
        (page: {
          id: string;
          title: string;
          page_number: number;
          content_json: JSONContent;
        }) => ({
          id: page.id,
          title: page.title,
          pageNumber: page.page_number,
          content: page.content_json,
        }),
      ) ?? [];

    if (mappedPages.length > 0) {
      setPages(mappedPages);
      setActivePageId(mappedPages[0].id);
    } else {
      const firstPage = await createFirstPage();
      if (firstPage) {
        setPages([firstPage]);
        setActivePageId(firstPage.id);
      }
    }

    setIsLoading(false);
  }, [createFirstPage, userId]);

  const savePageToSupabase = useCallback(
    async (pageId: string, content: JSONContent) => {
      const { error } = await supabase
        .from("pages")
        .update({
          content_json: content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pageId);

      if (error) {
        console.error("Error saving page:", error.message);
      }
    },
    [],
  );

  const editor = useEditor({
    extensions,
    content: DEFAULT_NOTE,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "noted-editor min-h-[68vh] focus:outline-none px-12 py-8",
      },
    },
    onCreate: ({ editor: createdEditor }) => {
      if (activePage?.content) {
        createdEditor.commands.setContent(activePage.content, {
          emitUpdate: false,
        });
      }
    },
    onUpdate: ({ editor: updatedEditor }) => {
      if (skipSaveForHydrationRef.current) {
        skipSaveForHydrationRef.current = false;
        return;
      }

      if (!activePageId) return;

      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(async () => {
        const json = updatedEditor.getJSON();

        setPages((prevPages) =>
          prevPages.map((page) =>
            page.id === activePageId ? { ...page, content: json } : page,
          ),
        );

        await savePageToSupabase(activePageId, json);
      }, 500);
    },
  });

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    if (!editor) return;
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
    if (!editor || !activePage) return;

    skipSaveForHydrationRef.current = true;
    editor.commands.setContent(activePage.content || DEFAULT_NOTE, {
      emitUpdate: false,
    });
  }, [activePage, editor]);

  const createNewPage = useCallback(async () => {
    const nextPageNumber = pages.length + 1;
    const newPageId = crypto.randomUUID();

    const { data, error } = await supabase
      .from("pages")
      .insert([
        {
          id: newPageId,
          title: `Page ${nextPageNumber}`,
          page_number: nextPageNumber,
          content_json: DEFAULT_NOTE,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating page:", error.message);
      return;
    }

    const newPage: NotePage = {
      id: data.id,
      title: data.title,
      pageNumber: data.page_number,
      content: data.content_json,
    };

    setPages((prev) => [...prev, newPage]);
    setActivePageId(newPage.id);
    setIsEditMode(true);
  }, [pages.length, userId]);



  const insertBlockFromMenu = useCallback(
    (type: "heading" | "paragraph" | "bulletList") => {
      if (!editor) return;

      const actions = {
        heading: () =>
          editor
            .chain()
            .focus()
            .insertContent([
              {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "Heading" }],
              },
              { type: "paragraph" },
            ])
            .run(),
        paragraph: () =>
          editor
            .chain()
            .focus()
            .insertContent([
              {
                type: "paragraph",
                content: [{ type: "text", text: "Write something..." }],
              },
            ])
            .run(),
        bulletList: () =>
          editor
            .chain()
            .focus()
            .insertContent([
              {
                type: "bulletList",
                content: [
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "List item" }],
                      },
                    ],
                  },
                ],
              },
              { type: "paragraph" },
            ])
            .run(),
      };

      actions[type]();
      setMenuOpen(false);
    },
    [editor],
  );

  if (isLoading || !editor) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-8 text-sm text-zinc-500 md:px-8">
        Loading pages...
      </div>
    );
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
                {page.pageNumber}. {page.title}
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
            onClick={() => setIsEditMode((prev) => !prev)}
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
            canItalic={editor.can().chain().focus().toggleItalic().run()}
            canUnderline={editor.can().chain().focus().toggleUnderline().run()}
            canStrike={editor.can().chain().focus().toggleStrike().run()}
            canHeading1={editor
              .can()
              .chain()
              .focus()
              .toggleHeading({ level: 1 })
              .run()}
            canHeading2={editor
              .can()
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()}
            canHeading3={editor
              .can()
              .chain()
              .focus()
              .toggleHeading({ level: 3 })
              .run()}
            canBulletList={editor
              .can()
              .chain()
              .focus()
              .toggleBulletList()
              .run()}
            canOrderedList={editor
              .can()
              .chain()
              .focus()
              .toggleOrderedList()
              .run()}
            canTaskList={editor.can().chain().focus().toggleTaskList().run()}
            canBlockquote={editor
              .can()
              .chain()
              .focus()
              .toggleBlockquote()
              .run()}
            canCodeBlock={editor.can().chain().focus().toggleCodeBlock().run()}
            canHorizontalRule={editor
              .can()
              .chain()
              .focus()
              .setHorizontalRule()
              .run()}
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
            onHeading1={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            onHeading2={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            onHeading3={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            onBulletList={() => editor.chain().focus().toggleBulletList().run()}
            onOrderedList={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            onTaskList={() => editor.chain().focus().toggleTaskList().run()}
            onBlockquote={() => editor.chain().focus().toggleBlockquote().run()}
            onCodeBlock={() => editor.chain().focus().toggleCodeBlock().run()}
            onHorizontalRule={() =>
              editor.chain().focus().setHorizontalRule().run()
            }
            onUndo={() => editor.chain().focus().undo().run()}
            onRedo={() => editor.chain().focus().redo().run()}
            onTextColor={(color) =>
              editor.chain().focus().setColor(color).run()
            }
            onHighlightColor={(color) =>
              editor.chain().focus().toggleHighlight({ color }).run()
            }
          />
        </div>

        <div
          ref={editorWrapRef}
          className={[
            "relative rounded-2xl border border-transparent bg-white transition-all duration-200",
            isEditMode ? "border-zinc-200 shadow-sm" : "",
          ].join(" ")}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
