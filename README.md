# Viral Caption Studio

> AI-powered viral content generator for Facebook creators — built with Next.js 15, OpenAI GPT-4, Stripe, and Prisma.

---

## Features

- **AI Content Generator** — Generate 5 unique viral variations per prompt using GPT-4o-mini
- **11 Content Types** — Reel captions, viral hooks, hashtags, giveaway posts, shoutouts, and more
- **4 Platforms** — Facebook, TikTok, Instagram, YouTube Shorts
- **8 Tones** — Including Tagalog and Taglish for Filipino creators
- **Save & Library** — Save, edit, delete, and search your generated content
- **9 Templates** — Ready-made prompts for the most popular use cases
- **Stripe Billing** — Free, Pro ($19/mo), and Creator Pro ($49/mo) plans
- **Usage Limits** — Free users get 10 generations/day; Pro is unlimited
- **Admin Dashboard** — User management, generation logs, analytics
- **Auth** — Email/password + Google OAuth with NextAuth

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI + custom components |
| Auth | NextAuth v4 |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI GPT-4o-mini |
| Payments | Stripe |
| Deployment | Vercel |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud — Neon is free)
- OpenAI API key
- Stripe account (optional for payments)
- Google OAuth credentials (optional)

### 1. Install Dependencies

```bash
cd viral-caption-studio
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```
DATABASE_URL="postgresql://username:password@localhost:5432/viral_caption_studio"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Set Up the Database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed sample data (optional)
```

After seeding, test accounts are created:
- **Admin**: admin@viralcaption.studio / admin123456
- **Pro**: pro@demo.com / demo123456
- **Free**: free@demo.com / demo123456

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Setting Up External Services

### OpenAI
1. Go to platform.openai.com and create an API key
2. Add to OPENAI_API_KEY in .env.local

### Stripe (Payments)
1. Create a Stripe account at stripe.com
2. Get test API keys from Dashboard
3. Create two products: Pro ($19/mo) and Creator Pro ($49/mo)
4. Copy Price IDs to STRIPE_PRO_PRICE_ID and STRIPE_CREATOR_PRO_PRICE_ID
5. For local webhooks: stripe listen --forward-to localhost:3000/api/stripe/webhook
6. Copy webhook secret to STRIPE_WEBHOOK_SECRET

### Google OAuth
1. Go to Google Cloud Console, create a project
2. Enable Google+ API, create OAuth 2.0 credentials
3. Add http://localhost:3000/api/auth/callback/google as redirect URI
4. Add credentials to .env.local

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo at vercel.com
3. Add all env vars from .env.local
4. Change NEXTAUTH_URL and NEXT_PUBLIC_APP_URL to your production URL
5. Run: npx prisma migrate deploy && npx prisma db seed

For Stripe webhooks in production, add: https://your-domain.com/api/stripe/webhook

---

## User Roles

| Role | Capabilities |
|------|-------------|
| FREE | 10 generations/day, save up to 50 captions |
| PRO | Unlimited generations, unlimited saves |
| ADMIN | All Pro features + admin dashboard |

To make a user admin:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';

---

## Common Issues

- Cannot connect to database: Check DATABASE_URL format
- OpenAI API error: Verify OPENAI_API_KEY is valid and has credits
- NextAuth error: Make sure NEXTAUTH_SECRET is set
- Prisma generate fails: Run npx prisma generate before building
