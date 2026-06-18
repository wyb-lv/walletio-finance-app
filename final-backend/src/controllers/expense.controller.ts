import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import { expenseService } from '../services/expense.service'

export const expenseController = {
    async getExpenses(req: AuthedRequest, res: Response) {
        res.json(await expenseService.getExpenses(req.accessToken!, req.userId!))
    },
    async createExpense(req: AuthedRequest, res: Response) {
        const { wallet_id, direction, amount, note, category_id, emotion_id, budget_id } = req.body
        if (!direction || amount == null) {
            return res.status(400).json({ message: 'direction and amount are required' })
        }
        const data = await expenseService.createExpense(req.accessToken!, req.userId!, {
            wallet_id, direction, amount, note, category_id, emotion_id, budget_id,
        })
        res.status(201).json({ message: 'Expense created', data })
    },
    async updateExpense(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Expense id is required' })
        }
        const { wallet_id, direction, amount, note, category_id, emotion_id, budget_id } = req.body
        const data = await expenseService.updateExpense(req.accessToken!, req.userId!, id, {
            wallet_id, direction, amount, note, category_id, emotion_id, budget_id,
        })
        res.json({ message: 'Expense updated', data })
    },
    async deleteExpense(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Expense id is required' })
        }
        const data = await expenseService.deleteExpense(req.accessToken!, req.userId!, id)
        res.json(data)
    }
}