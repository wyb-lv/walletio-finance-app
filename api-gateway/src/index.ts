import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

// Load the single shared .env at the project root (one level up from this app).
config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })

const app = express()

const GATEWAY_PORT = process.env.GATEWAY_PORT || 8080
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.SUPABASE_URL!

// The gateway owns token verification: it checks the JWT signature against
// Supabase's published keys before forwarding. Downstream services only decode
// the token to read its claims, trusting that the gateway already verified it.
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
)

// Endpoints that must be reachable without a valid access token: the login /
// signup flows that mint one. Paths carry the backend's `/api` prefix because
// that's what the frontend sends through the gateway.
const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/signup', '/api/auth/refresh']

// --- Simple request logging (so you can see the gateway routing) ---
app.use((req, _res, next) => {
  console.log(`[gateway] ${req.method} ${req.originalUrl} -> ${BACKEND_URL}`)
  next()
})

// --- Gateway health check (the gateway itself, not the backend) ---
app.get('/gateway/health', (_req, res) => {
  res.json({ ok: true, service: 'api-gateway' })
})

// --- Auth: verify the access token before forwarding to the backend ---
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next()
  if (PUBLIC_PATHS.includes(req.path)) return next()

  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })
  try {
    await jwtVerify(h.slice(7), JWKS, { audience: 'authenticated' })
    next()
  } catch {
    // Signature/expiry failure: the client must re-authenticate via /auth/login.
    return res.status(401).json({ error: 'Invalid token' })
  }
})

// --- Routing / proxy: forward everything else to the backend service ---
app.use(
  '/',
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    // surface backend-unreachable errors instead of hanging
    on: {
      error: (err, _req, res) => {
        console.error('[gateway] proxy error:', err.message)
        // res can be a ServerResponse here
        if ('writeHead' in res && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' })
        }
        ;(res as any).end(
          JSON.stringify({ error: 'Bad gateway: backend service unavailable' })
        )
      },
    },
  })
)

app.listen(GATEWAY_PORT, () => {
  console.log(`API Gateway: http://localhost:${GATEWAY_PORT}`)
  console.log(`Forwarding all requests -> ${BACKEND_URL}`)
})
