# SkillMango AI

AI-powered creator learning platform — launch courses, communities, workshops, memberships, and digital products with AI tools built in.

## Workspace Structure

```
skillmango-ai/
├─ apps/
│   ├─ web/          # Next.js 15 frontend
│   └─ api/          # NestJS backend
├─ packages/
│   └─ shared/       # Shared types, schemas, constants
├─ docker/
│   └─ docker-compose.yml
└─ package.json
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start databases
docker compose -f docker/docker-compose.yml up -d

# Generate Prisma client & run migrations
pnpm db:generate
pnpm db:migrate

# Start development servers
pnpm dev
```

- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **Prisma Studio**: `pnpm db:studio`

## Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Frontend    | Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui |
| Backend     | NestJS, TypeScript, Prisma ORM                |
| Database    | PostgreSQL + pgvector                         |
| Cache/Queue | Redis + BullMQ                                |
| Real-time   | Socket.IO + Redis adapter                     |
| AI          | OpenAI / Gemini / Claude / GLM + pgvector RAG |
| Payments    | Stripe + Razorpay                             |
| Storage     | S3-compatible (Cloudflare R2 / AWS S3)        |
| Email       | Resend                                        |
| Monorepo    | Turborepo + pnpm                              |