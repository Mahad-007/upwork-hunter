# Upwork Hunter — Build Task

## OBJECTIVE
Build a complete AI-powered Upwork job hunting web application. Deploy to Vercel. Produce a working URL.

## GITHUB
- Repo: git@github.com:Mahad-007/upwork-hunter.git
- Branch: main
- Push commits as you go

## GEMINI API KEY
AIzaSyBk90BG6BYGYiW08kKwTrEsiAxrsJ9cp-M

## TECH STACK
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Google Gemini API (@google/generative-ai)
- Upwork RSS feeds for job data
- Zustand for state
- localStorage for persistence (no backend DB needed for MVP)

## FEATURES (Priority Order)

### 1. Profile Setup Page
- User enters: name, skills (tags), hourly rate range, experience level, preferred categories
- Saved to localStorage
- This drives the AI matching

### 2. Job Search & Listing
- Fetch Upwork jobs via RSS feeds (use /api/jobs route as proxy to avoid CORS)
- RSS URL format: https://www.upwork.com/ab/feed/jobs/rss?q=KEYWORD&sort=recency
- Parse with fast-xml-parser
- Display as cards with: title, budget, description snippet, skills, posting time, client info
- Filters: keyword search, budget range, experience level, job type (fixed/hourly), posting time
- Pagination

### 3. AI Job Scoring
- For each job, use Gemini to calculate a match score (0-100) based on user profile
- Show score badge on each job card
- Sort by score option
- Use batch processing — score jobs in batches of 5 to minimize API calls
- Cache scores in localStorage

### 4. AI Proposal Generator
- Click "Generate Proposal" on any job
- Gemini generates a tailored proposal based on: job description + user profile + best practices
- Editable text area with the generated proposal
- Copy to clipboard button
- Save proposals history

### 5. Job Tracking Dashboard
- Save jobs to: Applied, Saved, Rejected lists
- Track status changes
- Stats: total applied, response rate, etc.
- Main dashboard with overview charts

### 6. Smart Notifications (Visual)
- Highlight new high-match jobs (score > 80)
- Badge count on dashboard

## UI/UX Requirements
- Dark theme (professional, modern)
- Responsive — works on mobile browsers too
- Fast — skeleton loading states
- Clean typography, good spacing
- Sidebar navigation: Dashboard, Jobs, Proposals, Profile, Settings

## API Routes
- /api/jobs — proxy for Upwork RSS feeds, parse XML to JSON
- /api/ai/score — score jobs against user profile using Gemini
- /api/ai/proposal — generate proposal using Gemini

## IMPLEMENTATION APPROACH
1. `npx create-next-app@latest web --typescript --tailwind --app --src-dir`
2. Install deps: @google/generative-ai, fast-xml-parser, zustand, lucide-react
3. Setup shadcn/ui
4. Build lib/ (gemini client, RSS parser, scoring logic)
5. Build API routes
6. Build pages & components
7. Test each feature
8. Fix bugs, iterate
9. Push to GitHub
10. The repo is connected to Vercel — OR use Vercel CLI to deploy

## TESTING
- Test RSS parsing with real Upwork feeds
- Test Gemini integration
- Test all pages render correctly
- Fix any build errors before deploying

## DEPLOYMENT
- Use `npx vercel --yes` or connect via Vercel dashboard
- Make sure env vars are set (GEMINI_API_KEY)
- Verify the deployed URL works

## OUTPUT
When done, report back with:
1. The deployed Vercel URL
2. Summary of all features built
3. Any known issues or limitations
