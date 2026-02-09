# Upwork Hunter

> AI-powered Upwork job hunting platform that helps freelancers find relevant jobs, generate personalized proposals, and track performance—all powered by Google Gemini AI.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285f4)](https://ai.google.dev/)

## Overview

Upwork Hunter is a comprehensive SaaS web application designed to automate and optimize the Upwork freelancing workflow. By combining real-time job data from Upwork RSS feeds with Google Gemini AI, it provides intelligent job matching, automated proposal generation, performance analytics, and auto-reply capabilities.

**Live Demo:** [upwork-hunter.vercel.app](#)

## Key Features

### 🎯 Vibe Scan - Intelligent Job Search
- Natural language job search powered by AI
- Real-time job fetching from Upwork RSS feeds
- Advanced filters (category, experience level, job type, country)
- Smart fallback system with 18 curated jobs when RSS is unavailable
- AI-powered relevance matching (score 0-100)
- Batch job scoring to minimize API calls
- Color-coded match indicators (red <40%, yellow 40-70%, green >70%)

### 🤖 AI Proposal Generator
- One-click personalized proposal generation using Google Gemini
- Integrates user profile data with job requirements
- Editable proposals with copy-to-clipboard functionality
- Proposal history tracking with status management (draft, sent, viewed, replied)
- Custom template creation and management
- Reusable templates for common scenarios

### 📊 Analytics Dashboard
- Real-time performance metrics (jobs scanned, proposals sent, response rate)
- 14-day proposal activity chart
- Match score distribution histogram
- Jobs by category analysis
- Status breakdown for jobs and proposals
- Data export to JSON for external analysis

### 👤 Profile Management
- Comprehensive professional profile setup
- Skills management with proficiency levels (1-5 stars)
- Hourly rate configuration
- Experience level selection
- Preferred categories (12+ options)
- Portfolio and GitHub link integration
- All data persisted locally with localStorage

### 📈 Job Tracking Dashboard
- Overview stats cards (jobs scanned, proposals sent, avg match score, response rate)
- Weekly proposals visualization (7-day bar chart)
- Recent activity feed (last 8 activities)
- Quick actions for common tasks
- Saved jobs list with match scores

### 💬 Auto-Reply Templates
- Create conditional auto-reply templates
- Set triggers based on match score thresholds
- Toggle templates on/off
- Preview and edit template messages
- Template status tracking (active/paused)

### ⚙️ Settings & Configuration
- Light/Dark mode toggle with system detection
- AI model selection (Gemini 2.0 Flash or 1.5 Pro)
- Notification preferences
- Optional Gemini API key override
- Data management (export all, clear all)

## Tech Stack

### Frontend
- **Next.js 14.2.18** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type safety and developer experience
- **Tailwind CSS 3.4.15** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Space Grotesk** - Google Font for clean typography

### State Management
- **Zustand 5.0.0** - Lightweight state management
- **localStorage** - Client-side persistence (no backend database required)

### AI & APIs
- **Google Generative AI (Gemini)** - Job scoring and proposal generation
  - Gemini 2.0 Flash (default, fast)
  - Gemini 1.5 Pro (optional, higher quality)
- **Upwork RSS Feeds** - Real-time job data
- **fast-xml-parser 4.5.0** - RSS feed parsing

### Design System
- **Neobrutalism UI** - Bold borders, shadows, vibrant colors
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - System-aware with manual toggle
- **Custom CSS Components** - Card, button, badge, input classes

## Installation

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:Mahad-007/upwork-hunter.git
   cd upwork-hunter/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the `web` directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
   - Import project from GitHub
   - Select the `web` directory as the root

2. **Configure environment variables**
   - Add `GEMINI_API_KEY` in Vercel project settings

3. **Deploy**
   ```bash
   npx vercel --yes
   ```

The application will be live at your Vercel URL (e.g., `https://upwork-hunter.vercel.app`)

### Alternative Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted (VPS with Node.js)

## Usage Guide

### Getting Started

1. **Visit the landing page** to learn about features and pricing
2. **Click "Get Started"** to access the dashboard
3. **Set up your profile** (`/profile`) with:
   - Your name and professional title
   - Skills with proficiency levels
   - Hourly rate range
   - Experience level
   - Preferred job categories
   - Portfolio links

### Finding Jobs

1. **Navigate to Vibe Scan** (`/jobs`)
2. **Describe your ideal job** in natural language (e.g., "React developer with TypeScript experience")
3. **Apply filters** for category, experience level, job type, or country
4. **Click "AI Score All"** to get match scores for all jobs
5. **Bookmark interesting jobs** for later

### Generating Proposals

1. **Go to Proposals page** (`/proposals`)
2. **Select a saved job** from the dropdown
3. **Click "Generate Proposal"** to create an AI-powered proposal
4. **Edit the proposal** as needed
5. **Copy to clipboard** and paste into Upwork

### Tracking Performance

1. **Visit Analytics** (`/analytics`) to view:
   - Total jobs scored and proposals generated
   - Average match score
   - Proposals per day (14-day chart)
   - Match score distribution
   - Jobs by category breakdown
2. **Export data** as JSON for further analysis

### Setting Up Auto-Replies

1. **Navigate to Auto-Reply** (`/auto-reply`)
2. **Create templates** with custom messages
3. **Set conditions** (e.g., match score above 70%)
4. **Toggle templates on/off** as needed

## API Routes

The application exposes three API endpoints:

### `GET /api/jobs`
Fetches and parses Upwork RSS feeds.

**Query Parameters:**
- `q` (string, optional) - Search keyword

**Response:**
```json
{
  "jobs": [
    {
      "id": "abc123",
      "title": "Full Stack Developer",
      "description": "...",
      "budget": "$30-$50/hr",
      "skills": ["React", "Node.js"],
      "category": "Web Development",
      "jobType": "Hourly",
      "experienceLevel": "Intermediate",
      "clientCountry": "United States",
      "link": "https://www.upwork.com/...",
      "pubDate": "2025-01-15T10:30:00Z"
    }
  ],
  "source": "rss"
}
```

### `POST /api/ai/score`
Scores jobs against user profile using Google Gemini.

**Request Body:**
```json
{
  "jobs": [...],
  "profile": {
    "name": "John Doe",
    "skills": [{"name": "React", "level": 5}],
    "hourlyRateMin": 30,
    "hourlyRateMax": 80,
    "experience": "Expert",
    "categories": ["Web Development"]
  }
}
```

**Response:**
```json
{
  "scores": [
    {"id": "abc123", "score": 85},
    {"id": "def456", "score": 72}
  ]
}
```

### `POST /api/ai/proposal`
Generates a personalized proposal using Google Gemini.

**Request Body:**
```json
{
  "job": {...},
  "profile": {...}
}
```

**Response:**
```json
{
  "proposal": "Hi there,\n\nI noticed your project and I'm very interested..."
}
```

## Data Models

### UserProfile
```typescript
interface UserProfile {
  name: string
  title: string
  bio: string
  skills: { name: string; level: number }[]
  hourlyRateMin: number
  hourlyRateMax: number
  experience: "Entry Level" | "Intermediate" | "Expert"
  categories: string[]
  portfolioLinks: string[]
}
```

### SavedJob
```typescript
interface SavedJob {
  id: string
  title: string
  link: string
  budget: string
  description: string
  skills: string[]
  category: string
  jobType: "Hourly" | "Fixed"
  experienceLevel: string
  clientCountry: string
  pubDate: string
  status: "saved" | "applied" | "rejected"
  score?: number
  savedAt: string
}
```

### SavedProposal
```typescript
interface SavedProposal {
  id: string
  jobId: string
  jobTitle: string
  text: string
  createdAt: string
  status: "draft" | "sent" | "viewed" | "replied"
  score?: number
}
```

## Project Structure

```
upwork-hunter/
├── web/                      # Main Next.js application
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   │   ├── page.tsx    # Landing page
│   │   │   ├── dashboard/  # Dashboard page
│   │   │   ├── jobs/       # Job search (Vibe Scan)
│   │   │   ├── proposals/  # Proposal generator
│   │   │   ├── profile/    # Profile setup
│   │   │   ├── analytics/  # Analytics dashboard
│   │   │   ├── auto-reply/ # Auto-reply templates
│   │   │   ├── settings/   # Settings page
│   │   │   └── api/        # API routes
│   │   │       ├── jobs/   # RSS proxy
│   │   │       └── ai/     # AI endpoints
│   │   ├── components/     # React components
│   │   ├── lib/            # Utility libraries
│   │   │   ├── gemini.ts  # Gemini AI integration
│   │   │   ├── rss.ts     # RSS parser
│   │   │   └── utils.ts   # Helper functions
│   │   └── store/          # Zustand state management
│   ├── public/             # Static assets
│   ├── package.json
│   └── next.config.mjs
├── README.md
└── TASK.md                  # Project requirements
```

## Features Deep Dive

### AI Job Scoring Algorithm

The scoring system analyzes multiple factors:
- **Skills Match**: Weighted by proficiency level (1-5 stars)
- **Rate Compatibility**: Job budget vs. user hourly rate
- **Experience Level**: Entry/Intermediate/Expert alignment
- **Category Relevance**: User's preferred categories
- **Job Description**: Semantic analysis of job requirements

Scores are cached to avoid redundant API calls and improve performance.

### Fallback System

When Upwork RSS feeds are unavailable (rate limits, network issues), the application serves 18 curated fallback jobs across multiple categories:
- Web Development
- Mobile Development
- UI/UX Design
- Data Science
- Content Writing
- Digital Marketing
- DevOps

This ensures users always have jobs to browse and test the AI features.

### State Management Architecture

All application state is managed by Zustand with automatic localStorage persistence:
- **Profile data**: Skills, rates, preferences
- **Saved jobs**: Bookmarked jobs with status tracking
- **Proposals**: Generated proposals with edit history
- **Score cache**: Job scores to avoid re-scoring
- **Activities**: Last 50 user actions
- **Settings**: Theme, notifications, AI model preference

State is hydrated on application load, ensuring data persistence across sessions.

## Performance Optimizations

- **Batch Job Scoring**: Process 5-10 jobs per API request
- **Score Caching**: Store scores in memory and localStorage
- **Skeleton Loading**: Smooth loading states
- **Image Optimization**: Next.js automatic image optimization
- **Client-Side Hydration**: SSR-safe localStorage access
- **Retry Logic**: 3 attempts for RSS fetching with rotating user agents

## Security Considerations

- **API Key Protection**: Gemini API key stored in environment variables
- **Client-Side Storage**: User data stored locally (no backend database)
- **CORS Proxy**: API routes proxy requests to avoid CORS issues
- **No Authentication Required**: For MVP/demo purposes
- **Rate Limiting**: Client-side rate limiting for API calls

## Roadmap

Future enhancements planned:
- [ ] User authentication and cloud sync
- [ ] Browser extension for one-click bidding
- [ ] Email notifications for high-match jobs
- [ ] Advanced analytics with ML insights
- [ ] Team collaboration features
- [ ] Integration with other freelance platforms (Fiverr, Freelancer)
- [ ] Mobile app (React Native)
- [ ] Webhook support for external integrations
- [ ] A/B testing for proposal templates

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or feature requests:
- Open an issue on [GitHub](https://github.com/Mahad-007/upwork-hunter/issues)
- Email: support@upworkhunter.com

## Acknowledgments

- **Google Gemini AI** for powerful natural language processing
- **Upwork** for RSS job feeds
- **Vercel** for seamless deployment
- **Next.js Team** for an amazing React framework
- **shadcn/ui** for beautiful UI components inspiration

---

Built with ❤️ by freelancers, for freelancers.
