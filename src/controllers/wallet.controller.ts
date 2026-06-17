import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import {walletService} from '../services/wallet.service'

export const walletController = {
    async getWallets(req: AuthedRequest, res: Response) {
        res.json(await walletService.getWallets(req.accessToken!, req.userId!))
    },
    async getWalletSummary(req: AuthedRequest, res: Response) {
        res.json(await walletService.getWalletSummary(req.accessToken!, req.userId!))
    }
}