import { Router } from 'express'
import { asyncHandler } from '../utils/AsyncHandler'
import { requireAuth } from '../middlewares/auth'
import { spendingGroupController } from '../controllers/spending-group.controller'

const router = Router()

/**
 * @openapi
 * /spending-groups:
 *   get:
 *     tags: [SpendingGroup]
 *     summary: Get all spending groups for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of spending groups
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
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                     nullable: true
 *       401:
 *         description: Missing or invalid token
 */
router.get('/', requireAuth, asyncHandler(spendingGroupController.getSpendingGroups))

/**
 * @openapi
 * /spending-groups:
 *   post:
 *     tags: [SpendingGroup]
 *     summary: Create a new spending group
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Spending group created
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
router.post('/', requireAuth, asyncHandler(spendingGroupController.createSpendingGroup))

/**
 * @openapi
 * /spending-groups/{id}:
 *   patch:
 *     tags: [SpendingGroup]
 *     summary: Update a spending group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Spending group id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Spending group updated
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
router.patch('/:id', requireAuth, asyncHandler(spendingGroupController.updateSpendingGroup))

/**
 * @openapi
 * /spending-groups/{id}:
 *   delete:
 *     tags: [SpendingGroup]
 *     summary: Delete a spending group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Spending group id
 *     responses:
 *       200:
 *         description: Spending group deleted
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
router.delete('/:id', requireAuth, asyncHandler(spendingGroupController.deleteSpendingGroup))

export default router
