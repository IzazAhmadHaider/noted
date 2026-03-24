"use client";

type InsertOption = {
  key: "heading" | "paragraph" | "bulletList";
  label: string;
};

const INSERT_OPTIONS: InsertOption[] = [
  { key: "heading", label: "Heading" },
  { key: "paragraph", label: "Paragraph" },
  { key: "bulletList", label: "Bullet list" },
];

type BlockInsertMenuProps = {
  open: boolean;
  onClose: () => void;
  onInsert: (option: InsertOption["key"]) => void;
};

export function BlockInsertMenu({
  open,
  onClose,
  onInsert,
}: BlockInsertMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute left-0 top-9 z-10 w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
      {INSERT_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => {
            onInsert(option.key);
            onClose();
          }}
          className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
