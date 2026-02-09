import { NextRequest, NextResponse } from "next/server";
import { scoreJobs } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { jobs, profile } = await req.json();
    if (!jobs || !profile) {
      return NextResponse.json({ error: "Missing jobs or profile" }, { status: 400 });
    }
    const scores = await scoreJobs(jobs, profile);
    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json(
      { error: "Scoring failed", detail: String(error) },
      { status: 500 }
    );
  }
}
