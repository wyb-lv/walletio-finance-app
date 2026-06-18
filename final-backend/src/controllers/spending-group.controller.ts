import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import { spendingGroupService } from '../services/spending-group.service'

export const spendingGroupController = {
    async getSpendingGroups(req: AuthedRequest, res: Response) {
        res.json(await spendingGroupService.getSpendingGroups(req.accessToken!, req.userId!))
    },
    async createSpendingGroup(req: AuthedRequest, res: Response) {
        const { name } = req.body
        if (!name) {
            return res.status(400).json({ message: 'name is required' })
        }
        const data = await spendingGroupService.createSpendingGroup(req.accessToken!, req.userId!, { name })
        res.status(201).json({ message: 'Spending group created', data })
    },
    async updateSpendingGroup(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Spending group id is required' })
        }
        const { name } = req.body
        const data = await spendingGroupService.updateSpendingGroup(req.accessToken!, req.userId!, id, { name })
        res.json({ message: 'Spending group updated', data })
    },
    async deleteSpendingGroup(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Spending group id is required' })
        }
        const data = await spendingGroupService.deleteSpendingGroup(req.accessToken!, req.userId!, id)
        res.json(data)
    },
}
