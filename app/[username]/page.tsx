import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import { api } from "@/convex/_generated/api";
import CollectionsCard from "@/components/CollectionCard";
import heartPixel from "@/public/icons/heart.png";
import { getServerConvexClient } from "@/server/convex/client";

export default async function UserStorePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const convex = getServerConvexClient();

  const result = await convex.query(api.collections.listPublic, { username });

  if (!result) {
    notFound();
  }

  const { user, collections } = result;

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
              {user.name}
            </h1>
            <Image
              src={heartPixel.src}
              alt="heart pixel"
              width={32}
              height={32}
              className="w-5 h-5 sm:w-7.5 sm:h-7.5"
            />
          </div>

          {user.bio && (
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              {user.bio}
            </p>
          )}
        </div>

        <div className="relative backdrop-blur-sm bg-white/60 border-2 border-pink-100 p-4 lg:p-6">
          <div className="flex items-center justify-center font-secondary gap-2 mb-8">
            <p className="text-primary">&#x22c6;&#xff61;&#x02da; &#x2727;</p>
            <h5 className="font-secondary text-xl">my collections</h5>
            <p className="text-primary">&#x2727; &#x22c6;&#xff61;&#x02da;</p>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto text-pink-300 mb-4" />
              <p className="text-gray-500 text-lg">
                building my collection... check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {collections.map((collection, index) => (
                <CollectionsCard
                  key={collection._id}
                  collection={collection}
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
    </main>
  );
}
