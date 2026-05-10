import { NextResponse } from "next/server";
import {
  approvedReviews,
  readPortfolio,
} from "@/lib/portfolio-store";

export async function GET() {
  try {
    const data = await readPortfolio();
    const {
      projectFeedback,
      leads,
      adminPasswordHash: _omitHash,
      ...rest
    } = data;
    void projectFeedback;
    void leads;
    void _omitHash;
    return NextResponse.json({
      ...rest,
      reviews: approvedReviews(data.reviews),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load portfolio data." },
      { status: 500 },
    );
  }
}
