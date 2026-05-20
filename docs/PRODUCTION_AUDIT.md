# Production Engineering Audit

**Stack**: React 19 + Vite + TanStack Query · Express 5 · Supabase (Postgres + Auth + Storage) · Render / Vercel / Netlify deploy configs co-present.

**Audit scope**: Frontend, backend, database schema, auth flow, caching, deployment.
**Audit method**: Direct file read of `src/`, `server/`, `api/`, `supabase/`, deploy configs. No claims that aren't grounded in a file path.

---

## Section A — Critical issues found and fixed in this pass

### A1 — Privilege escalation via unwhitelisted profile update (CRITICAL)

**File**: `server/index.js` — `PUT /api/profile`

**Root cause**. The endpoint took `req.body` as `patch` and applied it directly with `supabase.from('profiles').update(patch)`. The server uses the **service-role key**, which bypasses RLS entirely. Any authenticated user could send:

```http
PUT /api/profile
Authorization: Bearer <their own session token>
Content-Type: application/json

{"role": "super_admin"}
```

…and the next request would treat them as super_admin. No RLS check ran, no role check ran, no field validation ran.

**Fix applied**. Added `pickFields(input, allowed)` helper and a `PROFILE_SELF_UPDATABLE` whitelist:

```js
const PROFILE_SELF_UPDATABLE = ['full_name', 'bio', 'phone', 'country', 'goals', 'profile_image_url']

// inside the handler:
const patch = pickFields(req.body, PROFILE_SELF_UPDATABLE)
if (Object.keys(patch).length === 0) {
  return res.status(400).json({ error: 'No updatable fields provided' })
}
```

`role`, `status`, `user_id`, `mentor_user_id`, `email`, `joined_at`, `updated_at` are now silently stripped.

**Defense-in-depth (DB layer)**. `supabase/security_fixes.sql` adds a `BEFORE UPDATE` trigger on `profiles` that raises `42501 insufficient_privilege` if any non-`super_admin` user tries to change `role`, `status`, or `user_id`. Service-role traffic (`auth.uid() IS NULL`) is allowed through because the server already whitelists.

### A2 — Same pattern on 4 other endpoints (HIGH)

Same `update(patch)` anti-pattern in:

| Endpoint | Risk |
|---|---|
| `PUT /api/admin/applications/:id` | Staff could rewrite applicant identity (`full_name`, `email`) or skip status check constraints |
| `PUT /api/admin/modules/:id` | Could reparent module under another course via `course_id` |
| `PUT /api/admin/lessons/:id` | Could reparent lesson, bypass `status` check constraint |
| `PUT /api/admin/media-assets/:id` | Could rewrite `bucket`/`path` and break Storage references |

Auth-wise these required staff, so they're not anonymous-exploitable — but a hostile or buggy admin client could corrupt rows.

**Fix applied**. Each endpoint now uses its own field whitelist (`APPLICATION_STAFF_UPDATABLE`, `MODULE_STAFF_UPDATABLE`, `LESSON_STAFF_UPDATABLE`, `MEDIA_STAFF_UPDATABLE`) plus enum validation against the table's CHECK constraint (`APPLICATION_STATUSES`, `LESSON_STATUSES`) and `position > 0` integer validation.

### A3 — Application review trigger silently no-ops on server-side updates (HIGH, latent correctness bug)

**Root cause**. `supabase/platform.sql` defines `stamp_application_review()` (triggered BEFORE UPDATE on applications) which sets `reviewed_by = auth.uid()` and `reviewed_at = now()`. But the server uses the service-role key, so `auth.uid()` is NULL inside the trigger, the `if auth.uid() is not null` guard skips, and **reviewed_by is never stamped** on any server-side update.

**Fix applied**. The two admin application endpoints (`PUT /api/admin/applications/:id` and `PUT /api/admin/applications/:id/status`) now explicitly set:

```js
patch.reviewed_by = req.user.id
patch.reviewed_at = new Date().toISOString()
```

### A4 — File upload accepts any content-type and size up to the express.raw cap (MEDIUM)

**File**: `server/index.js` — `POST /api/admin/media-assets/upload`, `POST /api/admin/storage/upload`, `POST /api/me/avatar`

**Root cause**. The endpoints accepted any `Content-Type` (defaulting to `application/octet-stream`), pushed the bytes straight to Supabase Storage, and recorded the user-supplied type into `media_assets.mime_type`. A malicious or careless caller could:
- Upload executables and have them stored with a misleading `image/png` MIME.
- Upload up to 25MB per request × N requests to exhaust storage.
- Mismatch filename extension and MIME so downstream renderers misbehave.

**Fix applied**. New `validateUpload(req)` helper enforces:

