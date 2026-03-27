import Link from "next/link";
import { Button } from "./ui/button";

export default function HomeNav() {
  return (
    <div className="w-full flex justify-between fixed top-0 z-100 shadow-lg backdrop-blur-md bg-white/10 px-8 py-4 sm:px-16 sm:py-6">
      <h1 className="text-3xl sm:text-4xl text-primary font-black">Linkkit</h1>
      {/* <div className="flex gap-2 items-center">
        <Link href={"/login"}>
          <Button variant={"ghost"}>Login</Button>
        </Link>
        <Link href={"/signup"}>
          <Button>Sign Up</Button>
        </Link>
      </div> */}
    </div>
  );
}
