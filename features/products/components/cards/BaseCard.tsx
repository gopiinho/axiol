import Link from "next/link";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThumbnailImage({
  url,
  alt,
  className,
  fallbackClassName,
}: {
  url?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "from-primary/10 to-pink/10 flex items-center justify-center bg-linear-to-br",
        className,
        fallbackClassName
      )}
    >
      <Package className="text-muted-foreground/40 h-8 w-8" />
    </div>
  );
}

export function CardLink({
  href,
  interactive,
  children,
  className,
}: {
  href?: string;
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (interactive && href) {
    return (
      <Link href={href} className={cn("block", className)}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}
