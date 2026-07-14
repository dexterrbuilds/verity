export default function Loading() {
  return (
    <section className="container-page py-10">
      <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-lg border bg-card" />
        ))}
      </div>
    </section>
  );
}
