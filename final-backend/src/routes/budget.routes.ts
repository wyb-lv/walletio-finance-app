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
 *   post:
 *     tags: [Budget]
 *     summary: Create (or fetch) the budget for a given month/year
 *     description: Idempotent — returns the existing budget if one already exists for the month.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [month, year]
 *             properties:
 *               month:
 *                 type: integer
 *               year:
 *                 type: integer
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Budget ready for the month
 *       400:
 *         description: month and year are required
 *       401:
 *         description: Missing or invalid token
 */
router.post('/', requireAuth, asyncHandler(budgetController.createBudget))
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
/**
 * @openapi
 * /budgets/allocation:
 *   get:
 *     tags: [Budget]
 *     summary: Get all budget allocations for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of allocations (with parent budget month/year)
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
 *                   budget_id:
 *                     type: string
 *                     format: uuid
 *                   category_id:
 *                     type: string
 *                     format: uuid
 *                   allocated:
 *                     type: number
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *       401:
 *         description: Missing or invalid token
 */
router.get('/allocation', requireAuth, asyncHandler(budgetController.getAllocations))

router.put('/allocation', requireAuth, asyncHandler(budgetController.upsertAllocation))

/**
 * @openapi
 * /budgets/allocation/{id}:
 *   delete:
 *     tags: [Budget]
 *     summary: Delete a budget allocation by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Budget allocation id to delete
 *     responses:
 *       200:
 *         description: Allocation deleted
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
router.delete('/allocation/:id', requireAuth, asyncHandler(budgetController.deleteAllocation))

export default router