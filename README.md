## Notivo

Minimal single-page note-taking app built with Next.js, React, TipTap, and Tailwind CSS.

### Features

- Single screen with clean paper-like layout
- Read-only mode by default with top `Edit` toggle
- Full-page rich text editing (bold, heading, bullet list)
- Notion-style `+` button near the current line in edit mode
- Auto-save to `localStorage` (no backend)

## Run Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

- Editor content is saved automatically in your browser using `localStorage`.
- Storage key: `notivo.document.v1`.

## Project Structure

- `app/page.tsx`: single-screen app entry
- `components/note-editor.tsx`: main editor/read mode behavior
- `components/editor-toolbar.tsx`: minimal formatting controls
- `components/block-insert-menu.tsx`: line-level add menu (`+`)
