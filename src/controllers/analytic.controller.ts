import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import { analyticService } from '../services/analytic.service'

function parseYear(value: unknown): number {
    const year = Number(value)
    return Number.isInteger(year) && year > 1970 ? year : new Date().getFullYear()
}

function asString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined
}

export const analyticController = {
    async summary(req: AuthedRequest, res: Response) {
        const year = parseYear(req.query.year)
        res.json(await analyticService.getSummary(req.accessToken!, req.userId!, year))
    },
    async overview(req: AuthedRequest, res: Response) {
        const direction = req.query.direction === 'in' ? 'in' : 'out'
        res.json(await analyticService.getOverview(req.accessToken!, req.userId!, {
            from: asString(req.query.from),
            to: asString(req.query.to),
            direction,
        }))
    },
    async categoryTrend(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Category id is required' })
        }
        const year = parseYear(req.query.year)
        res.json(await analyticService.getCategoryTrend(req.accessToken!, req.userId!, id, year))
    },
    async balance(req: AuthedRequest, res: Response) {
        res.json(await analyticService.getBalanceTimeline(req.accessToken!, req.userId!))
    },
}
