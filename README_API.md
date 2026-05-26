# SkillMango AI API

SkillMango AI is a modular NestJS API for a creator-learning SaaS platform. It powers auth, creator dashboards, courses, workshops, communities, memberships, products, checkout, certificates, AI/RAG, analytics, notifications, marketing campaigns, admin operations, and realtime events.

## Local URLs

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api/v1`
- WebSocket: `ws://localhost:4000`

## Auth And Security

- Auth uses secure httpOnly cookies for access and refresh tokens.
- Mutating browser requests use the CSRF cookie/header flow from `GET /auth/csrf`.
- Refresh tokens rotate on refresh and reuse revokes active sessions.
- Global guards enforce JWT auth, roles, permissions, and CSRF, while `@Public()` marks public reads and webhooks.
- Creator-owned resources must pass ownership checks before mutation.

## Required Secrets And Keys

Full production provider coverage uses **15 secret or credential values**.

### Core Production Secrets

| Env var | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, includes DB credentials |
| `JWT_ACCESS_SECRET` | Access-token signing secret |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret |
| `AUTH_TOKEN_PEPPER` | Extra HMAC pepper for verification/reset/session token hashes |

### Provider Credentials

| Env var | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe checkout/refunds |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `RAZORPAY_KEY_ID` | Razorpay hosted checkout key |
| `RAZORPAY_KEY_SECRET` | Razorpay order creation and payment verification |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook verification |
| `OPENAI_API_KEY` | OpenAI generation and embeddings |
| `GEMINI_API_KEY` | Gemini generation/embeddings fallback |
| `ANTHROPIC_API_KEY` | Anthropic generation fallback |
| `RESEND_API_KEY` | Email queue delivery |
| `S3_ACCESS_KEY` | S3-compatible storage access |
| `S3_SECRET_KEY` | S3-compatible storage secret |

### Non-Secret Configuration

| Env var | Purpose |
| --- | --- |
| `APP_PORT` | API port, default `4000` |
| `APP_ENV` | `development`, `test`, or `production` |
| `APP_URL` | Public API origin |
| `FRONTEND_URL` | Web origin for CORS and email links |
| `REDIS_HOST`, `REDIS_PORT` | Redis for queues/realtime/rate limits |
| `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY` | Token lifetimes |
| `REQUIRE_EMAIL_VERIFICATION` | Blocks login until verified when true |
| `STRIPE_PUBLISHABLE_KEY` | Publishable Stripe browser key |
| `EMAIL_FROM` | Sender address |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION` | S3-compatible storage config |
| `THROTTLE_TTL`, `THROTTLE_LIMIT` | Global request throttle |
| `NEXT_PUBLIC_API_URL` | Web API base URL |
| `NEXT_PUBLIC_APP_URL` | Web app origin |

## Endpoint Groups

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`
- `GET /auth/csrf`
- `GET /auth/me`

### Courses And Learning

- `GET /courses`
- `POST /courses`
- `GET /courses/:id`
- `PATCH /courses/:id`
- `DELETE /courses/:id`
- `POST /courses/:id/publish`
- `POST /courses/:id/enroll`
- `GET /courses/:id/curriculum`
- `GET /courses/my-learning`
- `GET /courses/my-learning/:id`
- `POST /courses/:courseId/sections`
- `PATCH /courses/sections/:sectionId`
- `DELETE /courses/sections/:sectionId`
- `POST /courses/sections/:sectionId/lessons`
- `PATCH /courses/lessons/:lessonId`
- `DELETE /courses/lessons/:lessonId`
- `POST /courses/lessons/:lessonId/progress`
- `GET /courses/quizzes/:quizId`
- `POST /courses/quizzes/:quizId/submit`
- `GET /courses/assignments/:assignmentId`
- `POST /courses/assignments/:assignmentId/submit`
- `POST /assignments/:submissionId/grade`

### Monetization

- `POST /payments/checkout`
- `POST /payments/razorpay/verify`
- `POST /payments/webhook/stripe`
- `POST /payments/webhook/razorpay`
- `GET /orders`
- `POST /orders/:id/refund`
- `GET /coupons`
- `POST /coupons`
- `POST /coupons/validate`
- `GET /memberships`
- `POST /memberships`
- `POST /memberships/:id/subscribe`
- `GET /products`
- `POST /products`
- `GET /affiliates`
- `POST /affiliates`
- `GET /affiliates/:id/earnings`
- `POST /affiliates/:id/payout`

### Creator Operations

- `GET /workshops`
- `POST /workshops`
- `GET /workshops/:id`
- `PATCH /workshops/:id`
- `DELETE /workshops/:id`
- `POST /workshops/:id/register`
- `POST /workshops/:id/attendance`
- `GET /communities`
- `POST /communities`
- `GET /communities/:id`
- `PATCH /communities/:id`
- `POST /communities/:id/rooms`
- `POST /communities/rooms/:roomId/posts`
- `POST /communities/posts/:postId/comments`
- `POST /communities/posts/:postId/reactions`
- `POST /marketing/campaigns`
- `GET /marketing/campaigns`
- `PATCH /marketing/campaigns/:id`
- `POST /marketing/campaigns/:id/send`
- `GET /landing-pages`
- `POST /landing-pages`
- `PATCH /landing-pages/:id`

### Media, Certificates, AI, Analytics

- `POST /media/upload-policy`
- `POST /media/complete-upload`
- `GET /media/signed-url`
- `POST /certificates/generate`
- `GET /certificates/:id`
- `GET /certificates/:id/verify`
- `GET /certificates/:id/render`
- `POST /ai/course-outline`
- `POST /ai/lesson-script`
- `POST /ai/quiz-generator`
- `POST /ai/tutor-chat`
- `POST /ai/embed-course`
- `POST /ai/assignment-feedback`
- `POST /ai/suggest-improvements`
- `POST /analytics/events`
- `GET /analytics/creator-overview`
- `GET /analytics/funnel`
- `GET /analytics/community`

### Admin

- `GET /admin/users`
- `PATCH /admin/users/:id/status`
- `GET /admin/creators`
- `GET /admin/courses`
- `GET /admin/payments`
- `GET /admin/reports`
- `GET /admin/moderation`
- `PATCH /admin/moderation/:id`
- `GET /admin/logs`
- `GET /admin/system-health`
- `GET /admin/settings`
- `PATCH /admin/settings`

## Local Setup

```bash
pnpm install
pnpm --filter @skillmango/api db:generate
pnpm db:seed
pnpm --filter @skillmango/api dev
pnpm --filter @skillmango/web dev
```

## Validation

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm --filter @skillmango/api db:generate
pnpm db:seed
pnpm db:seed
```

## Feature Completion Snapshot

- Major modules usable: `15`
- Major modules partial: `7`
- Fully absent major modules: `0`
- Main remaining hardening areas: deep E2E coverage, provider-specific production testing, richer video processing/transcoding, advanced visual landing-page editing, and monitoring deployment wiring.
