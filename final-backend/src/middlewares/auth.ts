import { decodeJwt } from 'jose'
import type { Request, Response, NextFunction } from 'express'

export interface AuthedRequest extends Request {
  userId?: string
  accessToken?: string
}

// The API gateway is responsible for verifying tokens. By the time a request
// reaches this service it has already been authenticated upstream, so here we
// only decode the token to read its claims (no signature verification) and
// forward the raw token to the services for Supabase RLS.
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })
  const token = h.slice(7)
  try {
    const payload = decodeJwt(token)
    if (!payload.sub) return res.status(401).json({ error: 'Invalid token' })
    req.userId = payload.sub
    req.accessToken = token
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}