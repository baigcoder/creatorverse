[OPEN] Home page 500 debug session

Session ID: `home-500-error`

Symptom:
- `GET http://localhost:3000/` returns `500 (Internal Server Error)`

Expected:
- The home page renders successfully in local development

Hypotheses:
- Missing or invalid environment/config causes a server-side render failure
- The home route triggers a failing API/data request during render
- A module import or server-only dependency crashes when `/` is requested
- Middleware or route guards rewrite `/` into a broken path
- Dev-server compilation/runtime state is stale or misconfigured

Evidence Log:
- Historical web dev log showed repeated `ENOENT` reads for `.next` manifest files such as `apps/web/.next/server/app/(public)/page/app-build-manifest.json`
- Fresh `pnpm dev:web` session started successfully on `http://localhost:3000`
- Direct request to `/` now returns `200`
- Live dev output confirms `Compiled /` followed by `GET / 200`

Instrumentation:
- No application instrumentation added because runtime evidence isolated the failure to stale/corrupted Next.js build artifacts rather than route business logic

Fix:
- Restarted the web dev server in a clean session and recompiled `/`
- No source-code change required for the current failure state

Verification:
- Server is running locally on port `3000`
- `Invoke-WebRequest http://localhost:3000/` returns `200`
