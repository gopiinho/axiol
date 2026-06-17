"use client";

import { cn } from "@/lib/utils";
import { Link, Lock, ImageIcon, FileText } from "lucide-react";

interface ProductTypeOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const TYPES: ProductTypeOption[] = [
  {
    value: "digital",
    label: "Digital Product",
    description: "Sell PDFs, templates, and downloads",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    value: "affiliate",
    label: "Affiliate",
    description: "Refer products and earn commissions",
    icon: <Link className="h-5 w-5" />,
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

export function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
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
              "relative flex flex-col gap-2 rounded-xs border p-4 text-left transition-all duration-200",
              type.comingSoon && "cursor-not-allowed opacity-40",
              !type.comingSoon && "hover:border-primary/50 cursor-pointer hover:shadow-xs",
              selected ? "bg-foreground text-background" : "bg-card border-border"
            )}
          >
            {type.comingSoon && (
              <span className="text-muted-foreground absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase">
                <Lock className="h-3 w-3" />
                Soon
              </span>
            )}
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xs",
                selected ? "bg-primary text-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {type.icon}
            </div>
            <div>
              <p className="font-bold">{type.label}</p>
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  selected ? "text-card/70" : "text-muted-foreground"
                )}
              >
                {type.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
