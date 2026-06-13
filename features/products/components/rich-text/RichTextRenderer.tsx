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
  style?: React.CSSProperties;
}

export function RichTextRenderer({ html, className, style }: RichTextRendererProps) {
  const clean = sanitizeHtml(html, SANITIZE_CONFIG);

  if (!clean || clean === "<p></p>") return null;

  return (
    <div
      className={cn("max-w-none space-y-3 leading-relaxed", className)}
      style={style}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
