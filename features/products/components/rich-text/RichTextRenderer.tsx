import sanitizeHtml from "sanitize-html";
import { cn } from "@/lib/utils";

const SANITIZE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "s",
    "del",
    "a",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "blockquote",
    "code",
    "pre",
    "hr",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  },
};

interface RichTextRendererProps {
  html: string;
  className?: string;
}

export function RichTextRenderer({ html, className }: RichTextRendererProps) {
  const clean = sanitizeHtml(html, SANITIZE_CONFIG);

  if (!clean || clean === "<p></p>") return null;

  return (
    <div
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
