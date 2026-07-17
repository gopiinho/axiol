"use client";

import { Toaster } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      duration={4000}
      icons={{
        success: <CheckCircle2 className="text-success size-5" />,
        error: <XCircle className="text-destructive size-5" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xs !border !px-4 !py-3 !text-sm !font-medium !shadow-card !w-fit !min-w-48 !left-0 !right-0 !mx-auto",
          description: "!text-background/80 text-xs",
          success: "!bg-status-success-subtle !border-success !text-background",
          error: "!bg-status-danger-subtle !border-destructive !text-background",
        },
      }}
    />
  );
}
