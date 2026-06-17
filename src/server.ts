import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import 'dotenv/config'
import routes from './routes/index'
import { setupSwagger } from './config/swagger';

const app = express()
app.use(cors())
app.use(express.json())
setupSwagger(app)

app.get('/health', (_, res) => res.json({ ok: true }))
app.use('/api', routes)

// error handler tập trung (asyncHandler đẩy lỗi về đây)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({ error: err.message })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`API: http://localhost:${port}`))