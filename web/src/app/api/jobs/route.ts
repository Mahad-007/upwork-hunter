import { NextRequest, NextResponse } from "next/server";
import { fetchAllJobs } from "@/lib/job-sources";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "developer";

  try {
    const result = await fetchAllJobs(q);

    return NextResponse.json({
      jobs: result.jobs,
      sources: result.sources,
      errors: result.errors.length > 0 ? result.errors : undefined,
      count: result.jobs.length,
      query: q,
    });
  } catch (error) {
    console.error("Job fetch error:", error);

    // Return empty result on complete failure
    return NextResponse.json({
      jobs: [],
      sources: [],
      errors: ["Failed to fetch jobs"],
      count: 0,
      query: q,
    });
  }
}
