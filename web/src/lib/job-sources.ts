import type { Job } from "./rss";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Word boundary matching - ensures keywords match as whole words
 * "AI" matches "AI Engineer" but NOT "WAIT" or "PAID"
 */
function wordBoundaryMatch(text: string, keyword: string): boolean {
  // Escape special regex characters in keyword
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  return regex.test(text);
}

/**
 * Parse keywords from search query
 * Allows 2+ char keywords to support "AI", "Go", "UI", "UX"
 */
function parseKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((k) => k.length >= 2); // Changed from > 2 to >= 2
}

function detectExperienceLevel(text: string): string {
  const lower = text.toLowerCase();

  // Expert indicators
  const expertPatterns = [
    /\b(senior|lead|principal|staff|architect|head of|director|10\+?\s*years?|8\+?\s*years?|7\+?\s*years?)\b/i,
    /\b(expert|advanced|extensive experience)\b/i,
  ];

  // Entry level indicators
  const entryPatterns = [
    /\b(junior|entry[- ]level|intern|trainee|graduate|0-2\s*years?|1-2\s*years?|no experience)\b/i,
    /\b(entry|beginner|starter|fresh)\b/i,
  ];

  // Check for expert first
  for (const pattern of expertPatterns) {
    if (pattern.test(lower)) return "Expert";
  }

  // Check for entry level
  for (const pattern of entryPatterns) {
    if (pattern.test(lower)) return "Entry Level";
  }

  // Check for intermediate indicators
  const intermediatePatterns = [
    /\b(mid[- ]?level|intermediate|3-5\s*years?|4-6\s*years?|2-4\s*years?|some experience)\b/i,
  ];

  for (const pattern of intermediatePatterns) {
    if (pattern.test(lower)) return "Intermediate";
  }

  return "Not specified";
}

function detectJobType(text: string, defaultType: string = "Full-Time"): string {
  const lower = text.toLowerCase();

  if (/\b(hourly|per hour|\/hr|\/hour)\b/i.test(lower)) return "Hourly";
  if (/\b(fixed[- ]?price|fixed[- ]?budget|project[- ]?based|one[- ]?time)\b/i.test(lower)) return "Fixed";
  if (/\b(part[- ]?time)\b/i.test(lower)) return "Part-Time";
  if (/\b(contract|freelance|contractor)\b/i.test(lower)) return "Contract";
  if (/\b(full[- ]?time)\b/i.test(lower)) return "Full-Time";

  return defaultType;
}

// RemoteOK API types
interface RemoteOKJob {
  id: string;
  slug: string;
  company: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  apply_url: string;
  url: string;
  date: string;
}

// WeWorkRemotely RSS item
interface WWRItem {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  description?: string;
  category?: string;
  region?: string;
  type?: string;
}

/**
 * Fetch jobs from RemoteOK API
 * API: https://remoteok.com/api
 */
