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

    // Filter by query keywords
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 2);

    const filtered = jobs.filter((job) => {
      if (!job.position || !job.description) return false;
      const text =
        `${job.position} ${job.description} ${job.tags?.join(" ") || ""} ${job.company}`.toLowerCase();
      return (
        keywords.length === 0 || keywords.some((keyword) => text.includes(keyword))
      );
    });

    // Convert to our Job format
    return filtered.slice(0, 30).map((job) => {
      const salaryText =
        job.salary_min && job.salary_max
          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}/yr`
          : job.salary_min
            ? `From $${job.salary_min.toLocaleString()}/yr`
            : "Not specified";

      return {
        id: `rok-${job.id || hashString(job.slug || job.position)}`,
        title: job.position || "Untitled",
        description: stripHtml(job.description || "").slice(0, 1000),
        link: job.url || job.apply_url || `https://remoteok.com/${job.slug}`,
        pubDate: job.date || new Date().toISOString(),
        budget: salaryText,
        skills: (job.tags || []).slice(0, 8).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
        category: job.tags?.[0] || "Remote",
        jobType: "Full-Time",
        experienceLevel: "Not specified",
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

    // Filter by query keywords
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 2);

    const filtered = jobs.filter((job) => {
      const text = `${job.title} ${job.description}`.toLowerCase();
      return keywords.length === 0 || keywords.some((keyword) => text.includes(keyword));
    });

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

    jobs.push({
      id: `wwr-${hashString(link || title)}`,
      title: jobTitle,
      description: stripHtml(description).slice(0, 1000),
      link: link,
      pubDate: pubDate || new Date().toISOString(),
      budget: "Not specified",
      skills: skills.length > 0 ? skills : [category],
      category: category,
      jobType: jobType,
      experienceLevel: "Not specified",
      clientCountry: region,
      source: "WeWorkRemotely" as const,
    });
  }

  return jobs;
}

/**
 * Fallback jobs when all sources fail
 */
