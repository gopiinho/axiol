import { Link, FileText, ImageIcon, type LucideIcon } from "lucide-react";

const TYPE_ICONS: Record<string, LucideIcon> = {
  affiliate: Link,
  digital: FileText,
  course: ImageIcon,
};

export function getProductTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    affiliate: "Affiliate",
    digital: "Digital Product",
    course: "Course",
  };
  return labels[type] ?? type;
}

interface ProductTypeIconProps {
  type: string;
  className?: string;
}

export function ProductTypeIcon({ type, className }: ProductTypeIconProps) {
  const Icon = TYPE_ICONS[type];
  if (!Icon) return null;
  return <Icon className={className ?? "h-4 w-4"} />;
}