- **Content-type allowlist**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`, `application/pdf` only.
- **Per-type size limits**: images 10 MB, SVG 1 MB (XSS surface in `<svg>`), PDF 25 MB.
- **Extension match**: rejects when `?filename=foo.exe` is paired with `image/png`.
- **Empty body rejection**.

Avatar endpoint uses a narrower allowlist (jpeg/png/webp/gif only, 5 MB cap).

---

## Section B — Verified issues NOT yet fixed (prioritized)

### B1 — Profile PII over-exposure (HIGH, design) — partially fixed this pass

**File**: `supabase/schema.sql:189-202`. The `profiles_select_staff` policy lets any staff member read every column of every profile, including `phone`, `country`, `goals`.

**This pass**:
- Added `public.profiles_admin` view in `supabase/security_fixes.sql` projecting only safe columns (`user_id, full_name, email, role, status, mentor_user_id, profile_image_url, joined_at, updated_at`) with `security_invoker = true` so the underlying RLS still applies.
- Fixed `src/services/profile.js` `ensureProfile()` which was doing `select('*')` — now selects an explicit column list so a future column-level revoke won't break self-reads.

**Remaining work** (still deliberate, not yet applied):
1. Migrate `src/services/adminMembers.js` and `src/pages/admin/AdminCourseEditor.jsx` to read from `profiles_admin` instead of `profiles`.
2. Drop the broad `profiles_select_staff` policy.
3. Optionally: `revoke select (phone, country, goals) on public.profiles from authenticated`. Self-reads via `profiles_select_own` still cover those columns for the row owner.

### B2 — TanStack Query is partially adopted (the original audit was wrong) (MEDIUM)

**Correction**: The earlier audit claimed TanStack Query was installed but unused. That was based on an incomplete grep. Actual usage:
- `src/hooks/useProfile.ts` — `useQuery`
- `src/hooks/useTeams.ts` — `useQuery`
- `src/hooks/useRealtime.ts` — `queryClient.invalidateQueries` on Supabase realtime events

So the framework is wired in and producing value for those three flows. The real issue is **uneven adoption**: most service modules in `src/services/*` still use direct `useState`+`useEffect` and don't invalidate on mutation, so admin tables go stale after writes.

**Recommended next step**: convert the highest-traffic admin services (`adminMembers`, `applications`, `modules`, `lessons`) to `useQuery`/`useMutation` with `queryClient.invalidateQueries({ queryKey: [...] })` after each mutation. Not urgent enough to block production but it's the source of "I saved a thing and the list didn't update" reports.

### B3 — Deploy target consolidated to Vercel (DONE this pass)

**Decision**: Vercel + Supabase. Render and Netlify configs have been moved to `archive-unused/` (preserved in case rollback is needed).

**Changes**:
- `archive-unused/render/render.yaml`, `archive-unused/render/README_RENDER.md`
- `archive-unused/netlify/inviteApplicant.js`, `archive-unused/netlify/submit.js`
- `archive-unused/server.js` (the dead second server file — B4 below)
- `server/index.js` now exports the Express app and only calls `.listen()` when `process.env.VERCEL` is unset (so `npm start` still works locally).
- New `api/[[...slug]].js` catch-all serverless function imports the Express app and re-exports it as a Vercel handler.
- `vercel.json` modernized: legacy `routes` config replaced with `rewrites` (SPA fallback for everything not starting with `/api/`). Security headers preserved.

**Vercel environment variables required** (set in Vercel project settings):
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — server side
- `FRONTEND_ORIGIN` — CORS allowlist (set to the deployed origin)
- `SITE_URL` — used by `inviteApplicant` for the password-reset link
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` — invite emails
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — client bundle (must be `VITE_`-prefixed)
- `VITE_API_URL` — optional; leave unset on Vercel since frontend and API share an origin

### B4 — Dead server.js (DONE this pass)

Moved to `archive-unused/server.js`. No imports referenced it. `package.json` `start` still points at `server/index.js`.

### B5 — Schema files are not migrations (HIGH, operational)

`supabase/` contains 17 `.sql` files plus the new `security_fixes.sql`. `README.md` says "run in order" but there's no schema version table, no automation, no rollback. Production schema is "whatever was last hand-pasted into the SQL editor".

**Recommendation** (still not in this pass — half-day of work and a workflow decision): adopt the Supabase CLI migrations folder structure (`supabase/migrations/YYYYMMDDHHMMSS_name.sql`). Each existing file becomes a dated migration; the CLI tracks applied versions in `supabase_migrations.schema_migrations`.

### B6 — Vite dev proxy / prod-API behavior (DONE this pass)

`vite.config.js` now carries an inline comment explaining the proxy is dev-only and that on Vercel the frontend and API share an origin (so no proxy is needed in prod).

### B7 — `console`/`debugger` dropped in build unconditionally (LOW)

`vite.config.js` — fine for prod, but you lose them in staging too. Gate on `mode !== 'staging'` if you spin up a staging env. Skipped.

### B8 — `AuthContext.refreshProfile` fires on every user-object change with no debounce (LOW)

`src/context/AuthContext.jsx:58-66`. Currently uses `queueMicrotask` which deduplicates within a tick, so the practical impact is minor. Worth a `useRef` guard if you ever see profile-load races in the wild. Skipped.

---

## Section C — Architecture observations (not bugs)

- **Single 42KB server/index.js**. Monolithic but coherent — every route is similar. Would benefit from splitting into `server/routes/profile.js`, `server/routes/admin/applications.js` etc. when it crosses 60-80 KB. Not urgent.
- **`api/` folder has dual citizenship**. `api/inviteApplicant.js` etc. are imported as ES modules into `server/index.js` (so they run inside the Express app) AND are independently usable as Vercel serverless functions. After this pass, every `/api/*` path either hits the matching per-file function or falls through to `api/[[...slug]].js` which mounts the Express app. Either path serves the same handler.
- **CORS** (`server/index.js:28-38`) is correctly restrictive: only `FRONTEND_ORIGIN` is allowed in prod, and CORS is *disabled* (`origin: false`) when the env var is missing. Good fail-closed default.
- **`verifyUser` + `requireStaff` middleware** are correct. Token is verified via `supabase.auth.getUser(token)` (not just trusted), staff role is checked against a freshly-fetched profile row each request. Good.
- **Activity log endpoint** (`POST /api/activity-logs`, line 418) trusts client-supplied `action`/`entity_type` strings. That's fine for an audit log of *intent* but means the log isn't tamper-evident. If audit trail matters legally, add server-side action enums.

---

## Section D — Deployment readiness checklist (Vercel target)

| Item | Status | Notes |
|---|---|---|
| Service-role key NOT in client bundle | ✓ | only `src/lib/supabaseClient.js` uses `VITE_*` keys |
| CORS locked to FRONTEND_ORIGIN | ✓ | fails closed if env missing |
| SPA fallback for client routes | ✓ | `vercel.json` rewrites + `server/index.js` (local) |
| Vite `/api` proxy is dev-only and documented | ✓ | comment added in this pass |
| RLS enabled on user-data tables | ✓ | profiles, enrollments, completions, applications |
| Profile self-promotion bug closed | ✓ | server whitelist + DB trigger |
| Upload validation (MIME + size + extension) | ✓ | three upload endpoints |
| Vercel adapter (`api/[[...slug]].js`) | ✓ | new this pass |
| Vercel security headers | ✓ | X-Frame-Options, X-CTO, Referrer-Policy, Permissions-Policy |
| Schema migration system | ✗ | see B5 — adopt Supabase CLI when ready |
| Build artifacts in repo (`dist/`) | ⚠ | should be gitignored when you add this to git |
| Health endpoint | ✓ | `GET /healthz` |
| `.env.example` exists | not verified in this pass | check before shipping |

---

## Section E — Apply / verify

1. **Apply `supabase/security_fixes.sql`** in the Supabase SQL editor (idempotent, safe to re-run). Verify:
   ```sql
   select tgname from pg_trigger where tgrelid = 'public.profiles'::regclass;
   -- expect: profiles_guard_sensitive AND profiles_touch_updated_at
   select count(*) from information_schema.views where table_schema = 'public' and table_name = 'profiles_admin';
   -- expect: 1
   ```
2. **Smoke test** the privilege fix locally before deploy:
   ```bash
   # Should now 400 with "No updatable fields provided" instead of silently writing role.
   curl -X PUT $API/api/profile \
     -H "Authorization: Bearer $USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"role":"super_admin"}'
   # Cross-check: role in DB should be unchanged.
   ```
3. **Deploy to Vercel**. Push the repo; Vercel auto-detects `vercel.json` and the catch-all `api/[[...slug]].js`. Set the env vars listed in §B3 in Vercel project settings. The first deploy may need an explicit "redeploy without build cache" because the legacy `routes` config was replaced with `rewrites`.
4. **Production smoke**:
   - `GET https://<deployment>/healthz` returns `ok`
   - `GET https://<deployment>/` serves the SPA
   - `GET https://<deployment>/admin` serves the SPA (not Express 404)
   - `POST https://<deployment>/api/public/applications` with a valid body returns `{ok:true, data:{...}}`
5. **Outstanding work** (deliberate next-pass items): B1 frontend cutover to `profiles_admin`, B2 React Query adoption in admin services, B5 Supabase CLI migrations.
