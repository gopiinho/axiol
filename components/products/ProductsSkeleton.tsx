export default function ProductsSkeleton() {
  return (
    <div className="p-5 sm:p-8">
      {/* Mobile skeleton */}
      <div className="flex flex-col gap-3 sm:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="app-panel p-4">
            <div className="flex items-start gap-3">
              <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-xs" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 w-36 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="bg-muted h-3 w-14 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-10 animate-pulse rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="bg-muted h-4 w-12 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-8 animate-pulse rounded" />
                </div>
              </div>
              <div className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop skeleton */}
      <div className="app-panel hidden overflow-hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-border/50 border-b">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="bg-muted h-3 w-16 animate-pulse rounded" />
                </th>
              ))}
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, row) => (
              <tr key={row} className="border-border/50 border-b">
                {Array.from({ length: 5 }).map((_, col) => (
                  <td key={col} className="px-4 py-4">
                    <div
                      className={`bg-muted h-4 animate-pulse rounded ${
                        col === 0
                          ? "w-36"
                          : col === 1
                            ? "w-14"
                            : col === 2
                              ? "w-12"
                              : col === 3
                                ? "w-16"
                                : "w-10"
                      }`}
                    />
                  </td>
                ))}
                <td className="px-4 py-4">
                  <div className="bg-muted ml-auto h-8 w-8 animate-pulse rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
