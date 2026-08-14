# SmartCare production readiness

The current build is a local demo: Supabase is disabled in `js/config.js`, and the app uses local demo accounts plus browser persistence. Demo mode must remain available for review. Use this checklist before enabling a real backend or accepting real patient data.

## Current implementation

- Workspace tabs are URL-backed with canonical slash routes and survive direct reloads.
- Canonical workspace tab URLs use slash paths, with legacy query links redirected for compatibility; `404.html` recovers direct GitHub Pages deep links into the SPA.
- Patient, hospital, and admin demo accounts remain available.
- Queue metrics are calculated from current queue records.
- Queue handoffs use guarded `waiting → called → in_progress → completed` transitions, with active, waiting, called, and in-consultation counts available to the workspace views.
- Patient overview exposes the next appointment reference/status and a demo-safe cancellation flow that keeps queue/history state aligned.
- Hospital queue scope is centre-specific; admin operations see the operational queue across centres.
- Queue search, priority filters, queue actions, room toggles, toast states, and secure recovery UI are included.
- Blood-group/city donation-centre lookup and a clearly non-binding organ-donation interest flow are included in demo mode.
- If MapLibre is unavailable, nearby-care selection remains usable through the centre list.
- Supabase mode uses Supabase Auth for provider passwords; see `supa base query.md`.

## Configuration

- Set `environment` to `production` only after backend verification.
- Provide `supabaseUrl` and the publishable anon key through deployment configuration.
- Keep `supabaseEnabled` false until Auth, RLS, and realtime have been tested together.
- Keep API timeouts finite so map failures never block the application.

## Authentication and authorization

- Use Supabase Auth; never store plaintext passwords in application tables.
- Store only provider profile data and roles in `professionals`.
- Enforce role and hospital ownership server-side; client route guards are UX protection only.
- Add email verification, password reset, refresh handling, account lockout, and rate limiting.
- Verify that patient, hospital, and admin sessions cannot open another role’s dashboard.

## Data protection

- Enable RLS on every table and test policies with separate roles.
- Allow patients to read only their own visits.
- Allow hospitals to read/update only their assigned care-centre queue.
- Allow admins to read operational data without exposing credentials.
- Keep blood-centre discovery public only for active rows; protect donation-interest submissions and attach an authenticated user or server-side request identity.
- Minimize stored location precision and document retention/deletion.
- Never put service-role keys, real medical data, or secrets in this repository or static frontend.

## Maps and external services

- Confirm Nominatim and Overpass usage limits and attribution requirements.
- Add a production geocoding/proxy service if traffic grows.
- Cache common location searches server-side.
- Test permission denied, timeout, offline, inaccurate GPS, and no-results states.

## Delivery and verification

- Serve over HTTPS so device geolocation is available.
- Add a Content Security Policy for scripts, tiles, fonts, and API endpoints.
- Add automated checks for routes, URL tabs, auth guards, form validation, queue creation, and mobile layout.
- Add error monitoring and a privacy-safe audit trail.
- Link organ donation users to the official registry for their jurisdiction; SmartCare must never represent the demo interest form as legal consent.
- Run `npm run lint` on each iteration and `npm run build` once before release to verify GitHub Pages asset output.
- Review ignored and untracked files before every commit; keep `context.md` local-only.