export function getFallbackJobs(query: string): Job[] {
  const q = query.toLowerCase();
  const now = new Date().toISOString();

  const allJobs: Job[] = [
    {
      id: "fb1",
      title: "Senior React Developer for E-Commerce Platform",
      description:
        "We need an experienced React developer to build a modern e-commerce platform with Next.js, TypeScript, and Tailwind CSS. The project involves creating a responsive storefront, shopping cart, checkout flow, and admin dashboard. Must have experience with payment integration (Stripe) and state management.",
      link: "#",
      pubDate: now,
      budget: "$50-$80/hr",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Stripe"],
      category: "Web Development",
      jobType: "Hourly",
      experienceLevel: "Expert",
      clientCountry: "United States",
      source: "Sample" as const,
    },
    {
      id: "fb2",
      title: "Full-Stack Node.js Developer for SaaS Application",
      description:
        "Looking for a full-stack developer to build a SaaS application using Node.js, Express, PostgreSQL, and React. The app will include user authentication, subscription management, REST API, and real-time notifications via WebSockets. Experience with Docker and AWS deployment preferred.",
      link: "#",
      pubDate: now,
      budget: "$5,000 - $10,000",
      skills: ["Node.js", "Express", "PostgreSQL", "React", "Docker", "AWS"],
      category: "Web Development",
      jobType: "Fixed",
      experienceLevel: "Expert",
      clientCountry: "United Kingdom",
      source: "Sample" as const,
    },
    {
      id: "fb3",
      title: "Python Backend Developer for Data Analytics Dashboard",
      description:
        "Need a Python developer to build a data analytics dashboard backend using FastAPI and SQLAlchemy. The dashboard will process large datasets, generate reports, and display interactive charts. Must have experience with pandas, numpy, and data visualization libraries.",
      link: "#",
      pubDate: now,
      budget: "$40-$65/hr",
      skills: ["Python", "FastAPI", "SQLAlchemy", "Pandas", "PostgreSQL"],
      category: "Data Science",
      jobType: "Hourly",
      experienceLevel: "Intermediate",
      clientCountry: "Canada",
      source: "Sample" as const,
    },
    {
      id: "fb4",
      title: "React Native Mobile App Developer",
      description:
        "We are building a fitness tracking mobile app using React Native. The app needs GPS tracking, workout logging, social features, and integration with Apple Health/Google Fit. Looking for someone with published apps on both App Store and Play Store.",
      link: "#",
      pubDate: now,
      budget: "$8,000 - $15,000",
      skills: ["React Native", "TypeScript", "Firebase", "iOS", "Android"],
      category: "Mobile Development",
      jobType: "Fixed",
      experienceLevel: "Expert",
      clientCountry: "Australia",
      source: "Sample" as const,
    },
    {
      id: "fb5",
      title: "WordPress Developer for Business Website Redesign",
      description:
        "Need a WordPress developer to redesign our company website. Must be proficient with Elementor, custom themes, WooCommerce, and SEO optimization. The site needs to be fast, mobile-responsive, and ADA compliant. Around 15 pages total.",
      link: "#",
      pubDate: now,
      budget: "$1,500 - $3,000",
      skills: ["WordPress", "Elementor", "PHP", "WooCommerce", "SEO"],
      category: "Web Development",
      jobType: "Fixed",
      experienceLevel: "Intermediate",
      clientCountry: "United States",
      source: "Sample" as const,
    },
    {
      id: "fb6",
      title: "DevOps Engineer - CI/CD Pipeline Setup",
      description:
        "Looking for a DevOps engineer to set up CI/CD pipelines using GitHub Actions, Docker, and Kubernetes. Need automated testing, staging environments, and production deployment workflows for a microservices architecture. Terraform experience required.",
      link: "#",
      pubDate: now,
      budget: "$60-$90/hr",
      skills: ["Docker", "Kubernetes", "GitHub Actions", "Terraform", "AWS"],
      category: "DevOps",
      jobType: "Hourly",
      experienceLevel: "Expert",
      clientCountry: "Germany",
      source: "Sample" as const,
    },
    {
      id: "fb7",
      title: "UI/UX Designer for Fintech Mobile App",
      description:
        "We need a talented UI/UX designer to create a modern, clean design for our fintech mobile app. Deliverables include user research, wireframes, high-fidelity mockups in Figma, and a design system. Experience with banking/finance apps is a plus.",
      link: "#",
      pubDate: now,
      budget: "$3,000 - $6,000",
      skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Design Systems"],
      category: "UI/UX Design",
      jobType: "Fixed",
      experienceLevel: "Intermediate",
      clientCountry: "Singapore",
      source: "Sample" as const,
    },
    {
      id: "fb8",
      title: "Machine Learning Engineer for NLP Project",
      description:
        "Seeking an ML engineer to build a text classification and sentiment analysis system. Must have experience with transformers (BERT/GPT), PyTorch, and deploying ML models as APIs. The system will process customer feedback and generate insights.",
      link: "#",
      pubDate: now,
      budget: "$70-$120/hr",
      skills: ["Python", "PyTorch", "NLP", "Transformers", "Machine Learning"],
      category: "AI/ML",
      jobType: "Hourly",
      experienceLevel: "Expert",
      clientCountry: "United States",
      source: "Sample" as const,
    },
    {
      id: "fb9",
      title: "Vue.js Frontend Developer for Admin Dashboard",
      description:
        "Need a Vue.js developer to build an admin dashboard with complex data tables, charts, role-based access, and real-time updates. Tech stack: Vue 3, Composition API, Pinia, Vuetify, and Chart.js. API is already built, just need the frontend.",
      link: "#",
      pubDate: now,
      budget: "$2,000 - $4,000",
      skills: ["Vue.js", "TypeScript", "Vuetify", "Chart.js", "REST API"],
      category: "Web Development",
      jobType: "Fixed",
      experienceLevel: "Intermediate",
      clientCountry: "Netherlands",
      source: "Sample" as const,
    },
    {
      id: "fb10",
      title: "Flutter Developer for Cross-Platform App",
      description:
        "Looking for a Flutter developer to build a cross-platform delivery tracking app. Features include real-time GPS tracking, push notifications, payment integration, and driver/customer interfaces. Need experience with Firebase and Google Maps API.",
      link: "#",
      pubDate: now,
      budget: "$6,000 - $12,000",
      skills: ["Flutter", "Dart", "Firebase", "Google Maps API", "REST API"],
      category: "Mobile Development",
      jobType: "Fixed",
      experienceLevel: "Intermediate",
      clientCountry: "UAE",
      source: "Sample" as const,
    },
  ];

  // Filter by relevance to query
  const keywords = q.split(/\s+/).filter((k) => k.length > 2);
  if (keywords.length === 0) return allJobs;

  const scored = allJobs.map((job) => {
    const text =
      `${job.title} ${job.description} ${job.skills.join(" ")} ${job.category}`.toLowerCase();
    const matchCount = keywords.filter((k) => text.includes(k)).length;
    return { job, score: matchCount };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.job);
}

export type JobSource = "RemoteOK" | "WeWorkRemotely" | "Sample";

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

  // If no jobs from real sources, use fallback
  if (allJobs.length === 0) {
    sources.push("Sample");
    allJobs = getFallbackJobs(query);
    errors.push("All live sources failed, showing sample jobs");
  }

  // Sort by date (newest first)
  allJobs.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return {
    jobs: allJobs,
    sources,
    errors,
  };
}
