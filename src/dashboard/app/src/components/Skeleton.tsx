export function SkeletonCard() {
  return (
    <div className="bg-kit-card rounded-xl border border-kit-border p-4 space-y-3">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-6 w-16 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-kit-card rounded-xl border border-kit-border p-4 space-y-3">
      <div className="skeleton h-4 w-40 rounded mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-3 flex-1 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-kit-card rounded-xl border border-kit-border p-4">
      <div className="skeleton h-4 w-32 rounded mb-4" />
      <div className="skeleton h-[400px] w-full rounded-lg" />
    </div>
  );
}
