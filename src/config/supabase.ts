import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const url = process.env.SUPABASE_URL!
const anon = process.env.SUPABASE_ANON_KEY!

export const supabaseAuth = createClient(url, anon, {
  auth: { persistSession: false }
})

export const supabaseForUser = (accessToken: string) =>
  createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false }
  })