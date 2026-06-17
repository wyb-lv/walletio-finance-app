import {Router} from 'express'
import {asyncHandler} from '../utils/AsyncHandler'
import {budgetController} from '../controllers/budget.controller'
import {requireAuth} from '../middlewares/auth'

const router = Router()

/**
 * @openapi
 * /budgets:
 *   get:
 *     tags: [Budget]
 *     summary: Get budgets for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   total_income:
 *                     type: number
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Missing or invalid token
 */
router.get('/', requireAuth, asyncHandler(budgetController.getBudget))
/**
 * @openapi
 * /budgets:
 *   patch:
 *     tags: [Budget]
 *     summary: Update a user's budget
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               budgetId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               totalIncome:
 *                 type: number
 *               month:
 *                 type: integer
 *               year:
 *                 type: integer
 *             required:
 *               - budgetId
 *     responses:
 *       200:
 *         description: Updated budget
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   total_income:
 *                     type: number
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Missing or invalid token
 */
router.patch('/', requireAuth, asyncHandler(budgetController.updateBudget))
/**
 * @openapi
 * /budgets/allocation:
 *   put:
 *     tags: [Budget]
 *     summary: Upsert a budget allocation for a category
 *     description: Sets (or updates) the allocated amount for a (budget, category) pair.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               budgetId:
 *                 type: string
 *                 format: uuid
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *             required:
 *               - budgetId
 *               - categoryId
 *               - amount
 *     responses:
 *       200:
 *         description: Saved allocation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     budget_id:
 *                       type: string
 *                       format: uuid
 *                     category_id:
 *                       type: string
 *                       format: uuid
 *                     amount:
 *                       type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Missing or invalid token
 */
router.put('/allocation', requireAuth, asyncHandler(budgetController.upsertAllocation))
export default router