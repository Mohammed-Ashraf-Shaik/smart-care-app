# SmartCare production readiness

The current build is a local demo: Supabase is disabled in `js/config.js`, and the app uses local demo accounts plus browser persistence. Use this checklist before enabling a real backend.

## Configuration

- Set `environment` to `production`.
- Provide `supabaseUrl` and `supabaseAnonKey` through the deployment environment or a generated runtime config file.
- Keep `supabaseEnabled` false until Auth, RLS, and realtime have been tested together.
- Keep `apiTimeoutMs` finite so map failures never block the application.

## Authentication

- Replace the demo `professionals` password lookup with Supabase Auth.
- Store only provider profile data and roles in the database.
- Enforce roles server-side; client-side route guards are only a UX layer.
- Add email verification, password reset, session refresh, and account lockout/rate limiting.
- Confirm that patient, hospital, and admin sessions cannot open another role's dashboard.

## Data protection

- Enable RLS on every table.
- Allow patients to create only their own queue request.
- Allow hospitals to read and update only their assigned care-centre queue.
- Allow admins to read operational aggregates, not provider passwords.
- Minimize stored location precision and document the retention period.

## Maps and external services

- Confirm Nominatim and Overpass usage limits and attribution requirements.
- Add a production geocoding/proxy service if traffic grows.
- Cache common location searches server-side.
- Test permission denied, timeout, offline, inaccurate GPS, and no-results states.

## Delivery

- Serve over HTTPS so device geolocation is available.
- Add a Content Security Policy for scripts, tiles, fonts, and API endpoints.
- Add automated checks for routes, auth guards, form validation, queue creation, and mobile layout.
- Add error monitoring and a privacy-safe audit trail.
- Keep `context.md` local-only and review all untracked files before committing.
