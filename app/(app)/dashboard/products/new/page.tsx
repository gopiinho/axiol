"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CreateProductFlow,
  type CreateProductFlowHandle,
} from "@/features/products/components/CreateProductFlow";

export default function NewProduct() {
  const formRef = useRef<CreateProductFlowHandle>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div>
      <section className="border-b p-5 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="app-title">Publish your first product</h1>
          <div className="flex gap-2">
            <Link href="/dashboard/products">
              <Button size="lg" variant="outline" className="gap-2 sm:self-start">
                Cancel
              </Button>
            </Link>
            <Button
              size="lg"
              className="gap-2 sm:self-start"
              disabled={isCreating}
              onClick={() => formRef.current?.submit()}
            >
              {isCreating ? "Creating..." : "Create product"}
            </Button>
          </div>
        </div>
      </section>

      <div className="flex w-full flex-col justify-between gap-12 p-5 sm:gap-24 sm:p-8 lg:flex-row">
        <p className="text-muted-foreground w-full text-sm sm:w-80">
          Turn your idea into a live product in minutes. No fuss, just a few quick selections and
          you&apos;re ready to start selling. Whether it&apos;s digital downloads, online courses,
          or memberships — see what sticks.
        </p>
        <div className="flex w-full flex-col gap-6 sm:gap-10">
          <CreateProductFlow ref={formRef} onLoadingChange={setIsCreating} />
        </div>
      </div>
    </div>
  );
}
