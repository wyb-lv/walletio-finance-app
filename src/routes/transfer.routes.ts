import {Router} from 'express'
import {asyncHandler} from '../utils/AsyncHandler'
import {requireAuth} from '../middlewares/auth'
import { transferController } from '../controllers/transfer.controller'

const router = Router()
/**
 * @openapi
 * /transfers:
 *   get:
 *     tags: [Transfer]
 *     summary: Get wallet transfers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_wallet_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional source wallet id to filter transfers
 *       - in: query
 *         name: transfer_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Optional transfer date (YYYY-MM-DD) to filter transfers
 *     responses:
 *       200:
 *         description: A list of wallet transfers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Missing or invalid token
 */router.get('/', requireAuth, asyncHandler(transferController.transfer))

/**
 * @openapi
 * /transfers:
 *   post:
 *     tags: [Transfer]
 *     summary: Transfer money between two wallets
 *     description: Creates a transfer; both wallet balances update automatically through the wallet_balances view.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from_wallet_id:
 *                 type: string
 *                 format: uuid
 *               to_wallet_id:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *               transfer_date:
 *                 type: string
 *                 format: date-time
 *               note:
 *                 type: string
 *                 nullable: true
 *             required:
 *               - from_wallet_id
 *               - to_wallet_id
 *               - amount
 *               - transfer_date
 *     responses:
 *       201:
 *         description: Created transfer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Missing or invalid token
 */
router.post('/', requireAuth, asyncHandler(transferController.createTransfer))

export default router