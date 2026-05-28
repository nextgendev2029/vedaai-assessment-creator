# VedaAI Assessment Creator — Deployment Guide

This document describes the production deployment configurations, environment settings, and troubleshooting guidelines for VedaAI.

## Live Deployed Services

* **Frontend App (Vercel)**: [https://vedaai-assessment-creator-web.vercel.app/](https://vedaai-assessment-creator-web.vercel.app/)
* **Backend API Base URL**: [https://vedaai-api-kk5b.onrender.com](https://vedaai-api-kk5b.onrender.com)
* **Backend API Health Check**: [https://vedaai-api-kk5b.onrender.com/health](https://vedaai-api-kk5b.onrender.com/health)
* **GitHub Repository**: [https://github.com/nextgendev2029/vedaai-assessment-creator](https://github.com/nextgendev2029/vedaai-assessment-creator)

---

## Deployed Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│   API Server     │────▶│  MongoDB Atlas  │
│   (Vercel)   │     │   (Render Web)   │     └─────────────────┘
└──────────────┘     └──────┬───────────┘              │
       │                    │                           │
       │ WebSocket          │ Redis Pub/Sub             │
       ▼                    ▼                           │
┌──────────────┐     ┌──────────────────┐     ┌────────▼────────┐
│  Socket.IO   │◀───▶│  Embedded Worker │────▶│   Upstash Redis │
│  (on API)    │     │   (within API)   │     └─────────────────┘
└──────────────┘     └──────────────────┘
```

For the live demo, VedaAI runs in **Embedded Worker Mode** (`ENABLE_EMBEDDED_WORKER=true`) inside a single Render Web Service. This enables both the Express REST/WebSocket API and the BullMQ background processes (assessment and PDF compilation) to share resources on a single free-tier container.

---

## Render — Web Service Configuration

To deploy the API and embedded workers on Render:

| Setting         | Value                                        |
|-----------------|----------------------------------------------|
| Service Type    | Web Service                                  |
| Root Directory  | `.` (monorepo root)                          |
| Build Command   | `pnpm install && pnpm build:api`             |
| Start Command   | `pnpm start:api`                             |
| Health Check    | `/health`                                    |
| Environment     | Node                                         |

### Environment Variables for API Web Service

```env
PORT=4000
NODE_ENV=production
WEB_URL=https://vedaai-assessment-creator-web.vercel.app
ALLOWED_ORIGINS=https://vedaai-assessment-creator-web.vercel.app
ENABLE_EMBEDDED_WORKER=true
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/vedaai?retryWrites=true&w=majority
REDIS_URL=rediss://default:<password>@<host>:<port>
AI_PROVIDER=gemini
AI_FALLBACK_TO_GROQ=true
AI_FALLBACK_TO_MOCK=true
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.4
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant
GROQ_TEMPERATURE=0.4
```

---

## Alternative Production Setup (Separate Paid Worker)

For high-volume production, run separate instances for the web server and background workers to avoid resource contention:

1. **API Web Service**:
   * Set `ENABLE_EMBEDDED_WORKER=false`
   * Keep Start Command as `pnpm start:api`
2. **Background Worker (Render Background Worker)**:
   * Create a new Background Worker service.
   * Root Directory: `.`
   * Build Command: `pnpm install && pnpm build:api`
   * Start Command: `pnpm start:worker`
   * Reuse the identical Environment Variables config as the Web Service.

---

## Vercel — Frontend Configuration

To deploy the Next.js frontend on Vercel:

| Setting           | Value                       |
|-------------------|-----------------------------|
| Framework Preset  | Next.js                     |
| Root Directory    | `apps/web`                  |
| Build Command     | `pnpm install && pnpm build`|
| Install Command   | `pnpm install`              |

### Environment Variables for Vercel

```env
NEXT_PUBLIC_API_URL=https://vedaai-api-kk5b.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://vedaai-api-kk5b.onrender.com
```

---

## Datastores Setup

### MongoDB Atlas (Database)
1. Register a free account at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Provision a free shared cluster (M0).
3. Whitelist Network Access to `0.0.0.0/0` (allowing Render dynamic servers).
4. Retrieve the standard MongoDB SRV connection string and save as `MONGO_URI`.

### Redis (Upstash)
1. Register an account at [upstash.com](https://upstash.com).
2. Provision a serverless Redis database.
3. Enable TLS encryption.
4. Retrieve the Redis connection string prefix with `rediss://` and save as `REDIS_URL`.
   * **Note**: BullMQ requires native Redis connection protocol. Avoid using HTTP/REST endpoints.

---

## Troubleshooting Deployment Issues

### 1. API Server Fails to Start (Redis/Mongo Connection Timeout)
* **Check**: Ensure that MongoDB Atlas Network Access is set to `0.0.0.0/0`.
* **Check**: Double-check the password credentials in `MONGO_URI` and `REDIS_URL`. Special characters must be URL-encoded (e.g., `@` as `%40`).

### 2. BullMQ Workers Not Processing Jobs
* **Check**: If running on Render free tier, make sure `ENABLE_EMBEDDED_WORKER=true` is set. Otherwise, jobs will queue indefinitely if a standalone Background Worker service is not active.
* **Check**: Verify `REDIS_URL` matches exactly. BullMQ cannot process jobs if the Redis connection fails.

### 3. Socket.IO Connection Fails / Disconnects Immediately
* **Check**: Verify CORS headers. Check that `ALLOWED_ORIGINS` on the backend includes the exact Vercel frontend URL, and matches what `WEB_URL` is set to.
* **Check**: Ensure `NEXT_PUBLIC_SOCKET_URL` in Vercel is set to the HTTPS domain of the backend API (no trailing slash).

### 4. Render Service Sleep / Slow Initial Load
* **Behavior**: Render free Web Services spin down after 15 minutes of inactivity. The first request after a sleep period can take up to 50 seconds to boot up.
* **Impact on Workers**: When the Web Service sleeps, any background generation jobs will pause. They will automatically resume immediately when the service is awoken.
