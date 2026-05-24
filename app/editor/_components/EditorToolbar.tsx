"use client";

import React from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const groups: ToolbarButton[][] = [
    [
      {
        label: "Undo",
        icon: <Undo size={14} />,
        action: () => editor.chain().focus().undo().run(),
        disabled: !editor.can().undo(),
      },
      {
        label: "Redo",
        icon: <Redo size={14} />,
        action: () => editor.chain().focus().redo().run(),
        disabled: !editor.can().redo(),
      },
    ],
    [
      {
        label: "Bold",
        icon: <Bold size={14} />,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
      },
      {
        label: "Italic",
        icon: <Italic size={14} />,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
      },
      {
        label: "Underline",
        icon: <Underline size={14} />,
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive("underline"),
      },
      {
        label: "Strikethrough",
        icon: <Strikethrough size={14} />,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive("strike"),
      },
      {
        label: "Inline Code",
        icon: <Code size={14} />,
        action: () => editor.chain().focus().toggleCode().run(),
        isActive: editor.isActive("code"),
      },
    ],
    [
      {
        label: "Heading 2",
        icon: <Heading2 size={14} />,
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
      },
      {
        label: "Heading 3",
        icon: <Heading3 size={14} />,
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive("heading", { level: 3 }),
      },
    ],
    [
      {
        label: "Bullet List",
        icon: <List size={14} />,
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive("bulletList"),
      },
      {
        label: "Numbered List",
        icon: <ListOrdered size={14} />,
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive("orderedList"),
      },
      {
        label: "Blockquote",
        icon: <Quote size={14} />,
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: editor.isActive("blockquote"),
      },
      {
        label: "Divider",
        icon: <Minus size={14} />,
        action: () => editor.chain().focus().setHorizontalRule().run(),
      },
    ],
  ];

  return (
    <div className="flex items-center flex-wrap gap-xs px-md py-sm border-b border-hairline bg-surface-soft">
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && (
            <Separator orientation="vertical" className="h-5 mx-xs bg-hairline" />
          )}
          <div className="flex items-center gap-xs">
            {group.map((btn) => (
              <Tooltip key={btn.label}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-sm transition-colors ${
                      btn.isActive
                        ? "bg-primary text-on-primary hover:bg-primary-active"
                        : "text-body hover:text-ink hover:bg-hairline"
                    }`}
                    onClick={btn.action}
                    disabled={btn.disabled}
                    aria-label={btn.label}
                  >
                    {btn.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {btn.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