export async function fetchRemoteOKJobs(query: string): Promise<Job[]> {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: {
        "User-Agent": getRandomUA(),
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      console.error(`RemoteOK API error: ${res.status}`);
      return [];
    }

    const data: RemoteOKJob[] = await res.json();

    // First item is metadata, skip it
    const jobs = data.slice(1);

    // Filter by query keywords with relevance scoring
    const keywords = parseKeywords(query);
    const queryLower = query.toLowerCase().trim();

    const scored = jobs
      .filter((job) => job.position && job.description)
      .map((job) => {
        const titleLower = job.position.toLowerCase();
        const descLower = job.description.toLowerCase();
        const tagsLower = (job.tags || []).join(" ").toLowerCase();
        const companyLower = (job.company || "").toLowerCase();
        const allText = `${titleLower} ${descLower} ${tagsLower} ${companyLower}`;

        // Check if ALL keywords match somewhere (word boundary matching)
        const allKeywordsMatch = keywords.length === 0 || keywords.every((keyword) =>
          wordBoundaryMatch(allText, keyword)
        );

        if (!allKeywordsMatch) {
          return { job, score: 0, hasMatch: false };
        }

        // Calculate relevance score using word boundary matching
        let score = 0;

        // Bonus for exact phrase match in title
        if (titleLower.includes(queryLower)) score += 25;

        // Score individual keyword matches with word boundaries
        for (const keyword of keywords) {
          if (wordBoundaryMatch(titleLower, keyword)) score += 10;
          if (wordBoundaryMatch(tagsLower, keyword)) score += 8;
          if (wordBoundaryMatch(descLower, keyword)) score += 2;
          if (wordBoundaryMatch(companyLower, keyword)) score += 1;
        }

        // Bonus if all keywords appear in title
        const allInTitle = keywords.every((k) => wordBoundaryMatch(titleLower, k));
        if (allInTitle && keywords.length > 0) score += 15;

        return { job, score, hasMatch: true };
      });

    // Only include jobs with at least one keyword match, sorted by relevance
    const filtered = scored
      .filter((s) => s.hasMatch)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.job);

    // Convert to our Job format
    return filtered.slice(0, 30).map((job) => {
      const salaryText =
        job.salary_min && job.salary_max
          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}/yr`
          : job.salary_min
            ? `From $${job.salary_min.toLocaleString()}/yr`
            : "Not specified";

      const fullText = `${job.position} ${job.description || ""}`;
      const experienceLevel = detectExperienceLevel(fullText);
      const jobType = detectJobType(fullText, "Full-Time");

      return {
        id: `rok-${job.id || hashString(job.slug || job.position)}`,
        title: job.position || "Untitled",
        description: stripHtml(job.description || "").slice(0, 1000),
        link: job.url || job.apply_url || `https://remoteok.com/${job.slug}`,
        pubDate: job.date || new Date().toISOString(),
        budget: salaryText,
        skills: (job.tags || []).slice(0, 8).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
        category: job.tags?.[0] || "Remote",
        jobType: jobType,
        experienceLevel: experienceLevel,
        clientCountry: job.location || "Remote",
        source: "RemoteOK" as const,
      };
    });
  } catch (error) {
    console.error("RemoteOK fetch error:", error);
    return [];
  }
}

/**
 * Fetch jobs from WeWorkRemotely RSS
 * RSS: https://weworkremotely.com/remote-jobs.rss
 */
