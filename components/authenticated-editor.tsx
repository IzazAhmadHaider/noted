"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NoteEditor } from "@/components/note-editor";

type ThemeMode = "light" | "dark";

export function AuthenticatedEditor() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("notivo-theme") as ThemeMode | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("notivo-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => current === "dark" ? "light" : "dark");
  }, []);

  if (loading) {
    return (
      <>
        <style>{LOAD_STYLES}</style>
        <div className="ae-loading">
          <div className="ae-load-dots">
            <span /><span /><span />
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;

  const username = user.email?.split("@")[0] ?? "—";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <>
      <style>{STYLES}</style>
      <div className="ae-shell">
        {/* ── Nav ── */}
        <nav className="ae-nav">
          {/* Brand */}
          <div className="ae-brand">
            <div className="ae-brand-mark">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.5 2.5l2 2L5 13l-3 1 1-3z"/>
              </svg>
            </div>
            <div className="ae-brand-text">
              <span className="ae-brand-name">Notivo</span>
              <span className="ae-brand-sub">your private space</span>
            </div>
          </div>

          {/* User */}
          <div className="ae-user">
            <div className="ae-user-info">
              <span className="ae-user-name">{username}</span>
              <span className="ae-user-email">{user.email}</span>
            </div>
            <div className="ae-avatar" aria-label={username}>{initials}</div>
            <button
              type="button"
              className="ae-theme-toggle"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
            <button
              type="button"
              className="ae-signout"
              onClick={signOut}
              aria-label="Sign out"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3"/>
                <polyline points="10,4 14,8 10,12"/>
                <line x1="5" y1="8" x2="14" y2="8"/>
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </nav>

        {/* ── Editor ── */}
        <div className="ae-body">
          <NoteEditor userId={user.id} />
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap');

  @keyframes ae-fade {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ae-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg);
    overflow: hidden;
    font-family: 'Geist Mono', ui-monospace, monospace;
  }

  /* ── Nav ── */
  .ae-nav {
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    animation: ae-fade 0.4s cubic-bezier(0.16,1,0.3,1) both;
    position: relative;
    z-index: 30;
  }

  /* Brand */
  .ae-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .ae-brand-mark {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent), 0 2px 8px color-mix(in srgb, var(--accent) 18%, transparent);
  }
  .ae-brand-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .ae-brand-name {
    font-family: 'Instrument Serif', serif;
    font-size: 1rem;
    color: var(--text);
    line-height: 1;
    letter-spacing: 0.01em;
  }
  .ae-brand-sub {
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-faint);
    line-height: 1;
  }

  /* User section */
  .ae-user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .ae-user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }
  .ae-user-name {
    font-size: 0.75rem;
    color: var(--text);
    letter-spacing: 0.02em;
  }
  .ae-user-email {
    font-size: 0.6rem;
    color: var(--text-faint);
    letter-spacing: 0.04em;
  }
  @media (max-width: 480px) {
    .ae-user-info { display: none; }
  }

  .ae-avatar {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--accent-dim);
    border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
    color: var(--accent);
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
  }

  .ae-theme-toggle,
  .ae-signout {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.38rem 0.75rem;
    background: transparent;
    border: 1px solid var(--border2);
    border-radius: 7px;
    color: var(--text-faint);
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .ae-theme-toggle {
    color: var(--text-soft);
  }
  .ae-theme-toggle:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
  .ae-signout:hover {
    border-color: var(--text-faint);
    color: var(--text);
    background: var(--surface2);
  }
  .ae-signout:active {
    transform: scale(0.96);
  }
  @media (max-width: 480px) {
    .ae-theme-toggle span,
    .ae-signout span { display: none; }
    .ae-theme-toggle,
    .ae-signout { padding: 0.38rem 0.55rem; }
  }

  /* ── Body ── */
  .ae-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`;

const LOAD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300&display=swap');

  @keyframes ae-dot {
    0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
    40%           { opacity: 1;   transform: translateY(-4px); }
  }

  .ae-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--bg);
  }
  .ae-load-dots {
    display: flex;
    gap: 6px;
  }
  .ae-load-dots span {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: ae-dot 1.2s ease-in-out infinite;
  }
  .ae-load-dots span:nth-child(2) { animation-delay: 0.2s; }
  .ae-load-dots span:nth-child(3) { animation-delay: 0.4s; }
`;
