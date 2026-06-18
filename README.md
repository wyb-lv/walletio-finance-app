# Personal Finance Backend

Backend for a personal finance / expense-tracking mobile app, built for the HSU Mobile Development final project. It is a small two-service system: a public **API gateway** that verifies authentication, and a **backend service** that holds the business logic and talks to Supabase.

```
mobile app ──▶ api-gateway (:8080) ──▶ final-backend (:3000) ──▶ Supabase (Auth + Postgres + Storage)
                verifies JWT             business logic + RLS
```

## Architecture

| Service | Port | Responsibility |
| --- | --- | --- |
| **api-gateway** | `8080` | Single public entry point. Verifies the Supabase access token's signature against Supabase's published JWKS, then proxies every request to the backend. Auth-minting routes (`/api/auth/login`, `/signup`, `/refresh`) are allowed through unverified. |
| **final-backend** | `3000` | All application logic. Decodes the (already-verified) JWT to read the user id, forwards the raw token to Supabase so row-level security applies per user, and exposes the REST API. |

The gateway owns signature verification so the backend can trust incoming tokens and only needs to *decode* them. The backend forwards each user's access token to Supabase, so all data access runs under that user's RLS policies.

## Tech stack

- **Node.js** + **TypeScript** (ESM), run with [`tsx`](https://github.com/privatenumber/tsx)
- **Express 5** for both services
- **Supabase** — authentication, Postgres database, and Storage (avatar uploads)
- **jose** for JWT verification (gateway) and decoding (backend)
- **http-proxy-middleware** for gateway routing
- **swagger-jsdoc** + **swagger-ui-express** for API docs
- **express-rate-limit** for rate limiting

## Project layout

```
final-project/
├── .env.example            # shared env template for both services
├── api-gateway/            # auth-verifying reverse proxy
│   └── src/index.ts
└── final-backend/          # REST API + business logic
    └── src/
        ├── server.ts       # app bootstrap, CORS, Swagger, error handler
        ├── config/         # supabase client, swagger setup
        ├── routes/         # one router per domain (mounted under /api)
        ├── controllers/    # request/response handling
        ├── services/       # business logic + Supabase queries
        ├── middlewares/    # requireAuth (JWT decode)
        ├── dto/            # request/response shapes
        └── utils/          # asyncHandler, HttpError
```

## Prerequisites

- Node.js 18+ (ESM and modern `tsx` support)
- A [Supabase](https://supabase.com) project (URL + anon key + service-role key)

## Setup

Both services share a single `.env` at the project root. Copy the example and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
# --- API gateway ---
GATEWAY_PORT=8080
BACKEND_URL=http://localhost:3000

# --- Backend service ---
PORT=3000

# --- Supabase (used by both) ---
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # needed for avatar uploads (bypasses Storage RLS)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

Install dependencies for each service:

```bash
cd final-backend && npm install
cd ../api-gateway && npm install
```

## Running

Start the backend and the gateway in two terminals (start the backend first):

```bash
# terminal 1 — backend (auto-reload via nodemon)
cd final-backend
npm run dev

# terminal 2 — gateway
cd api-gateway
npm run dev
```

| Script | api-gateway | final-backend |
| --- | --- | --- |
| `npm run dev` | watch + reload (`tsx watch`) | watch + reload (`nodemon`) |
| `npm start` | run once (`tsx`) | run once (`tsx`) |

Once running:

- **App requests** → `http://localhost:8080/api/...` (through the gateway)
- **Swagger UI** → `http://localhost:3000/api-docs`
- **Gateway health** → `http://localhost:8080/gateway/health`
- **Backend health** → `http://localhost:3000/health`

## API overview

All routes are mounted under `/api`. Every endpoint except the auth-minting routes requires an `Authorization: Bearer <access_token>` header.

| Resource | Base path | Notable endpoints |
| --- | --- | --- |
| Auth | `/api/auth` | `POST /signup`, `POST /login`, `POST /refresh`, `PUT /password` |
| Profile | `/api/profile` | `GET /`, `PATCH /`, `POST /avatar` |
| Wallets | `/api/wallets` | CRUD + `GET /summary` |
| Expenses | `/api/expenses` | CRUD |
| Transfers | `/api/transfers` | `POST /`, `DELETE /:id` |
| Budgets | `/api/budgets` | budget CRUD + `/allocation` management |
| Categories | `/api/categories` | CRUD |
| Spending groups | `/api/spending-groups` | CRUD |
| Emotions | `/api/emotions` | `GET /` |
| Analytics | `/api/analytics` | `GET /summary`, `GET /overview`, `GET /balance` |

See **Swagger UI** (`/api-docs`) for full request/response schemas. The "Authorize" button there lets you paste a JWT to test secured endpoints.

### Authentication flow

1. `POST /api/auth/signup` or `POST /api/auth/login` → returns a Supabase session with an `access_token` and `refresh_token`.
2. Send the `access_token` as `Authorization: Bearer <token>` on subsequent requests.
3. The gateway verifies the token signature; the backend decodes it for the user id and forwards it to Supabase for RLS.
4. When the access token expires, call `POST /api/auth/refresh` with the `refresh_token` to get a new session.
