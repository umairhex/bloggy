'use client';

import React, { useState } from 'react';
import { type Editor } from '@tiptap/react';
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
  Bot,
  Copy,
  Check as CheckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
  hideOnMobile?: boolean;
}

const getPromptText = () => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `Generate a blog post about [TOPIC].

Do's based on research:
- Base all facts strictly on verified, credible research as of ${today}.
- Focus on E-E-A-T (Expertise, Authoritativeness, Trustworthiness) with clear, source-validated arguments.
- Structure content with a single H1, followed by a logical hierarchy of H2/H3 subheadings and short, scannable paragraphs.
- Output the post body in standard Markdown format (no HTML tags) as normal text.

Don'ts based on research:
- Do not use outdated keyword stuffing; prioritize search intent and semantic topical coverage.
- Do not include unverified claims, personal assumptions, or outdated redundant data.
- Do not wrap content in HTML tags or containers.

Output exactly in this format:

Title: [Post Title]
Slug: [url-slug]
Excerpt: [Brief summary under 160 chars]
SEO Title: [SEO Title under 60 chars]
SEO Description: [SEO Description under 160 chars]
Tags: [comma-separated tags]

---

[Article content with headers and paragraphs. Keep it normal Markdown text.]`;
};

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [isHelperOpen, setIsHelperOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!editor) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(getPromptText());
    setCopied(true);
    toast.success('Prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const groups: ToolbarButton[][] = [
    [
      {
        label: 'Undo',
        icon: <Undo size={14} />,
        action: () => editor.chain().focus().undo().run(),
        disabled: !editor.can().undo(),
      },
      {
        label: 'Redo',
        icon: <Redo size={14} />,
        action: () => editor.chain().focus().redo().run(),
        disabled: !editor.can().redo(),
      },
    ],
    [
      {
        label: 'Bold',
        icon: <Bold size={14} />,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive('bold'),
      },
      {
        label: 'Italic',
        icon: <Italic size={14} />,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive('italic'),
      },
      {
        label: 'Underline',
        icon: <Underline size={14} />,
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive('underline'),
        hideOnMobile: true,
      },
      {
        label: 'Strikethrough',
        icon: <Strikethrough size={14} />,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive('strike'),
        hideOnMobile: true,
      },
      {
        label: 'Inline Code',
        icon: <Code size={14} />,
        action: () => editor.chain().focus().toggleCode().run(),
        isActive: editor.isActive('code'),
      },
    ],
    [
      {
        label: 'Heading 2',
        icon: <Heading2 size={14} />,
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive('heading', { level: 2 }),
      },
      {
        label: 'Heading 3',
        icon: <Heading3 size={14} />,
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive('heading', { level: 3 }),
        hideOnMobile: true,
      },
    ],
    [
      {
        label: 'Bullet List',
        icon: <List size={14} />,
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive('bulletList'),
      },
      {
        label: 'Numbered List',
        icon: <ListOrdered size={14} />,
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive('orderedList'),
        hideOnMobile: true,
      },
      {
        label: 'Blockquote',
        icon: <Quote size={14} />,
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: editor.isActive('blockquote'),
        hideOnMobile: true,
      },
      {
        label: 'Divider',
        icon: <Minus size={14} />,
        action: () => editor.chain().focus().setHorizontalRule().run(),
        hideOnMobile: true,
      },
    ],
    [
      {
        label: 'AI Helper',
        icon: <Bot size={14} className="text-primary" />,
        action: () => setIsHelperOpen(true),
      },
    ],
  ];

  return (
    <>
      <div className="overflow-x-auto border-b border-hairline bg-surface-soft px-md py-sm">
        <div className="flex items-center gap-xs min-w-max md:flex-wrap">
          {groups.map((group, gi) => (
            <React.Fragment key={gi}>
              {gi > 0 && <Separator orientation="vertical" className="h-5 mx-xs bg-hairline" />}
              <div className="flex items-center gap-xs">
                {group.map((btn) => (
                  <Button
                    key={btn.label}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 shrink-0 rounded-sm transition-colors ${
                      btn.hideOnMobile ? 'hidden md:inline-flex' : ''
                    } ${
                      btn.isActive
                        ? 'bg-primary text-on-primary hover:bg-primary-active'
                        : 'text-body hover:text-ink hover:bg-hairline cursor-pointer'
                    }`}
                    onClick={btn.action}
                    disabled={btn.disabled}
                    aria-label={btn.label}
                  >
                    {btn.icon}
                  </Button>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <Dialog open={isHelperOpen} onOpenChange={setIsHelperOpen}>
        <DialogContent className="border-hairline bg-canvas sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ink font-serif text-title-md font-semibold flex items-center gap-md">
              <Bot size={18} className="text-primary shrink-0" />
              AI Blog Assistant
            </DialogTitle>
            <DialogDescription className="text-body text-xs leading-relaxed">
              Copy this structured prompt to your preferred AI tool to generate perfectly formatted blog fields.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-base">
            <div className="relative rounded-sm bg-surface-soft border border-hairline p-md font-mono text-xs text-body leading-relaxed whitespace-pre-wrap select-all max-h-48 overflow-y-auto">
              {getPromptText()}
            </div>

            <p className="text-[10px] text-muted leading-relaxed">
              Once generated, you can copy each property (Title, Slug, Excerpt, SEO Title, SEO Description, Tags, and Content) directly into their respective form fields.
            </p>
          </div>

          <div className="flex gap-xs justify-end mt-md">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHelperOpen(false)}
              className="border-hairline text-ink text-xs h-9"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleCopy}
              className="bg-primary hover:bg-primary-active text-white gap-md text-xs h-9 cursor-pointer"
            >
              {copied ? <CheckIcon size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Prompt'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
