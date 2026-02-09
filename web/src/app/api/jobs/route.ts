import { NextRequest, NextResponse } from "next/server";
import { parseRSS } from "@/lib/rss";
import type { Job } from "@/lib/rss";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function generateFallbackJobs(query: string): Job[] {
  const q = query.toLowerCase();
  const now = new Date().toISOString();
  const allJobs: Job[] = [
    { id: "fb1", title: "Senior React Developer for E-Commerce Platform", description: "We need an experienced React developer to build a modern e-commerce platform with Next.js, TypeScript, and Tailwind CSS. The project involves creating a responsive storefront, shopping cart, checkout flow, and admin dashboard. Must have experience with payment integration (Stripe) and state management (Zustand/Redux).", link: "https://www.upwork.com/jobs/~01", pubDate: now, budget: "$50-$80/hr", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Stripe"], category: "Web Development", jobType: "Hourly", experienceLevel: "Expert", clientCountry: "United States" },
    { id: "fb2", title: "Full-Stack Node.js Developer for SaaS Application", description: "Looking for a full-stack developer to build a SaaS application using Node.js, Express, PostgreSQL, and React. The app will include user authentication, subscription management, REST API, and real-time notifications via WebSockets. Experience with Docker and AWS deployment preferred.", link: "https://www.upwork.com/jobs/~02", pubDate: now, budget: "$5,000 - $10,000", skills: ["Node.js", "Express", "PostgreSQL", "React", "Docker", "AWS"], category: "Web Development", jobType: "Fixed", experienceLevel: "Expert", clientCountry: "United Kingdom" },
    { id: "fb3", title: "Python Backend Developer for Data Analytics Dashboard", description: "Need a Python developer to build a data analytics dashboard backend using FastAPI and SQLAlchemy. The dashboard will process large datasets, generate reports, and display interactive charts. Must have experience with pandas, numpy, and data visualization libraries.", link: "https://www.upwork.com/jobs/~03", pubDate: now, budget: "$40-$65/hr", skills: ["Python", "FastAPI", "SQLAlchemy", "Pandas", "PostgreSQL"], category: "Data Science", jobType: "Hourly", experienceLevel: "Intermediate", clientCountry: "Canada" },
    { id: "fb4", title: "React Native Mobile App Developer", description: "We are building a fitness tracking mobile app using React Native. The app needs GPS tracking, workout logging, social features, and integration with Apple Health/Google Fit. Looking for someone with published apps on both App Store and Play Store.", link: "https://www.upwork.com/jobs/~04", pubDate: now, budget: "$8,000 - $15,000", skills: ["React Native", "TypeScript", "Firebase", "iOS", "Android"], category: "Mobile Development", jobType: "Fixed", experienceLevel: "Expert", clientCountry: "Australia" },
    { id: "fb5", title: "WordPress Developer for Business Website Redesign", description: "Need a WordPress developer to redesign our company website. Must be proficient with Elementor, custom themes, WooCommerce, and SEO optimization. The site needs to be fast, mobile-responsive, and ADA compliant. Around 15 pages total.", link: "https://www.upwork.com/jobs/~05", pubDate: now, budget: "$1,500 - $3,000", skills: ["WordPress", "Elementor", "PHP", "WooCommerce", "SEO"], category: "Web Development", jobType: "Fixed", experienceLevel: "Intermediate", clientCountry: "United States" },
    { id: "fb6", title: "DevOps Engineer - CI/CD Pipeline Setup", description: "Looking for a DevOps engineer to set up CI/CD pipelines using GitHub Actions, Docker, and Kubernetes. Need automated testing, staging environments, and production deployment workflows for a microservices architecture. Terraform experience required.", link: "https://www.upwork.com/jobs/~06", pubDate: now, budget: "$60-$90/hr", skills: ["Docker", "Kubernetes", "GitHub Actions", "Terraform", "AWS"], category: "DevOps", jobType: "Hourly", experienceLevel: "Expert", clientCountry: "Germany" },
    { id: "fb7", title: "UI/UX Designer for Fintech Mobile App", description: "We need a talented UI/UX designer to create a modern, clean design for our fintech mobile app. Deliverables include user research, wireframes, high-fidelity mockups in Figma, and a design system. Experience with banking/finance apps is a plus.", link: "https://www.upwork.com/jobs/~07", pubDate: now, budget: "$3,000 - $6,000", skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Design Systems"], category: "UI/UX Design", jobType: "Fixed", experienceLevel: "Intermediate", clientCountry: "Singapore" },
    { id: "fb8", title: "Machine Learning Engineer for NLP Project", description: "Seeking an ML engineer to build a text classification and sentiment analysis system. Must have experience with transformers (BERT/GPT), PyTorch, and deploying ML models as APIs. The system will process customer feedback and generate insights.", link: "https://www.upwork.com/jobs/~08", pubDate: now, budget: "$70-$120/hr", skills: ["Python", "PyTorch", "NLP", "Transformers", "Machine Learning"], category: "AI/ML", jobType: "Hourly", experienceLevel: "Expert", clientCountry: "United States" },
    { id: "fb9", title: "Vue.js Frontend Developer for Admin Dashboard", description: "Need a Vue.js developer to build an admin dashboard with complex data tables, charts, role-based access, and real-time updates. Tech stack: Vue 3, Composition API, Pinia, Vuetify, and Chart.js. API is already built, just need the frontend.", link: "https://www.upwork.com/jobs/~09", pubDate: now, budget: "$2,000 - $4,000", skills: ["Vue.js", "TypeScript", "Vuetify", "Chart.js", "REST API"], category: "Web Development", jobType: "Fixed", experienceLevel: "Intermediate", clientCountry: "Netherlands" },
    { id: "fb10", title: "Shopify Developer for Custom Theme & Apps", description: "Looking for a Shopify expert to develop a custom theme and private apps. Need custom product configurator, subscription system, and inventory management features. Must know Liquid, Shopify APIs, and have experience with Shopify Plus.", link: "https://www.upwork.com/jobs/~10", pubDate: now, budget: "$4,000 - $8,000", skills: ["Shopify", "Liquid", "JavaScript", "REST API", "CSS"], category: "Web Development", jobType: "Fixed", experienceLevel: "Expert", clientCountry: "United States" },
    { id: "fb11", title: "Django REST API Developer", description: "We need a Django developer to build a REST API for our project management tool. Features include user auth with JWT, project/task CRUD, file uploads to S3, real-time notifications with WebSockets, and comprehensive API documentation with Swagger.", link: "https://www.upwork.com/jobs/~11", pubDate: now, budget: "$35-$55/hr", skills: ["Python", "Django", "REST API", "PostgreSQL", "Redis"], category: "Web Development", jobType: "Hourly", experienceLevel: "Intermediate", clientCountry: "India" },
    { id: "fb12", title: "iOS Swift Developer for Social Media App", description: "Building a new social media app for iOS. Need an experienced Swift developer who can implement feeds, stories, messaging, push notifications, and camera features. Must follow MVVM architecture and have experience with Core Data and CloudKit.", link: "https://www.upwork.com/jobs/~12", pubDate: now, budget: "$10,000 - $20,000", skills: ["Swift", "iOS", "UIKit", "SwiftUI", "Core Data"], category: "Mobile Development", jobType: "Fixed", experienceLevel: "Expert", clientCountry: "United States" },
    { id: "fb13", title: "Technical Content Writer for Developer Blog", description: "Looking for a technical writer to create in-depth blog posts about web development, cloud computing, and software architecture. Need 4 articles per month, each 2000-3000 words. Must understand code and be able to include working examples.", link: "https://www.upwork.com/jobs/~13", pubDate: now, budget: "$200 - $400 per article", skills: ["Technical Writing", "JavaScript", "Cloud Computing", "SEO", "Markdown"], category: "Content Writing", jobType: "Fixed", experienceLevel: "Intermediate", clientCountry: "United States" },
    { id: "fb14", title: "Angular Developer for Enterprise CRM System", description: "We are building an enterprise CRM system and need an Angular developer. The project involves complex forms, data grids, role-based permissions, reporting module, and integration with Salesforce APIs. Must have experience with Angular 16+ and NgRx.", link: "https://www.upwork.com/jobs/~14", pubDate: now, budget: "$45-$70/hr", skills: ["Angular", "TypeScript", "NgRx", "RxJS", "REST API"], category: "Web Development", jobType: "Hourly", experienceLevel: "Expert", clientCountry: "United States" },
    { id: "fb15", title: "Blockchain Smart Contract Developer (Solidity)", description: "Need a Solidity developer to write and audit smart contracts for our DeFi platform. Includes token contracts, staking mechanisms, governance, and liquidity pools. Must have experience with Hardhat, OpenZeppelin, and security best practices.", link: "https://www.upwork.com/jobs/~15", pubDate: now, budget: "$80-$150/hr", skills: ["Solidity", "Ethereum", "Hardhat", "Web3.js", "DeFi"], category: "Blockchain", jobType: "Hourly", experienceLevel: "Expert", clientCountry: "Switzerland" },
    { id: "fb16", title: "Flutter Developer for Cross-Platform App", description: "Looking for a Flutter developer to build a cross-platform delivery tracking app. Features include real-time GPS tracking, push notifications, payment integration, and driver/customer interfaces. Need experience with Firebase and Google Maps API.", link: "https://www.upwork.com/jobs/~16", pubDate: now, budget: "$6,000 - $12,000", skills: ["Flutter", "Dart", "Firebase", "Google Maps API", "REST API"], category: "Mobile Development", jobType: "Fixed", experienceLevel: "Intermediate", clientCountry: "UAE" },
    { id: "fb17", title: "AWS Solutions Architect for Migration Project", description: "Need an AWS solutions architect to plan and execute migration of on-premise infrastructure to AWS. Involves EC2, RDS, S3, CloudFront, Lambda, and VPC setup. Must create architecture diagrams, cost estimates, and migration runbooks.", link: "https://www.upwork.com/jobs/~17", pubDate: now, budget: "$75-$120/hr", skills: ["AWS", "Cloud Architecture", "Terraform", "Docker", "Linux"], category: "DevOps", jobType: "Hourly", experienceLevel: "Expert", clientCountry: "United States" },
    { id: "fb18", title: "Graphic Designer for Brand Identity Package", description: "We need a graphic designer to create a complete brand identity for our tech startup. Deliverables: logo, color palette, typography, business cards, letterhead, social media templates, and brand guidelines document. Modern, minimal aesthetic preferred.", link: "https://www.upwork.com/jobs/~18", pubDate: now, budget: "$2,000 - $4,000", skills: ["Logo Design", "Adobe Illustrator", "Brand Identity", "Adobe Photoshop", "Typography"], category: "Graphic Design", jobType: "Fixed", experienceLevel: "Intermediate", clientCountry: "Canada" },
  ];

  // Filter by relevance to query
  const keywords = q.split(/\s+/).filter(k => k.length > 2);
  if (keywords.length === 0) return allJobs;

  const scored = allJobs.map(job => {
    const text = `${job.title} ${job.description} ${job.skills.join(" ")} ${job.category}`.toLowerCase();
    const matchCount = keywords.filter(k => text.includes(k)).length;
    return { job, score: matchCount };
  });

  scored.sort((a, b) => b.score - a.score);
  // Return all but put best matches first
  return scored.map(s => s.job);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "web development";
  const url = `https://www.upwork.com/ab/feed/jobs/rss?q=${encodeURIComponent(q)}&sort=recency`;

  // Try RSS fetch with rotating user agents
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": getRandomUA(),
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        next: { revalidate: 0 },
      });

      if (res.ok) {
        const xml = await res.text();
        const jobs = parseRSS(xml);
        if (jobs.length > 0) {
          return NextResponse.json({ jobs, source: "rss" });
        }
      }
    } catch {
      // Try next attempt
    }
  }

  // All attempts failed — return fallback data
  const fallbackJobs = generateFallbackJobs(q);
  return NextResponse.json({ jobs: fallbackJobs, source: "fallback" });
}
