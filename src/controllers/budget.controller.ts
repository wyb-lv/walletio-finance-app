import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import { budgetService } from '../services/budget.service'

export const budgetController = {
    async getBudget(req: AuthedRequest, res: Response) {
        res.json(await budgetService.getBudget(req.accessToken!, req.userId!))
    },
    async updateBudget(req: AuthedRequest, res: Response) {
        const { budgetId, name, totalIncome, month, year } = req.body
        const data = await budgetService.updateBudget(req.accessToken!, req.userId!, budgetId, name, totalIncome, month, year)
        res.json({ message: 'Budget updated', data })
    },
    async upsertAllocation(req: AuthedRequest, res: Response) {
        const { budgetId, categoryId, amount } = req.body
        if (!budgetId || !categoryId || amount == null) {
            return res.status(400).json({ message: 'budgetId, categoryId and amount are required' })
        }
        const data = await budgetService.upsertAllocation(req.accessToken!, budgetId, categoryId, amount)
        res.json({ message: 'Allocation saved', data })
    }
}