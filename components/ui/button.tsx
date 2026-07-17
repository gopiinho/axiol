import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-[0.3rem] font-bold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/12 before:to-transparent before:opacity-0 before:transition-opacity before:duration-150 hover:before:opacity-100 [&>*]:relative [&>*]:z-10",
  {
    variants: {
      variant: {
        default:
          "border border-primary/70 bg-primary border border-primary text-foreground hover:bg-primary/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]",
        destructive:
          "border border-destructive bg-destructive/90 text-white hover:bg-destructive/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] focus-visible:ring-destructive/30",
        outline:
          "border border-border/90 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] hover:bg-muted hover:border-border",
        secondary:
          "border border-border/70 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "border border-transparent text-muted-foreground hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 min-w-[7rem] px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 min-w-[6rem] gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 min-w-[10.5rem] px-6 text-[0.95rem] has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8 ",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
