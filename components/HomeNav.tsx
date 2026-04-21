import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import Logo from "../public/axiol-logo.svg";

export default function HomeNav() {
  return (
    <div className="w-full flex bg-foreground justify-between fixed top-0 z-100 backdrop-blur-md  px-8 py-4 sm:px-16 sm:py-6">
      <div className="flex items-center">
        <Image src={Logo} alt="Logo" width={50} height={50} />
        <h1 className="font-black text-3xl text-primary">AXIOL</h1>
      </div>
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
