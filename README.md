# Walletio

A personal finance & money-management app. Track wallets, log expenses, transfer money, plan budgets, group your spending, and visualize where your money goes — all backed by a Supabase-authenticated API and served through a lightweight gateway.

Walletio is a monorepo made up of three parts:

| Folder | Stack | Role |
| --- | --- | --- |
| [`walletio/`](walletio/) | React Native (Expo), Redux Toolkit | Mobile app (iOS / Android / Web) |
| [`api-gateway/`](api-gateway/) | Express + `http-proxy-middleware` + `jose` | JWT-verifying reverse proxy in front of the backend |
| [`final-backend/`](final-backend/) | Express + Supabase + Swagger | REST API and business logic |

## Architecture

```
┌──────────────┐      /api/...       ┌──────────────┐    proxy     ┌──────────────┐
│   walletio   │ ──────────────────► │ api-gateway  │ ───────────► │ final-backend│
│ (Expo app)   │   Bearer <JWT>      │  (port 8080) │              │ (port 3000)  │
└──────────────┘                     └──────┬───────┘              └──────┬───────┘
                                            │ verifies JWT                │
                                            │ against Supabase JWKS       │ Supabase
                                            ▼                             ▼ (Auth + DB
                                     rejects invalid tokens          + Storage)
```

- The mobile app sends every request to the **gateway** (`http://<host>:8080/api`).
- The **gateway** verifies the Supabase-issued JWT (except for public auth paths) and forwards valid requests to the **backend**.
- The **backend** talks to **Supabase** for authentication, the Postgres database, and file storage (avatars).

## Features

- **Auth** — sign up, log in, token refresh, logout, and password change (Supabase Auth).
- **Wallets** — create and manage multiple wallets, view balances and details.
- **Transactions / Expenses** — record expenses, browse and inspect transaction history.
- **Transfers** — move money between wallets with full transfer history.
- **Budgets** — plan and edit budgets with a structured budget editor.
- **Categories** — manage custom spending categories with icons.
- **Spending Groups** — organize spending into groups.
- **Analytics** — charts and insights into spending behavior.
- **Emotions** — attach an emotional context to spending.
- **Profile** — account settings and avatar upload.

## Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project (Auth, Postgres database, and a Storage bucket for avatars)
- [Expo](https://expo.dev) tooling — the app runs via `expo start`; use Expo Go or an emulator/simulator

## Setup

### 1. Environment variables

The gateway and backend share a single `.env` file at the repository root. Copy the example and fill in your Supabase values:

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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # required for avatar uploads (bypasses Storage RLS)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

### 2. Install dependencies

```bash
cd api-gateway   && npm install && cd ..
cd final-backend && npm install && cd ..
cd walletio      && npm install && cd ..
```

## Running the app

Start each service in its own terminal. Bring up the backend first, then the gateway, then the app.

**Backend** (`final-backend`, port 3000):
```bash
cd final-backend
npm run dev      # nodemon + tsx, hot reload
# or: npm start
```

**Gateway** (`api-gateway`, port 8080):
```bash
cd api-gateway
npm run dev      # tsx watch
# or: npm start
```

**Mobile app** (`walletio`):
```bash
cd walletio
npm start        # expo start
npm run android  # or run on Android
npm run ios      # or run on iOS
npm run web      # or run in the browser
```

> **Note:** On an Android emulator the app reaches the gateway via `10.0.2.2:8080`; on iOS/web it uses `localhost:8080`. Override with the `EXPO_PUBLIC_API_BASE_URL` environment variable if your gateway runs elsewhere.

## API

The backend exposes its routes under `/api`:

| Prefix | Resource |
| --- | --- |
| `/api/auth` | signup, login, refresh, logout, password |
| `/api/wallets` | wallets |
| `/api/profile` | user profile & avatar |
| `/api/expenses` | expenses / transactions |
| `/api/transfers` | wallet-to-wallet transfers |
| `/api/budgets` | budgets |
| `/api/analytics` | spending analytics |
| `/api/spending-groups` | spending groups |
| `/api/categories` | categories |
| `/api/emotions` | spending emotions |

Interactive API docs (Swagger UI) are served by the backend. Health checks:
`GET http://localhost:3000/health` (backend) and `GET http://localhost:8080/gateway/health` (gateway).

Public (no-token) gateway paths: `/api/auth/login`, `/api/auth/signup`, `/api/auth/refresh`. All other routes require a `Bearer <token>` header.

## Project structure

```
final-project/
├── .env.example          # shared env for gateway + backend
├── api-gateway/          # JWT-verifying reverse proxy
│   └── src/index.ts
├── final-backend/        # Express REST API
│   └── src/
│       ├── config/       # supabase + swagger setup
│       ├── controllers/  # request handlers
│       ├── routes/       # route definitions
│       ├── services/     # business logic + Supabase calls
│       ├── middlewares/  # auth
│       └── server.ts
└── walletio/             # Expo React Native app
    └── src/
        ├── screens/      # feature screens (Wallets, Budgets, Analytics, ...)
        ├── components/   # shared UI components
        ├── navigation/   # stack + tab navigators
        ├── services/     # API clients
        ├── store/        # Redux Toolkit slices
        ├── hooks/        # custom hooks
        ├── theme/        # colors, spacing, typography
        └── utils/        # helpers, constants, validators
```

## Tech stack

- **Frontend:** React Native 0.81, Expo 54, React 19, React Navigation, Redux Toolkit, react-native-chart-kit, Expo SecureStore / Image Picker / Linear Gradient
- **Gateway:** Express 5, http-proxy-middleware, jose (JWT/JWKS verification)
- **Backend:** Express 5, Supabase JS, express-rate-limit, swagger-jsdoc / swagger-ui-express, TypeScript (ts)
- **Platform:** Supabase (Auth, Postgres, Storage)
