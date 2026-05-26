# SkillMango Docker VPS Deployment

This guide targets a single VPS running Docker Compose with Postgres, Redis, the Nest API, and the Next.js web app. Real secrets are supplied through env files on the server and are never committed.

## 1. Server Prep

- Install Docker Engine and Docker Compose.
- Clone the repository on the VPS.
- Create production env files from the examples:
  - `apps/api/.env`
  - `apps/web/.env.local`
- Set `APP_ENV=production`.
- Set `APP_URL` to the API origin without `/api/v1`.
- Set `FRONTEND_URL` and `NEXT_PUBLIC_APP_URL` to the public web origin.
- Set `NEXT_PUBLIC_API_URL` to the public API base path, for example `https://api.example.com/api/v1`.

## 2. Required Production Secrets

Set strong, unique values for:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `AUTH_TOKEN_PEPPER`
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, if Stripe is enabled
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`, if Razorpay is enabled
- `OPENAI_API_KEY` or another configured AI provider key
- `RESEND_API_KEY`
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, and optional `S3_ENDPOINT`

Leaving payment keys empty keeps checkout in dev pending mode and does not grant access.

## 3. Database Migration

Run Prisma generation and deploy migrations before starting the new API:

```bash
pnpm install --frozen-lockfile
pnpm --filter @skillmango/api db:generate
pnpm --filter @skillmango/api db:migrate:prod
```

Use `db:migrate:prod` for production. Do not use `db:push` against production databases.

## 4. Build And Start

```bash
pnpm build
docker compose -f docker/docker-compose.yml up -d postgres redis
pnpm --filter @skillmango/api start:prod
pnpm --filter @skillmango/web start
```

If you package API and web as containers, run the same commands inside the images during build/start: install, generate Prisma client, build, then start from compiled output.

## 5. Health Checks

Check these after deploy:

```bash
curl https://api.example.com/api/v1/health
curl https://api.example.com/api/v1/admin/health
curl https://app.example.com
```

The health output should show database, Redis, queue, and provider configuration booleans without exposing secret values.

## 6. Logs And Rollback

Use your process manager or Docker logs:

```bash
docker compose -f docker/docker-compose.yml logs -f postgres redis
```

For application services, capture stdout/stderr with your runtime manager. To roll back:

1. Stop API and web services.
2. Re-deploy the previous build artifact or image tag.
3. Restart API and web.
4. Re-check `/api/v1/health`.

Avoid rolling database migrations backward manually unless a tested down-migration or restore plan exists. For high-risk releases, take a database backup before `db:migrate:prod`.
