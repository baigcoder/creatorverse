# CreatorVerse

CreatorVerse is a full-stack creator learning platform for launching and managing online education businesses. It brings together course creation, workshops, communities, memberships, digital products, checkout, AI-assisted authoring, analytics, admin workflows, and realtime learner engagement in one production-oriented monorepo.

The public repository and project name is **CreatorVerse**. Some internal workspace package names still use the existing `@skillmango/*` scope for compatibility with the current codebase.

## Project Goal

CreatorVerse is designed to help creators, educators, and learning businesses ship paid learning experiences without stitching together many separate tools. The goal is to provide a practical SaaS foundation where creators can build content, sell access, support learners, measure outcomes, and automate repetitive work with AI.

## Core Features

| Area | Capabilities |
| --- | --- |
| Creator dashboard | Manage courses, workshops, memberships, products, landing pages, marketing, analytics, and media. |
| Course builder | Create courses with sections, lessons, quizzes, assignments, progress tracking, and publishing flows. |
| Learner experience | Browse courses and workshops, enroll, complete lessons, submit quizzes and assignments, earn certificates, and use AI tutor flows. |
| Communities | Run rooms, posts, comments, reactions, and creator-led learner discussions. |
| Monetization | Sell courses, memberships, workshops, and digital products with Stripe and Razorpay integration paths. |
| AI tools | Generate course outlines, lesson scripts, quizzes, tutor responses, assignment feedback, embeddings, and course improvement suggestions. |
| Media and storage | Create upload policies, complete media uploads, and serve protected assets through S3-compatible storage. |
| Analytics | Track events, creator overviews, funnels, community metrics, and admin reporting surfaces. |
| Admin operations | Manage users, creators, courses, payments, reports, moderation, logs, settings, and system health. |
| Realtime | Socket.IO gateway with Redis adapter support for realtime platform events. |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn-style UI primitives, Framer Motion |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL with Prisma migrations and pgvector-ready architecture |
| Cache and queues | Redis, BullMQ |
| Realtime | Socket.IO, Redis adapter |
| Auth | JWT access and refresh tokens, httpOnly cookies, CSRF protection, role and permission guards, optional Supabase Auth exchange |
| Payments | Stripe, Razorpay |
| Storage | S3-compatible storage such as AWS S3 or Cloudflare R2 |
| Email | Resend |
| AI providers | OpenAI, Gemini, Anthropic-compatible provider paths |
| Tooling | pnpm, Turborepo, Vitest, Playwright, ESLint, Docker Compose |

## Monorepo Structure

```text
creatorverse/
├─ apps/
│  ├─ web/              # Next.js frontend
│  └─ api/              # NestJS API server
├─ packages/
│  └─ shared/           # Shared constants, schemas, and TypeScript types
├─ docker/
│  └─ docker-compose.yml
├─ docs/                # Deployment and provider-specific notes
├─ e2e/                 # Playwright end-to-end tests
├─ infra/
│  └─ aws-video-storage # Terraform for S3 video/media storage
├─ scripts/
│  └─ clean-next.cjs
├─ README_API.md        # Detailed API, environment, and endpoint reference
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

## Local Setup

### Prerequisites

| Tool | Required for |
| --- | --- |
| Node.js 20+ | Running the web app, API, tests, and build scripts |
| pnpm 9+ | Installing and running the monorepo |
| Docker Desktop | Local PostgreSQL and Redis through Docker Compose |
| GitHub CLI | Publishing changes to GitHub from local workflows |

### 1. Install dependencies

```powershell
pnpm install
```

### 2. Copy environment files

PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

Bash:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Start local infrastructure

```powershell
docker compose -f docker/docker-compose.yml up -d
```

This starts the local PostgreSQL and Redis services expected by the API.

### 4. Prepare the database

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. Start development servers

```powershell
pnpm dev
```

Default local URLs:

| Service | URL |
| --- | --- |
| Web app | `http://localhost:3000` |
| API base | `http://localhost:4000/api/v1` |
| API health | `http://localhost:4000/api/v1/health` |
| WebSocket | `ws://localhost:4000` |
| Prisma Studio | `pnpm db:studio` |

## Environment Variables

CreatorVerse uses separate environment files for the API and web app.

| File | Purpose |
| --- | --- |
| `apps/api/.env` | Server-only database, Redis, auth, payment, AI, email, and storage configuration |
| `apps/web/.env.local` | Browser-visible frontend configuration such as API URL and Supabase publishable settings |

