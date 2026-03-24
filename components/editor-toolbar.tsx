"use client";

type EditorToolbarProps = {
  canBold: boolean;
  canToggleHeading: boolean;
  canToggleBulletList: boolean;
  isBold: boolean;
  isHeading: boolean;
  isBulletList: boolean;
  onBold: () => void;
  onHeading: () => void;
  onBulletList: () => void;
};

const TOOLBAR_ITEMS = [
  { key: "bold", label: "Bold" },
  { key: "heading", label: "Heading" },
  { key: "bulletList", label: "List" },
] as const;

export function EditorToolbar({
  canBold,
  canToggleHeading,
  canToggleBulletList,
  isBold,
  isHeading,
  isBulletList,
  onBold,
  onHeading,
  onBulletList,
}: EditorToolbarProps) {
  const stateMap = {
    bold: { can: canBold, active: isBold, onClick: onBold },
    heading: { can: canToggleHeading, active: isHeading, onClick: onHeading },
    bulletList: {
      can: canToggleBulletList,
      active: isBulletList,
      onClick: onBulletList,
    },
  };

  return (
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 p-1.5 shadow-sm backdrop-blur transition-all">
      {TOOLBAR_ITEMS.map((item) => {
        const state = stateMap[item.key];

        return (
          <button
            key={item.key}
            type="button"
            onClick={state.onClick}
            disabled={!state.can}
            className={[
              "rounded-md px-2.5 py-1.5 text-sm transition-colors",
              state.active ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-700",
              !state.can ? "cursor-not-allowed opacity-50" : "hover:bg-zinc-100",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
