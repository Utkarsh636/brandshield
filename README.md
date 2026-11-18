# BrandShield

**AI-Powered Brand Governance Platform**

> Review every piece of content against your brand guidelines before it goes live. Catch inconsistencies in tone, terminology, facts, and messaging — and fix them with one click.

---

## What It Does

1. **Upload brand guidelines** — paste your guidelines, AI parses them into structured rules
2. **Submit content for review** — emails, ads, blogs, social posts — AI checks against every active rule
3. **See explainable findings** — each violation shows the flagged text, matched rule, explanation, and suggested fix
4. **Auto-fix with one click** — apply all suggested corrections instantly, see a before/after diff, re-review
5. **Approve or reject** — complete the workflow with status tracking and notifications

---

## Key Features

| Feature | Description |
|---------|-------------|
| **AI Content Review** | Groq-powered LLM checks content against all active brand rules in seconds |
| **Auto-Fix All** | One-click applies every suggested fix with side-by-side before/after diff and change log |
| **Brand Rule Engine** | AI parses raw guidelines into structured, categorized rules (tone, terminology, facts, messaging, accessibility) |
| **Explainable Findings** | Severity badges, category badges, flagged text (red), suggested fix (green), matched rule reference |
| **Compliance Scoring** | 0-100 score color-coded by severity with AI-generated review summary |
| **Approval Workflow** | Approve, Reject, Request Revision with toast notifications |
| **Governance Dashboard** | Stat cards, findings by category/severity bar charts, recent content with scores |
| **Mobile Responsive** | Hamburger menu with sidebar overlay on small screens |
| **Rich Demo Data** | 5 pre-seeded content items, 6 brand rules, 15 findings — ready to demo instantly |

---

## Demo Walkthrough

1. Open the app and click **Get Started**
2. Click the **Admin** quick-login button (one click, no typing)
3. **Dashboard** — see 5 content items, compliance stats, findings breakdown
4. **Submit Content** — click **Load Sample** (top right) to fill a bad email, submit for review
5. **Content Detail** — see score (~18/100), 8 findings with explanations and suggested fixes
6. **Auto-Fix All** — click the purple button, see before/after diff, save and re-review
7. Score jumps to **85+** — content is now brand-compliant
8. Click **Approve** to complete the workflow

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@brandshield.com | admin123 |
| Creator | creator@brandshield.com | creator123 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon serverless), Prisma ORM |
| AI / LLM | Groq SDK (Qwen 3.8 27B) |
| Auth | NextAuth.js (JWT sessions, credentials provider) |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- [Groq API key](https://console.groq.com) (free)

### Setup

```bash
# Clone
git clone https://github.com/Utkarsh636/brandshield.git
cd brandshield

# Install
npm install

# Environment
cp .env.example .env
# Edit .env with your DATABASE_URL, GROQ_API_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL

# Database
npx prisma db push
npm run db:seed

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/dbname?sslmode=require"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="your-key-from-console.groq.com"
```

---

## Project Structure

```
src/
  app/
    api/
      auth/[...nextauth]/     # NextAuth handler
      content/                 # Content CRUD + AI review
      content/[id]/fix/        # Auto-fix engine
      content/[id]/review/     # Re-run AI review
      dashboard/               # Stats aggregation
      guidelines/              # Guideline CRUD + AI parsing
      rules/                   # Rule management
    dashboard/                 # Dashboard pages (submit, content, rules, guidelines)
    login/                     # Login page
  components/                  # Sidebar, DashboardLayout
  lib/
    ai.ts                      # AI functions (reviewContent, parseGuidelines)
    auth.ts                    # NextAuth config
    db.ts                      # Prisma client
prisma/
  schema.prisma                # 6 models, 6 enums
  seed.ts                      # Rich demo data
```

---

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel Dashboard → Settings → Environment Variables.




