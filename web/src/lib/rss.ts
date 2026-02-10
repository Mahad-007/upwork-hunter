import { XMLParser } from "fast-xml-parser";

export interface Job {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  budget: string;
  skills: string[];
  category: string;
  jobType: string;
  experienceLevel: string;
  clientCountry: string;
  source?: "RemoteOK" | "WeWorkRemotely" | "Sample" | "rss";
}

function extractField(desc: string, field: string): string {
  const regex = new RegExp(`<b>${field}<\\/b>:?\\s*([^<]+)`, "i");
  const match = desc.match(regex);
  return match ? match[1].trim() : "";
}

function extractSkills(desc: string): string[] {
  const match = desc.match(/<b>Skills<\/b>:?\s*(.*?)(<br|<\/|$)/i);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((s) => s.replace(/<[^>]*>/g, "").trim())
    .filter(Boolean);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function hashString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function parseRSS(xml: string): Job[] {
  const parser = new XMLParser({ ignoreAttributes: false });
  const result = parser.parse(xml);

  const channel = result?.rss?.channel;
  if (!channel) return [];

  const items = Array.isArray(channel.item)
    ? channel.item
    : channel.item
    ? [channel.item]
    : [];

  return items.map((item: Record<string, string>) => {
    const desc = item.description || "";
    const budget =
      extractField(desc, "Budget") ||
      extractField(desc, "Hourly Range") ||
      "Not specified";
    const jobType = budget.toLowerCase().includes("hourly")
      ? "Hourly"
      : "Fixed";
    const experienceLevel =
      extractField(desc, "Experience Level") || "Not specified";
    const category = extractField(desc, "Category") || "General";
    const clientCountry = extractField(desc, "Country") || "Unknown";

    return {
      id: hashString(item.link || item.title || ""),
      title: item.title || "Untitled",
      description: stripHtml(desc),
      link: item.link || "",
      pubDate: item.pubDate || "",
      budget,
      skills: extractSkills(desc),
      category,
      jobType,
      experienceLevel,
      clientCountry,
    };
  });
}
