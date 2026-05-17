# RetireAI — AI Retirement Planner

A full-stack SaaS web app that helps anyone plan their retirement. Input your financial details and get AI-powered projections, scenario comparisons, and personalized recommendations.

## Tech Stack

- **Framework** — Next.js 16 (App Router, TypeScript)
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **Charts** — Recharts
- **Auth + Database** — Supabase (email/password + PostgreSQL)
- **AI** — Claude API (Anthropic)
- **Deployment** — Vercel

## Features

- **Dashboard** — Projected savings, monthly surplus, years to retire, readiness score
- **Savings chart** — Projected vs target growth over time
- **Readiness breakdown** — Progress bars across 4 key retirement indicators
- **AI recommendations** — Personalized insights powered by Claude
- **Scenario comparison** — Conservative, moderate, and aggressive return scenarios
- **Full AI report** — Bull/bear analysis, risk assessment, action items
- **Theme picker** — 5 color themes saved to localStorage
- **Dark mode** — Persisted across sessions

## Getting Started

```bash
# Install dependencies
npm install

# Add environment variables
cp .env.example .env.local
# Fill in your Supabase and Anthropic keys

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

## Project Structure

```
app/
  page.tsx                  # Landing page
  dashboard/page.tsx        # Main dashboard
  dashboard/planner/        # Financial details form
  dashboard/scenarios/      # Scenario comparison
  dashboard/report/         # Full AI report
  api/ai-report/route.ts    # Claude API route
components/
  dashboard/                # Dashboard layout + shell
  charts/                   # Recharts wrappers
  ui/                       # shadcn components
lib/
  supabase.ts               # Supabase client
  calculations.ts           # Retirement math
  types.ts                  # TypeScript types
```
