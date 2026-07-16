"use client";

import { Toaster } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      duration={4000}
      icons={{
        success: (
          <CheckCircle2
            className="size-5 text-success"
          />
        ),
        error: (
          <XCircle
            className="size-5 text-destructive"
          />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xs !border !px-4 !py-3 !text-sm !font-medium !shadow-card",
          description:
            "!text-background/80 text-xs",
          success:
            "!bg-status-success-subtle !border-success !text-background",
          error:
            "!bg-status-danger-subtle !border-destructive !text-background",
        },
      }}
    />
  );
}
