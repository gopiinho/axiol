import Link from "next/link";
import { Button } from "../ui/button";

export default function NoProducts() {
  return (
    <div className="p-5 sm:p-8">
      <div className="app-panel border-dotted p-4">
        <div className="flex flex-col gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-2xl">No products yet :(</h4>
            <p className="text-muted-foreground text-sm">
              Your first product does not need to be perfect. Just put it out
              there, and see if it sticks.
            </p>
          </div>
          <Link
            href="/dashboard/products/new"
            className="sm:self-start sm:mx-auto"
          >
            <Button size={"lg"}>New Product</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
