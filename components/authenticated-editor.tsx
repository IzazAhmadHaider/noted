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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Header */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
              <span className="text-sm sm:text-lg font-bold text-white">✎</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Noted</h1>
              <p className="text-xs text-slate-500">Your private notes</p>
            </div>
            <h1 className="sm:hidden text-base font-bold text-slate-900">Noted</h1>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs sm:text-sm font-medium text-slate-900">{user.email?.split("@")[0]}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </nav>

      <NoteEditor userId={user.id} />
    </main>
  );
}
