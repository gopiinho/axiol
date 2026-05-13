"use client";

import { cn } from "@/lib/utils";
import { MousePointer2, Lock, ImageIcon, FileText } from "lucide-react";

interface ProductTypeOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const TYPES: ProductTypeOption[] = [
  {
    value: "affiliate",
    label: "Affiliate",
    description: "Refer products and earn commissions",
    icon: <MousePointer2 className="h-5 w-5" />,
  },
  {
    value: "digital",
    label: "Digital Product",
    description: "Sell PDFs, templates, and downloads",
    icon: <FileText className="h-5 w-5" />,
    comingSoon: true,
  },
  {
    value: "course",
    label: "Course",
    description: "Teach with video lessons and materials",
    icon: <ImageIcon className="h-5 w-5" />,
    comingSoon: true,
  },
];

interface ProductTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductTypeSelector({
  value,
  onChange,
}: ProductTypeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {TYPES.map((type) => {
        const selected = value === type.value;
        return (
          <button
            key={type.value}
            type="button"
            disabled={type.comingSoon}
            onClick={() => onChange(type.value)}
            className={cn(
              "relative flex flex-col gap-2 p-4 border rounded-xs text-left transition-all duration-200",
              type.comingSoon && "opacity-40 cursor-not-allowed",
              !type.comingSoon &&
                "cursor-pointer hover:border-primary/50 hover:shadow-xs",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "bg-card border-border",
            )}
          >
            {type.comingSoon && (
              <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3 w-3" />
                Soon
              </span>
            )}
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-xs",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {type.icon}
            </div>
            <div>
              <p className="font-semibold text-sm">{type.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {type.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
