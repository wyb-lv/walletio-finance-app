import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

// Load the single shared .env at the project root (one level up from this app).
config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })

import routes from './routes/index'
import { setupSwagger } from './config/swagger';

const app = express()
app.use(cors())
// Larger limit so base64 avatar uploads fit in the JSON body.
app.use(express.json({ limit: '10mb' }))
setupSwagger(app)

app.get('/health', (_, res) => res.json({ ok: true }))
app.use('/api', routes)

// error handler tập trung (asyncHandler đẩy lỗi về đây)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status ?? 400).json({ error: err.message })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`API: http://localhost:${port}`))