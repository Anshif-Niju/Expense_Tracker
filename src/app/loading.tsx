export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-line" />
      <div className="h-36 rounded-2xl bg-line" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-24 rounded-2xl bg-line" />
        <div className="h-24 rounded-2xl bg-line" />
        <div className="h-24 rounded-2xl bg-line" />
      </div>
    </div>
  );
}
