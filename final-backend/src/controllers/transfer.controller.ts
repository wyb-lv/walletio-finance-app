import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import { transferService } from '../services/transfer.service'

export const transferController = {
    async transfer(req: AuthedRequest, res: Response) {
        const { from_wallet_id, transfer_date } = req.query
        res.json(await transferService.getTransfers(req.accessToken!, req.userId!, {
            from_wallet_id: typeof from_wallet_id === 'string' ? from_wallet_id : undefined,
            transfer_date: typeof transfer_date === 'string' ? transfer_date : undefined,
        }))
    },
    async createTransfer(req: AuthedRequest, res: Response) {
        const { from_wallet_id, to_wallet_id, amount, transfer_date, note } = req.body
        if (!from_wallet_id || !to_wallet_id || amount == null || !transfer_date) {
            return res.status(400).json({ message: 'from_wallet_id, to_wallet_id, amount and transfer_date are required' })
        }
        const data = await transferService.createTransfer(req.accessToken!, req.userId!, {
            from_wallet_id, to_wallet_id, amount, transfer_date, note,
        })
        res.status(201).json({ message: 'Transfer created', data })
    },
    async deleteTransfer(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Transfer id is required' })
        }
        const data = await transferService.deleteTransfer(req.accessToken!, req.userId!, id)
        res.json(data)
    }
}