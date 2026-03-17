import Image from "next/image";
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
    <main className="home-font-primary min-h-screen flex justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
      <div
        className="pointer-events-none absolute -top-32 right-0 h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.92 0.08 340 / 0.3) 0%, transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-3xl">
        <div className="text-center max-sm:my-14 max-sm:mb-28 sm:my-20 space-y-4">
          <div className="inline-flex justify-center items-center gap-3 mb-2">
            <Image
              src={heartPixel.src}
              alt="heart pixel"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
            <h1 className="heading-playful text-6xl text-primary sm:text-8xl leading-[0.95]">
              {user.name}
            </h1>
            <Image
              src={heartPixel.src}
              alt="heart pixel"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
          </div>

          {user.bio && (
            <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed sm:text-lg">
              {user.bio}
            </p>
          )}
        </div>

        <div className="relative rounded-3xl border-2 border-pink-muted/60 bg-white/60 p-5 lg:p-8 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-10">
            <p className="heading-playful text-pink text-lg">&#x22c6;&#xff61;&#x02da; &#x2727;</p>
            <h5 className="heading-playful text-2xl sm:text-3xl">my collections</h5>
            <p className="heading-playful text-pink text-lg">&#x2727; &#x22c6;&#xff61;&#x02da;</p>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 mx-auto text-pink-muted mb-4 animate-float" />
              <p className="text-muted-foreground text-lg">
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
            <div className="text-center flex flex-col items-center justify-center mt-10 text-[0.65rem] opacity-70">
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
