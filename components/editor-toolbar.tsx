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
        inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200
        ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-600"}
        ${!isDisabled && !isActive ? "hover:bg-gray-100" : ""}
        ${isDisabled ? "cursor-not-allowed opacity-40" : ""}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      `}
      aria-label={label}
      aria-pressed={isActive}
    >
      {icon}
    </button>
  );
}

function Separator() {
  return <div className="h-6 w-px bg-gray-200" />;
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
  const iconSize = 18;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-2 shadow-sm">
      {/* Undo/Redo */}
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

      <Separator />

      {/* Text Formatting */}
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

      <Separator />

      {/* Headings */}
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
      <ToolbarButton
        icon={<Heading3 size={iconSize} />}
        label="Heading 3"
        isActive={isHeading3}
        isDisabled={!canHeading3}
        onClick={onHeading3}
      />

      <Separator />

      {/* Lists */}
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

      <Separator />

      {/* Blocks */}
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
      <ToolbarButton
        icon={<Minus size={iconSize} />}
        label="Divider"
        isActive={false}
        isDisabled={!canHorizontalRule}
        onClick={onHorizontalRule}
      />

      <Separator />

      {/* Colors */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-600 px-2">Text:</label>
        <input
          type="color"
          defaultValue="#000000"
          onChange={(e) => onTextColor(e.target.value)}
          title="Text Color"
          className="h-8 w-8 cursor-pointer rounded border border-gray-200 p-1"
        />
      </div>

      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-600 px-2">Highlight:</label>
        <input
          type="color"
          defaultValue="#FFFF00"
          onChange={(e) => onHighlightColor(e.target.value)}
          title="Highlight Color"
          className="h-8 w-8 cursor-pointer rounded border border-gray-200 p-1"
        />
      </div>
    </div>
  );
}