Important groups:

| Group | Variables |
| --- | --- |
| Core app | `APP_PORT`, `APP_ENV`, `APP_URL`, `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL` |
| Database and Redis | `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT` |
| Auth | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `AUTH_TOKEN_PEPPER`, `REQUIRE_EMAIL_VERIFICATION` |
| Supabase Auth | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_JWKS_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Payments | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| AI | `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` |
| Email | `RESEND_API_KEY`, `EMAIL_FROM` |
| Storage | `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION` |

See `README_API.md` for the full production environment table and endpoint reference.

## Useful Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the monorepo development stack through Turborepo. |
| `pnpm build` | Build all workspace packages and apps. |
| `pnpm build:api` | Build only the NestJS API workspace. |
| `pnpm build:web` | Clean Next.js output and build only the web workspace. |
| `pnpm lint` | Run lint checks across the monorepo. |
| `pnpm typecheck` | Run TypeScript checks across the monorepo. |
| `pnpm test` | Run workspace tests. |
| `pnpm test:e2e` | Run Playwright end-to-end tests. |
| `pnpm db:generate` | Generate the Prisma client for the API workspace. |
| `pnpm db:migrate` | Run local Prisma migrations. |
| `pnpm db:seed` | Seed local development data. |
| `pnpm db:studio` | Open Prisma Studio. |
| `pnpm clean:web` | Remove stale Next.js build output before build or e2e flows. |

## API And Realtime Overview

The API is organized around creator-learning SaaS modules:

| Module group | Examples |
| --- | --- |
| Auth and users | Registration, login, logout, refresh, password reset, email verification, profile lookup |
| Courses and learning | Courses, sections, lessons, enrollments, progress, quizzes, assignments, grading |
| Commerce | Checkout, payment verification, webhooks, refunds, coupons, memberships, products, affiliates |
| Creator operations | Workshops, communities, landing pages, marketing campaigns, media assets |
| AI | Course outlines, lesson scripts, quizzes, tutor chat, embeddings, assignment feedback |
| Analytics | Event ingestion, creator overview, funnels, community metrics |
| Admin | Users, creators, courses, payments, reports, moderation, logs, settings, system health |
| Realtime | Socket.IO gateway for live platform events, backed by Redis when configured |

The main API prefix is `/api/v1`. The fastest local readiness check is:

```powershell
Invoke-RestMethod http://localhost:4000/api/v1/health
```

## Security And Auth

- Browser sessions use httpOnly access and refresh cookies.
- Refresh tokens rotate, and reuse detection revokes active sessions.
- Mutating browser requests use a CSRF cookie/header flow from `GET /auth/csrf`.
- Global guards enforce JWT auth, role checks, permission checks, and CSRF protection.
- Creator-owned resources must pass ownership checks before mutation.
- Supabase Auth can be used as an identity provider while preserving the API's existing session cookies.
- Production secrets must be set through environment variables or a secret manager, never committed to Git.

## Deployment Notes

- Build containers are defined in `docker/Dockerfile.api` and `docker/Dockerfile.web`.
- `docker/docker-compose.yml` provides a local and VPS-friendly service layout for API, web, PostgreSQL, and Redis.
- `docs/DOCKER_VPS_DEPLOYMENT.md` covers Docker VPS deployment flow.
- `docs/PAYMENT_WEBHOOK_TESTING.md` covers Stripe and Razorpay webhook verification.
- `docs/AWS_VIDEO_STORAGE.md` and `infra/aws-video-storage/` cover S3-compatible media storage setup.
- Production readiness depends on real provider credentials for payments, email, AI, storage, Supabase, PostgreSQL, and Redis.

## Current Status

CreatorVerse is a production-oriented monorepo with the major SaaS surfaces present across web, API, database, realtime, AI, payments, media, analytics, and admin modules.

Current hardening areas:

- Expand deep end-to-end coverage for creator and learner journeys.
- Run provider-specific production tests for Stripe, Razorpay, Resend, S3-compatible storage, Supabase, and AI providers.
- Add richer video processing and transcoding workflows.
- Improve visual landing-page editing depth.
- Add deployment monitoring and operational dashboards.

## Repository

- GitHub: `https://github.com/baigcoder/creatorverse`
- Default branch: `dev`
- Public project name: `CreatorVerse`
- Internal package scope: `@skillmango/*`
