# Payment Webhook Test-Mode Guide

Use Stripe and Razorpay test credentials only. Do not commit real keys or webhook secrets.

## Stripe

Required env values:

- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `FRONTEND_URL=http://localhost:3000`
- `APP_URL=http://localhost:4000`

Local test flow:

```bash
stripe login
stripe listen --forward-to localhost:4000/api/v1/payments/webhooks/stripe
```

Copy the generated `whsec_...` value into `apps/api/.env` as `STRIPE_WEBHOOK_SECRET`, then restart the API.

Trigger a checkout from the web app or use:

```bash
stripe trigger checkout.session.completed
```

Expected result:

- The referenced order moves from `PENDING` to `COMPLETED`.
- Course orders create or reactivate enrollment.
- Workshop orders create registration.
- Membership orders create an active subscription.
- Product orders unlock downloads through `/products/my-downloads` and signed media URLs.
- Replaying the same event is idempotent and does not create duplicate payments or entitlements.

## Razorpay

Required env values:

- `RAZORPAY_KEY_ID=rzp_test_...`
- `RAZORPAY_KEY_SECRET=...`
- `RAZORPAY_WEBHOOK_SECRET=...`

Razorpay dashboard setup:

1. Open the Razorpay test-mode dashboard.
2. Create a webhook endpoint for `https://api.example.com/api/v1/payments/webhooks/razorpay` or your local tunnel URL.
3. Subscribe to `payment.captured`.
4. Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`.
5. Restart the API.

Local tunnel example:

```bash
ngrok http 4000
```

Expected result:

- Razorpay checkout creates an order with `mode: "razorpay_order"` when keys are configured.
- Verified payment or `payment.captured` webhook completes the matching SkillMango order.
- Invalid webhook signatures are rejected.
- Missing keys keep checkout in `mode: "dev_pending"` and never grant access.

## Production Readiness Checklist

- Use live credentials only in production env files or provider secret managers.
- Confirm webhook endpoint URLs use HTTPS.
- Confirm API logs show webhook receipt without printing secret values.
- Replay one Stripe and one Razorpay test event to verify idempotency.
- Confirm product downloads, enrollments, registrations, and memberships unlock only after completed order status.
