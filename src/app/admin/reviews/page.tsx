import { ReviewsAdmin } from "./reviews-admin";
import { readPortfolio } from "@/lib/portfolio-store";

export default async function AdminReviewsPage() {
  const { reviews } = await readPortfolio();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Reviews
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Testimonials shown on the homepage. Rating 0 hides star display.
      </p>
      <div className="mt-10">
        <ReviewsAdmin initial={reviews} />
      </div>
    </div>
  );
}
