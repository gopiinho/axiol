import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { api } from "@/convex/_generated/api";
import Cat from "@/components/Cat";
import CollectionsCard from "@/components/CollectionCard";
import heartPixel from "@/public/icons/heart.png";
import { getServerConvexClient } from "@/server/convex/client";

export default async function Home() {
  const convex = getServerConvexClient();
  const sections = await convex.query(api.sections.list);

  return (
    <main className="home-font-primary min-h-screen flex justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center max-sm:my-12 max-sm:mb-24 sm:my-16 space-y-4">
          <div className="inline-flex justify-center items-center gap-2 mb-2">
            <Image
              src={heartPixel.src}
              alt="heart pixel"
              width={32}
              height={32}
              className="w-5 h-5 sm:w-7.5 sm:h-7.5"
            />
            <h1 className="font-secondary text-5xl text-primary sm:text-7xl">
              neme&apos;s world
            </h1>
            <Image
              src={heartPixel.src}
              alt="heart pixel"
              width={32}
              height={32}
              className="w-5 h-5 sm:w-7.5 sm:h-7.5"
            />
          </div>

          <div className="font-secondary text-xl text-primary text-center">
            <div className="sm:hidden">
              <div className="flex items-center justify-center">
                <Link
                  href="https://www.wishlink.com/nemeowww2811"
                  className="px-2 py-1"
                  target="_blank"
                >
                  Wishlink
                </Link>
                <span className="mx-3 text-foreground">•</span>
                <Link
                  href="http://instagram.com/ne_meowww/"
                  className="px-2 py-1"
                  target="_blank"
                >
                  Instagram
                </Link>
                <span className="mx-3 text-foreground">•</span>
                <Link
                  href="https://www.youtube.com/@nemeowww"
                  className="px-2 py-1"
                  target="_blank"
                >
                  Youtube
                </Link>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  href="https://x.com/nemeowww?s=21"
                  className="px-2 py-1"
                  target="_blank"
                >
                  X
                </Link>
                <span className="mx-3 text-foreground">•</span>
                <Link
                  href="https://open.spotify.com/user/tugd4f23lueaynpgf92jnu6q6"
                  className="px-2 py-1"
                  target="_blank"
                >
                  Spotify
                </Link>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-center">
              <Link
                href="https://www.wishlink.com/nemeowww2811"
                className="px-2 py-1"
                target="_blank"
              >
                Wishlink
              </Link>
              <span className="mx-3 text-foreground">•</span>

              <Link
                href="http://instagram.com/ne_meowww/"
                className="px-2 py-1"
                target="_blank"
              >
                Instagram
              </Link>
              <span className="mx-3 text-foreground">•</span>

              <Link
                href="https://www.youtube.com/@nemeowww"
                className="px-2 py-1"
                target="_blank"
              >
                Youtube
              </Link>
              <span className="mx-3 text-foreground">•</span>

              <Link
                href="https://x.com/nemeowww?s=21"
                className="px-2 py-1"
                target="_blank"
              >
                X
              </Link>
              <span className="mx-3 text-foreground">•</span>

              <Link
                href="https://open.spotify.com/user/tugd4f23lueaynpgf92jnu6q6"
                className="px-2 py-1"
                target="_blank"
              >
                Spotify
              </Link>
            </div>
          </div>
        </div>

        <div className="relative">
          <Cat />

          <div className="relative backdrop-blur-sm bg-white/60 border-2 border-pink-100 p-4 lg:p-6">
            <div className="flex items-center justify-center font-secondary gap-2 mb-8">
              <p className="text-primary">⋆｡˚ ✧</p>
              <h5 className="font-secondary text-xl">my collections</h5>
              <p className="text-primary">✧ ⋆｡˚</p>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 mx-auto text-pink-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  building my collection... check back soon! ♡
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {sections.map((section, index) => (
                  <CollectionsCard
                    key={section._id}
                    section={section}
                    index={index}
                  />
                ))}
              </div>
            )}

            <div className="text-primary w-full">
              <div className="text-center flex flex-col items-center justify-center mt-8 text-[0.6rem]">
                <p>
                  If you purchase from any of these links, I may receive a small
                  commission.
                </p>
                <div className="flex gap-1 items-center justify-center">
                  Thank youuu for the support
                  <Image
                    src={heartPixel.src}
                    alt="heart pixel"
                    width={5}
                    height={5}
                    className="w-2 h-2 sm:w-2 sm:h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
