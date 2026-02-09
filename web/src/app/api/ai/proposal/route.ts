import { NextRequest, NextResponse } from "next/server";
import { generateProposal } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { job, profile } = await req.json();
    if (!job || !profile) {
      return NextResponse.json({ error: "Missing job or profile" }, { status: 400 });
    }
    const proposal = await generateProposal(job, profile);
    return NextResponse.json({ proposal });
  } catch (error) {
    return NextResponse.json(
      { error: "Proposal generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
