export default function ProductsSkeleton() {
  return (
    <div className="p-5 sm:p-8">
      <div className="app-panel border-dotted p-4">
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="flex gap-4">
            <div className="h-24 w-24 shrink-0 rounded-md bg-muted" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-5 w-1/3 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-24 w-24 shrink-0 rounded-md bg-muted" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-5 w-1/3 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-24 w-24 shrink-0 rounded-md bg-muted" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-5 w-1/3 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
