"use client";

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";

type EditorToolbarProps = {
  canBold: boolean;
  canItalic: boolean;
  canUnderline: boolean;
  canStrike: boolean;
  canHeading1: boolean;
  canHeading2: boolean;
  canHeading3: boolean;
  canBulletList: boolean;
  canOrderedList: boolean;
  canTaskList: boolean;
  canBlockquote: boolean;
  canCodeBlock: boolean;
  canHorizontalRule: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isHeading1: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isTaskList: boolean;
  isBlockquote: boolean;
  isCodeBlock: boolean;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrike: () => void;
  onHeading1: () => void;
  onHeading2: () => void;
  onHeading3: () => void;
  onBulletList: () => void;
  onOrderedList: () => void;
  onTaskList: () => void;
  onBlockquote: () => void;
  onCodeBlock: () => void;
  onHorizontalRule: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTextColor: (color: string) => void;
  onHighlightColor: (color: string) => void;
};

interface ToolbarButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  group: "text" | "headings" | "lists" | "blocks" | "history";
}

function ToolbarButton({
  icon,
  label,
  isActive,
  isDisabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-lg p-1.5 sm:p-2 transition-all duration-200 text-sm sm:text-base
        ${isActive ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/25" : "text-slate-600 hover:bg-slate-100"}
        ${!isDisabled && !isActive ? "hover:text-slate-900" : ""}
        ${isDisabled ? "cursor-not-allowed opacity-40" : ""}
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
      `}
      aria-label={label}
      aria-pressed={isActive}
    >
      {icon}
    </button>
  );
}

function Separator() {
  return <div className="h-4 sm:h-6 w-px bg-slate-300" />;
}

export function EditorToolbar({
  canBold,
  canItalic,
  canUnderline,
  canStrike,
  canHeading1,
  canHeading2,
  canHeading3,
  canBulletList,
  canOrderedList,
  canTaskList,
  canBlockquote,
  canCodeBlock,
  canHorizontalRule,
  canUndo,
  canRedo,
  isBold,
  isItalic,
  isUnderline,
  isStrike,
  isHeading1,
  isHeading2,
  isHeading3,
  isBulletList,
  isOrderedList,
  isTaskList,
  isBlockquote,
  isCodeBlock,
  onBold,
  onItalic,
  onUnderline,
  onStrike,
  onHeading1,
  onHeading2,
  onHeading3,
  onBulletList,
  onOrderedList,
  onTaskList,
  onBlockquote,
  onCodeBlock,
  onHorizontalRule,
  onUndo,
  onRedo,
  onTextColor,
  onHighlightColor,
}: EditorToolbarProps) {
  const iconSize = 16;

  return (
    <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-2 sm:p-3 shadow-sm">
      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToolbarButton
          icon={<Undo2 size={iconSize} />}
          label="Undo"
          isActive={false}
          isDisabled={!canUndo}
          onClick={onUndo}
        />
        <ToolbarButton
          icon={<Redo2 size={iconSize} />}
          label="Redo"
          isActive={false}
          isDisabled={!canRedo}
          onClick={onRedo}
        />
      </div>

      <Separator />

      {/* Text Formatting */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToolbarButton
          icon={<Bold size={iconSize} />}
          label="Bold"
          isActive={isBold}
          isDisabled={!canBold}
          onClick={onBold}
        />
        <ToolbarButton
          icon={<Italic size={iconSize} />}
          label="Italic"
          isActive={isItalic}
          isDisabled={!canItalic}
          onClick={onItalic}
        />
        <ToolbarButton
          icon={<Underline size={iconSize} />}
          label="Underline"
          isActive={isUnderline}
          isDisabled={!canUnderline}
          onClick={onUnderline}
        />
        <ToolbarButton
          icon={<Strikethrough size={iconSize} />}
          label="Strikethrough"
          isActive={isStrike}
          isDisabled={!canStrike}
          onClick={onStrike}
        />
      </div>

      <Separator />

      {/* Headings - Hide H3 on mobile */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToolbarButton
          icon={<Heading1 size={iconSize} />}
          label="Heading 1"
          isActive={isHeading1}
          isDisabled={!canHeading1}
          onClick={onHeading1}
        />
        <ToolbarButton
          icon={<Heading2 size={iconSize} />}
          label="Heading 2"
          isActive={isHeading2}
          isDisabled={!canHeading2}
          onClick={onHeading2}
        />
        <span className="hidden sm:inline">
          <ToolbarButton
            icon={<Heading3 size={iconSize} />}
            label="Heading 3"
            isActive={isHeading3}
            isDisabled={!canHeading3}
            onClick={onHeading3}
          />
        </span>
      </div>

      <Separator />

      {/* Lists */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToolbarButton
          icon={<List size={iconSize} />}
          label="Bullet List"
          isActive={isBulletList}
          isDisabled={!canBulletList}
          onClick={onBulletList}
        />
        <ToolbarButton
          icon={<ListOrdered size={iconSize} />}
          label="Ordered List"
          isActive={isOrderedList}
          isDisabled={!canOrderedList}
          onClick={onOrderedList}
        />
        <ToolbarButton
          icon={<CheckSquare size={iconSize} />}
          label="Task List"
          isActive={isTaskList}
          isDisabled={!canTaskList}
          onClick={onTaskList}
        />
      </div>

      <Separator />

      {/* Blocks - Hide Divider on mobile */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToolbarButton
          icon={<Quote size={iconSize} />}
          label="Blockquote"
          isActive={isBlockquote}
          isDisabled={!canBlockquote}
          onClick={onBlockquote}
        />
        <ToolbarButton
          icon={<Code2 size={iconSize} />}
          label="Code Block"
          isActive={isCodeBlock}
          isDisabled={!canCodeBlock}
          onClick={onCodeBlock}
        />
        <span className="hidden sm:inline">
          <ToolbarButton
            icon={<Minus size={iconSize} />}
            label="Divider"
            isActive={false}
            isDisabled={!canHorizontalRule}
            onClick={onHorizontalRule}
          />
        </span>
      </div>

      <Separator />

      {/* Colors */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <span className="hidden sm:inline text-xs font-medium text-slate-600 px-0.5 sm:px-1">🎨</span>
          <input
            type="color"
            defaultValue="#000000"
            onChange={(e) => onTextColor(e.target.value)}
            title="Text Color"
            className="h-6 sm:h-7 w-6 sm:w-7 cursor-pointer rounded-lg border border-slate-200 p-0.5 hover:border-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <span className="hidden sm:inline text-xs font-medium text-slate-600 px-0.5 sm:px-1">✏️</span>
          <input
            type="color"
            defaultValue="#FFFF00"
            onChange={(e) => onHighlightColor(e.target.value)}
            title="Highlight Color"
            className="h-6 sm:h-7 w-6 sm:w-7 cursor-pointer rounded-lg border border-slate-200 p-0.5 hover:border-slate-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
