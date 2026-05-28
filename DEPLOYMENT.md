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

## Render — Free Tier / Single Service Option

If you want to deploy on Render's free tier without paying for a separate Background Worker service, you can run both the API server and the BullMQ background workers in the same Web Service process:

1. Follow the **Render — API Service** setup instructions above.
2. In the environment variables for your Web Service, add:
   ```
   ENABLE_EMBEDDED_WORKER=true
   ```
3. Do **not** create the Render Background Worker service.
4. **Caveat**: On Render's free tier, Web Services spin down after 15 minutes of inactivity. When spun down, background workers will be paused. When a user visits the site, the service will wake up, and processing of queued tasks will resume automatically.
5. For high-volume production use cases, it is recommended to keep `ENABLE_EMBEDDED_WORKER=false` and run a separate, dedicated Background Worker.

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
