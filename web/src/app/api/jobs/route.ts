import { NextRequest, NextResponse } from "next/server";
import { parseRSS } from "@/lib/rss";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "web development";
  const url = `https://www.upwork.com/ab/feed/jobs/rss?q=${encodeURIComponent(q)}&sort=recency`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch RSS", status: res.status },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const jobs = parseRSS(xml);

    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch jobs", detail: String(error) },
      { status: 500 }
    );
  }
}
