# Render deployment (frontend + backend)

This repo contains:

- **Frontend**: Vite + React (static build in `dist/`)
- **Backend**: Node/Express API on Render (`server/index.js`)
- **Database/Auth**: Supabase

## Services to create on Render

### 1) Backend (Web Service)

- **Root Directory**: repo root
- **Build Command**: `npm install`
- **Start Command**: `npm start`

Set these **environment variables** in Render (Web Service):

- `NODE_ENV=production`
- `SUPABASE_URL` (same value as your Supabase project URL)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
- `SITE_URL` (your deployed frontend origin, e.g. `https://app-frontend.onrender.com`)
- `FRONTEND_ORIGIN` (same as `SITE_URL`, used for CORS)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

### 2) Frontend (Static Site)

- **Root Directory**: repo root
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

Set these **environment variables** in Render (Static Site):

- `NODE_ENV=production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (your backend URL, e.g. `https://app-backend.onrender.com`)

## SPA routing (refresh on deep links)

This repo already includes `public/_redirects` with:

```
/*    /index.html   200
```

That ensures direct navigation / refresh works with React Router on Render.

## Supabase Auth redirect URLs

In Supabase Dashboard:

- **Auth → URL Configuration**
  - Add your Render frontend URL as a valid redirect / site URL (and keep localhost for dev if needed).

