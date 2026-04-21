import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap text-sm font-bold transition-all duration-200 active:scale-[0.96] active:duration-75 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-primary/70 bg-primary text-primary-foreground text-foreground hover:bg-primary/90",
        destructive:
          "border border-destructive/60 bg-destructive text-white shadow-[0_2px_8px_-2px_oklch(0.59_0.24_28/0.35)] hover:-translate-y-0.5 hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border border-border/90 bg-card text-foreground shadow-sm hover:-translate-y-0.5 hover:bg-secondary hover:border-border",
        secondary:
          "border border-border/70 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "border border-transparent text-muted-foreground hover:border-border/80 hover:bg-card hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 px-6 text-[0.95rem] has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8 ",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
