import { Router } from 'express'
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

/**
 * @openapi
 * /wallets:
 *   post:
 *     tags: [Wallet]
 *     summary: Create a new wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [payment, tracking]
 *               opening_balance:
 *                 type: integer
 *                 format: int64
 *                 description: Default is 0
 *     responses:
 *       201:
 *         description: Wallet created
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
router.post('/', requireAuth, asyncHandler(walletController.createWallet))

/**
 * @openapi
 * /wallets/{id}:
 *   get:
 *     tags: [Wallet]
 *     summary: Get a single wallet by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Wallet id
 *     responses:
 *       200:
 *         description: Wallet details with live balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallet_id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                   enum: [payment, tracking]
 *                 opening_balance:
 *                   type: integer
 *                   format: int64
 *                 balance:
 *                   type: integer
 *                   format: int64
 *       400:
 *         description: Wallet not found
 *       401:
 *         description: Missing or invalid token
 */
router.get('/:id', requireAuth, asyncHandler(walletController.getWalletById))

/**
 * @openapi
 * /wallets/{id}:
 *   patch:
 *     tags: [Wallet]
 *     summary: Update a wallet
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Wallet id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [payment, tracking]
 *               opening_balance:
 *                 type: integer
 *                 format: int64
 *     responses:
 *       200:
 *         description: Wallet updated
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
router.patch('/:id', requireAuth, asyncHandler(walletController.updateWallet))

/**
 * @openapi
 * /wallets/{id}:
 *   delete:
 *     tags: [Wallet]
 *     summary: Delete a wallet
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Wallet id
 *     responses:
 *       200:
 *         description: Wallet deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Missing or invalid token
 */
router.delete('/:id', requireAuth, asyncHandler(walletController.deleteWallet))

export default router