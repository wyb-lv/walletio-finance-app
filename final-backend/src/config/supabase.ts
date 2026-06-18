import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

// Load the single shared .env at the project root. This module reads the
// Supabase vars at import time, so it loads the env itself rather than relying
// on an entrypoint that may evaluate later.
config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) })

const url = process.env.SUPABASE_URL!
const anon = process.env.SUPABASE_ANON_KEY!
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAuth = createClient(url, anon, {
  auth: { persistSession: false }
})

// Service-role client that bypasses RLS (e.g. for storage uploads). Null when
// SUPABASE_SERVICE_ROLE_KEY isn't configured, so callers can fall back.
export const supabaseAdmin = serviceRole
  ? createClient(url, serviceRole, { auth: { persistSession: false } })
  : null

export const supabaseForUser = (accessToken: string) =>
  createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false }
  })

// A throwaway client with no shared session, for flows that sign in transiently
// (e.g. verifying a user's current password) without touching the singleton client.
export const supabaseFresh = () =>
  createClient(url, anon, { auth: { persistSession: false } })