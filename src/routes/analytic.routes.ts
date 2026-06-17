import { Router } from 'express'
import { asyncHandler } from '../utils/AsyncHandler'
import { requireAuth } from '../middlewares/auth'
import { analyticController } from '../controllers/analytic.controller'

const router = Router()

/**
 * @openapi
 * /analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Income vs expense per month (thu vs chi theo tháng)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *         description: Year to summarise. Defaults to the current year.
 *     responses:
 *       200:
 *         description: Monthly income/expense totals
 *       401:
 *         description: Missing or invalid token
 */
router.get('/summary', requireAuth, asyncHandler(analyticController.summary))

/**
 * @openapi
 * /analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Category breakdown for the donut chart (phân tích danh mục)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: direction
 *         required: false
 *         schema:
 *           type: string
 *           enum: [in, out]
 *         description: Transaction direction to break down. Defaults to 'out'.
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Optional start date (inclusive, YYYY-MM-DD).
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Optional end date (exclusive, YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Totals and percentages per category
 *       401:
 *         description: Missing or invalid token
 */
router.get('/overview', requireAuth, asyncHandler(analyticController.overview))

/**
 * @openapi
 * /analytics/balance:
 *   get:
 *     tags: [Analytics]
 *     summary: Total balance over time (số dư theo thời gian)
 *     description: Cumulative total balance across all wallets per month. Transfers between the user's own wallets are excluded as they don't change the total.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Opening balance and monthly cumulative balance points
 *       401:
 *         description: Missing or invalid token
 */
router.get('/balance', requireAuth, asyncHandler(analyticController.balance))

/**
 * @openapi
 * /analytics/category/{id}:
 *   get:
 *     tags: [Analytics]
 *     summary: Monthly trend for one category (xu hướng một danh mục theo tháng)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category id
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *         description: Year to analyse. Defaults to the current year.
 *     responses:
 *       200:
 *         description: Monthly income/expense totals for the category
 *       401:
 *         description: Missing or invalid token
 */
router.get('/category/:id', requireAuth, asyncHandler(analyticController.categoryTrend))

export default router
