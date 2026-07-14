"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Bold, Italic, Strikethrough, Link, List, ListOrdered, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getRichTextExtensions } from "./extensions";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-7 w-7 items-center cursor-pointer justify-center rounded-xs transition-colors",
        active
          ? "text-primary"
          : "text-background hover:bg-secondary hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

type InputMode = "link" | null;

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className,
}: RichTextEditorProps) {
  const [activeInput, setActiveInput] = useState<InputMode>(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: getRichTextExtensions({ placeholder }),
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[80px] px-3 py-2 outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (activeInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeInput]);

  const openLinkInput = useCallback(() => {
    if (!editor) return;

    if (activeInput === "link") {
      setActiveInput(null);
      return;
    }

    const existing = editor.getAttributes("link").href as string | undefined;
    setInputValue(existing ?? "");
    setActiveInput("link");
  }, [editor, activeInput]);

  const saveLink = useCallback(() => {
    if (!editor) return;

    const url = inputValue.trim();

    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url.startsWith("http") ? url : `https://${url}` })
        .run();
    }

    setActiveInput(null);
    setInputValue("");
  }, [editor, inputValue]);

  const cancelInput = useCallback(() => {
    setActiveInput(null);
    setInputValue("");
  }, []);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveLink();
      }
      if (e.key === "Escape") {
        cancelInput();
      }
    },
    [saveLink, cancelInput]
  );

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-border/60 bg-card/90 overflow-hidden rounded-xs border transition-[color,box-shadow,transform]",
        "",
        className
      )}
    >
      <div className="border-border/60 bg-foreground flex items-center gap-0.5 border-b px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          label="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="bg-border/60 mx-0.5 h-4 w-px" />

        <ToolbarButton
          onClick={openLinkInput}
          active={activeInput === "link" || editor.isActive("link")}
          label="Link"
        >
          <Link className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {activeInput && (
        <div className="border-border/60 flex items-center gap-2 border-b px-3 py-2">
          <Label className="text-muted-foreground shrink-0 text-xs font-semibold">Link URL</Label>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="https://example.com"
            className="flex-1 text-sm"
          />
          <button
            type="button"
            onClick={saveLink}
            className="bg-primary/10 text-primary hover:bg-primary/20 flex h-7 w-7 shrink-0 items-center justify-center rounded-xs transition-colors"
            aria-label="Save"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={cancelInput}
            className="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-xs transition-colors"
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
