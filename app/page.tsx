import { NoteEditor } from "@/components/note-editor";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-zinc-50 to-white text-zinc-900">
      <NoteEditor />
    </main>
  );
}
