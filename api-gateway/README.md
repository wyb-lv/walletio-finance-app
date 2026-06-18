# API Gateway

A simple API gateway that sits in front of the `final-backend` service and
routes (proxies) all incoming requests to it. This is the single entry point
clients (e.g. the mobile app) talk to instead of hitting the backend directly.

```
Mobile app ──> API Gateway (:8080) ──> Backend service (:3000) ──> Supabase
```

## Why a gateway?

The gateway centralizes cross-cutting concerns at one entry point:

- **Single entry point** — clients only need one URL.
- **Routing / proxying** — forwards requests to the backend (this implementation).
- Easy to later add: auth, rate limiting, logging, caching, multiple backends.

## Setup

```bash
npm install
cp .env.example .env   # then edit if needed
```

`.env`:

```
GATEWAY_PORT=8080
BACKEND_URL=http://localhost:3000
```

## Run

1. Start the backend (`final-backend`):
   ```bash
   cd ../final-backend && npm run start   # http://localhost:3000
   ```
2. Start the gateway (this repo):
   ```bash
   npm run dev    # http://localhost:8080
   ```

## Try it

```bash
# Gateway's own health
curl http://localhost:8080/gateway/health

# Goes THROUGH the gateway to the backend's /health
curl http://localhost:8080/health

# Any API route is forwarded to the backend
curl http://localhost:8080/api/auth/...
```

Point your mobile app's base URL at `http://localhost:8080` instead of
`http://localhost:3000` and every call now flows through the gateway.