export async function fetchWeWorkRemotelyJobs(query: string): Promise<Job[]> {
  try {
    const res = await fetch("https://weworkremotely.com/remote-jobs.rss", {
      headers: {
        "User-Agent": getRandomUA(),
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      console.error(`WeWorkRemotely RSS error: ${res.status}`);
      return [];
    }

    const xml = await res.text();

    // Parse RSS manually for better control
    const jobs = parseWWRRss(xml);

    // Filter by query keywords with relevance scoring
    const keywords = parseKeywords(query);
    const queryLower = query.toLowerCase().trim();

    const scored = jobs.map((job) => {
      const titleLower = job.title.toLowerCase();
      const descLower = job.description.toLowerCase();
      const skillsLower = job.skills.join(" ").toLowerCase();
      const categoryLower = job.category.toLowerCase();
      const allText = `${titleLower} ${descLower} ${skillsLower} ${categoryLower}`;

      // Check if ALL keywords match somewhere (word boundary matching)
      const allKeywordsMatch = keywords.length === 0 || keywords.every((keyword) =>
        wordBoundaryMatch(allText, keyword)
      );

      if (!allKeywordsMatch) {
        return { job, score: 0, hasMatch: false };
      }

      // Calculate relevance score using word boundary matching
      let score = 0;

      // Bonus for exact phrase match in title
      if (titleLower.includes(queryLower)) score += 25;

      // Score individual keyword matches with word boundaries
      for (const keyword of keywords) {
        if (wordBoundaryMatch(titleLower, keyword)) score += 10;
        if (wordBoundaryMatch(skillsLower, keyword)) score += 8;
        if (wordBoundaryMatch(categoryLower, keyword)) score += 3;
        if (wordBoundaryMatch(descLower, keyword)) score += 2;
      }

      // Bonus if all keywords appear in title
      const allInTitle = keywords.every((k) => wordBoundaryMatch(titleLower, k));
      if (allInTitle && keywords.length > 0) score += 15;

      return { job, score, hasMatch: true };
    });

    // Only include jobs with at least one keyword match, sorted by relevance
    const filtered = scored
      .filter((s) => s.hasMatch)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.job);

    return filtered.slice(0, 30);
  } catch (error) {
    console.error("WeWorkRemotely fetch error:", error);
    return [];
  }
}

function parseWWRRss(xml: string): Job[] {
  const jobs: Job[] = [];

  // Extract all <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const getTag = (tag: string): string => {
      const tagRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
      const tagMatch = itemXml.match(tagRegex);
      return tagMatch ? tagMatch[1].trim() : "";
    };

    const title = getTag("title").replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");
    const link = getTag("link") || getTag("guid");
    const pubDate = getTag("pubDate");
    const description = getTag("description")
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
    const category = getTag("category") || "Remote";
    const region = getTag("region") || "Remote";
    const jobType = getTag("type") || "Full-Time";

    if (!title || title.includes("legal")) continue;

    // Extract company from title (format: "Company: Job Title")
    const titleParts = title.split(": ");
    const company = titleParts.length > 1 ? titleParts[0] : "";
    const jobTitle = titleParts.length > 1 ? titleParts.slice(1).join(": ") : title;

    // Extract skills from description
    const skillsMatch = description.match(
      /\b(JavaScript|TypeScript|React|Vue|Angular|Node\.js|Python|Ruby|Go|Rust|Java|PHP|Swift|Kotlin|AWS|Docker|Kubernetes|SQL|MongoDB|GraphQL|REST|API|Git|CI\/CD|Agile|Scrum)\b/gi
    );
    const skills = Array.from(new Set(skillsMatch || [])).slice(0, 6);

    const fullText = `${title} ${description}`;
    const detectedExperience = detectExperienceLevel(fullText);
    const detectedJobType = detectJobType(fullText, jobType);

    jobs.push({
      id: `wwr-${hashString(link || title)}`,
      title: jobTitle,
      description: stripHtml(description).slice(0, 1000),
      link: link,
      pubDate: pubDate || new Date().toISOString(),
      budget: "Not specified",
      skills: skills.length > 0 ? skills : [category],
      category: category,
      jobType: detectedJobType,
      experienceLevel: detectedExperience,
      clientCountry: region,
      source: "WeWorkRemotely" as const,
    });
  }

  return jobs;
}

export type JobSource = "RemoteOK" | "WeWorkRemotely";

export interface FetchJobsResult {
  jobs: Job[];
  sources: JobSource[];
  errors: string[];
}

/**
 * Fetch jobs from all available sources
 * Returns combined results with source tracking
 */
export async function fetchAllJobs(query: string): Promise<FetchJobsResult> {
  const errors: string[] = [];
  const sources: JobSource[] = [];
  let allJobs: Job[] = [];

  // Fetch from both sources in parallel
  const [remoteOKJobs, wwrJobs] = await Promise.all([
    fetchRemoteOKJobs(query).catch((e) => {
      errors.push(`RemoteOK: ${e.message}`);
      return [] as Job[];
    }),
    fetchWeWorkRemotelyJobs(query).catch((e) => {
      errors.push(`WeWorkRemotely: ${e.message}`);
      return [] as Job[];
    }),
  ]);

  if (remoteOKJobs.length > 0) {
    sources.push("RemoteOK");
    allJobs = [...allJobs, ...remoteOKJobs];
  }

  if (wwrJobs.length > 0) {
    sources.push("WeWorkRemotely");
    allJobs = [...allJobs, ...wwrJobs];
  }

  // If no jobs found, add an error message
  if (allJobs.length === 0) {
    errors.push("No jobs found matching your search. Try different keywords.");
  }

  // Jobs are already sorted by relevance from each source

  return {
    jobs: allJobs,
    sources,
    errors,
  };
}
