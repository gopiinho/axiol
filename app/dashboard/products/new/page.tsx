"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateProductFlow, type CreateProductFlowHandle } from "@/features/products/components/CreateProductFlow";

export default function NewProduct() {
  const formRef = useRef<CreateProductFlowHandle>(null);

  return (
    <div>
      <section className="p-5 sm:p-8 border-b">
          <div className="flex justify-between items-center">
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
                onClick={() => formRef.current?.submit()}
              >
                Create product
              </Button>
            </div>
          </div>
        </section>

      <div className="p-5 sm:p-8 flex w-full flex-col gap-12 sm:gap-24 lg:flex-row justify-between">
        <p className="w-full sm:w-80 text-sm text-muted-foreground">
          Turn your idea into a live product in minutes. No fuss, just a few
          quick selections and you&apos;re ready to start selling. Whether it&apos;s
          digital downloads, online courses, or memberships — see what sticks.
        </p>
        <div className="flex w-full flex-col gap-6 sm:gap-10">
          <CreateProductFlow ref={formRef} />
        </div>
      </div>
    </div>
  );
}
