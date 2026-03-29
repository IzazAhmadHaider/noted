import { JSONContent } from "@tiptap/react";

export type NotePage = {
  id: string;
  title: string;
  pageNumber: number;
  content: JSONContent;
};

export const DEFAULT_NOTE: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};