# VedaAI Assessment Creator — Deployment Guide

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│   API Server     │────▶│  MongoDB Atlas  │
│   (Vercel)   │     │   (Render Web)   │     └─────────────────┘
└──────────────┘     └──────┬───────────┘              │
       │                    │                           │
       │ WebSocket          │ Redis Pub/Sub             │
       ▼                    ▼                           │
┌──────────────┐     ┌──────────────────┐     ┌────────▼────────┐
│  Socket.IO   │◀───▶│   Worker         │────▶│  Redis/Upstash  │
│  (on API)    │     │   (Render BG)    │     └─────────────────┘
└──────────────┘     └──────────────────┘
```

## Services Required

| Service       | Platform       | Type                |
|---------------|----------------|---------------------|
| Frontend      | Vercel         | Next.js project     |
| API           | Render         | Web Service         |
| Worker        | Render         | Background Worker   |
| MongoDB       | MongoDB Atlas  | M0 Free / M2+       |
| Redis         | Upstash / etc  | Redis 7+ with TLS   |

---

## Render — API Service

| Setting         | Value                                        |
|-----------------|----------------------------------------------|
| Root Directory  | `.` (monorepo root)                          |
| Build Command   | `pnpm install && pnpm build:api`             |
| Start Command   | `pnpm start:api`                             |
| Health Check    | `GET /api/health`                            |
| Environment     | Node                                         |

### Environment Variables

```
PORT=4000
NODE_ENV=production
WEB_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/vedaai?retryWrites=true&w=majority
REDIS_URL=rediss://:PASSWORD@HOST:PORT
AI_PROVIDER=gemini
AI_FALLBACK_TO_GROQ=true
AI_FALLBACK_TO_MOCK=true
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.4
GROQ_API_KEY=your-key
GROQ_MODEL=llama-3.1-8b-instant
GROQ_TEMPERATURE=0.4
```

---

## Render — Worker Service

| Setting         | Value                                        |
|-----------------|----------------------------------------------|
| Root Directory  | `.` (monorepo root)                          |
| Build Command   | `pnpm install && pnpm build:api`             |
| Start Command   | `pnpm start:worker`                          |
| Environment     | Node                                         |

> The worker uses the **same env vars** as the API service.
> It connects to the same MongoDB and Redis instances.

---

## Vercel — Frontend

| Setting           | Value                       |
|-------------------|-----------------------------|
| Framework Preset  | Next.js                     |
| Root Directory    | `apps/web`                  |
| Build Command     | `pnpm install && pnpm build`|
| Install Command   | `pnpm install`              |

### Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://your-api.onrender.com
```

---

## MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user with read/write access.
3. Whitelist `0.0.0.0/0` for Render IP access (or use Render's static IPs).
4. Get the connection string: `mongodb+srv://USER:PASS@cluster.mongodb.net/vedaai?retryWrites=true&w=majority`
5. Set `MONGO_URI` in both Render services.

---

## Redis (Upstash or similar)

1. Create a Redis database at [upstash.com](https://upstash.com) or your preferred provider.
2. Enable TLS (Upstash does this by default).
3. Get the connection URL: `rediss://:PASSWORD@HOST:PORT`
4. Set `REDIS_URL` in both Render services.

> **Important**: Use `rediss://` (with double s) for TLS connections.
> BullMQ requires native Redis protocol — do NOT use Upstash REST API.

---

## Post-Deploy Test Checklist

1. **Health Check**
   ```bash
   curl https://your-api.onrender.com/api/health
   ```
   Expect: `{ "status": "ok", "mongo": "connected", "redis": "connected" }`

2. **Create Assignment**
   - Open `https://your-app.vercel.app/assignments/create`
   - Fill in the form and submit
   - Verify assignment appears in the dashboard

3. **Generate Paper**
   - Click "Generate" on an assignment
   - Verify progress steps appear via Socket.IO
   - Verify generated paper renders correctly

4. **Download PDF**
   - Click "Download PDF" on a generated paper
   - Verify PDF downloads and renders correctly

5. **CORS Check**
   - Open browser DevTools → Network tab
   - Verify no CORS errors on API calls from Vercel domain

6. **Socket.IO Check**
   - Open browser DevTools → Network tab → WS
   - Verify WebSocket connection to API server
