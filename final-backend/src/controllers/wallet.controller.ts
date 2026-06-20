import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import { walletService } from '../services/wallet.service'

export const walletController = {
    async getWallets(req: AuthedRequest, res: Response) {
        res.json(await walletService.getWallets(req.accessToken!, req.userId!))
    },
    async getWalletSummary(req: AuthedRequest, res: Response) {
        res.json(await walletService.getWalletSummary(req.accessToken!, req.userId!))
    },
    async createWallet(req: AuthedRequest, res: Response) {
        const { name, type, opening_balance } = req.body
        if (!name || !type) {
            return res.status(400).json({ message: 'name and type are required' })
        }
        if (type !== 'payment' && type !== 'tracking') {
            return res.status(400).json({ message: 'type must be payment or tracking' })
        }
        const data = await walletService.createWallet(req.accessToken!, req.userId!, { name, type, opening_balance })
        res.status(201).json({ message: 'Wallet created', data })
    },
    async updateWallet(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Wallet id is required' })
        }
        const { name, type, opening_balance } = req.body
        if (type !== undefined && type !== 'payment' && type !== 'tracking') {
            return res.status(400).json({ message: 'type must be payment or tracking' })
        }
        const data = await walletService.updateWallet(req.accessToken!, req.userId!, id, { name, type, opening_balance })
        res.json({ message: 'Wallet updated', data })
    },
    async deleteWallet(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Wallet id is required' })
        }
        const data = await walletService.deleteWallet(req.accessToken!, req.userId!, id)
        res.json(data)
    },
}