import Image from "next/image";
import Link from "next/link";
import heartPixel from "@/public/icons/heart.png";

interface CollectionsCardProps {
  collection: {
    _id: string;
    title: string;
    description?: string | null;
  };
  index: number;
}

export default function CollectionsCard({
  collection,
  index,
}: CollectionsCardProps) {
  return (
    <Link
      href={`/list/${collection._id}`}
      className="group relative"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative w-full bg-white p-6 border-2 border-pink-200 transition-all duration-300 hover:shadow-2xl group-hover:border-pink-300">
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Image
              src={heartPixel.src}
              className="hover:scale-105 duration-150"
              alt="heart pixel"
              width={10}
              height={10}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 min-h-35">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight group-hover:text-pink-600 transition-colors">
              {collection.title}
            </h2>

            {collection.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-pink-100">
            <span className="text-xs text-gray-500 font-medium">
              see collection
            </span>

            <div className="flex items-center gap-1 text-pink-500 group-hover:gap-2 transition-all">
              <span className="text-sm font-semibold"></span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
