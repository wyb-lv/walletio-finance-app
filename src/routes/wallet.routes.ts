import {Router} from 'express'
import { walletController } from '../controllers/wallet.controller'
import { asyncHandler } from '../utils/AsyncHandler'
import { requireAuth } from '../middlewares/auth'

const router = Router()

/**
 * @openapi
 * /wallets:
 *   get:
 *     tags: [Wallet]
 *     summary: Get the current user's wallets with live balances
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wallets (from the wallet_balances view)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   wallet_id:
 *                     type: string
 *                     format: uuid
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [payment, tracking]
 *                   opening_balance:
 *                     type: integer
 *                     format: int64
 *                   balance:
 *                     type: integer
 *                     format: int64
 *       401:
 *         description: Missing or invalid token
 */
router.get('/', requireAuth, asyncHandler(walletController.getWallets))

/**
 * @openapi
 * /wallets/summary:
 *   get:
 *     tags: [Wallet]
 *     summary: Get total assets split by wallet type
 *     description: Aggregates balances across all the user's wallets into a total plus payment/tracking breakdown.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asset summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   format: int64
 *                 payment:
 *                   type: integer
 *                   format: int64
 *                 tracking:
 *                   type: integer
 *                   format: int64
 *       401:
 *         description: Missing or invalid token
 */
router.get('/summary', requireAuth, asyncHandler(walletController.getWalletSummary))

export default router