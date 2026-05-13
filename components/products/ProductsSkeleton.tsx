export default function ProductsSkeleton() {
  return (
    <div className="p-5 sm:p-8">
      <div className="app-panel overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="py-3 px-4">
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                </th>
              ))}
              <th className="py-3 px-4 w-10" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, row) => (
              <tr key={row} className="border-b border-border/50">
                {Array.from({ length: 5 }).map((_, col) => (
                  <td key={col} className="py-4 px-4">
                    <div
                      className={`h-4 rounded bg-muted animate-pulse ${
                        col === 0 ? "w-36" : col === 1 ? "w-14" : col === 2 ? "w-12" : col === 3 ? "w-16" : "w-10"
                      }`}
                    />
                  </td>
                ))}
                <td className="py-4 px-4">
                  <div className="h-8 w-8 rounded bg-muted animate-pulse ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
