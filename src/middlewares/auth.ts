import { jwtVerify, createRemoteJWKSet } from 'jose'
import type { Request, Response, NextFunction } from 'express'
import 'dotenv/config'

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
)

export interface AuthedRequest extends Request {
  userId?: string
  accessToken?: string
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })
  const token = h.slice(7)
  try {
    const { payload } = await jwtVerify(token, JWKS, { audience: 'authenticated' })
    req.userId = payload.sub as string
    req.accessToken = token
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}