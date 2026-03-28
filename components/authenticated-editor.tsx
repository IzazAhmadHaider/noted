"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { NoteEditor } from "@/components/note-editor";

export function AuthenticatedEditor() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-zinc-50 to-white text-zinc-900">
      <div className="absolute right-4 top-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">{user.email}</span>
          <button
            onClick={signOut}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
          >
            Sign Out
          </button>
        </div>
      </div>
      <NoteEditor userId={user.id} />
    </main>
  );
}
