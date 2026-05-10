export function StarRating({ rating }: { rating: number }) {
  const full = Math.min(5, Math.max(0, Math.round(rating)));
  if (full <= 0) return null;
  return (
    <div className="flex gap-0.5 text-primary" aria-label={`${full} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < full ? "opacity-100" : "opacity-25"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
