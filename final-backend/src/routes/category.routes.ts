import { Router } from 'express'
import { asyncHandler } from '../utils/AsyncHandler'
import { requireAuth } from '../middlewares/auth'
import { categoryController } from '../controllers/category.controller'

const router = Router()

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Category]
 *     summary: Get all categories for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
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
 *                   icon:
 *                     type: string
 *                     nullable: true
 *       401:
 *         description: Missing or invalid token
 */
router.get('/', requireAuth, asyncHandler(categoryController.getCategories))

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Category]
 *     summary: Get a single category by id
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
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 icon:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Missing or invalid token
 *       400:
 *         description: Category not found
 */
router.get('/:id', requireAuth, asyncHandler(categoryController.getCategoryById))

/**
 * @openapi
 * /categories:
 *   post:
 *     tags: [Category]
 *     summary: Create a new category
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
 *               icon:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Category created
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
router.post('/', requireAuth, asyncHandler(categoryController.createCategory))

/**
 * @openapi
 * /categories/{id}:
 *   patch:
 *     tags: [Category]
 *     summary: Update a category
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Category updated
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
router.patch('/:id', requireAuth, asyncHandler(categoryController.updateCategory))

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     tags: [Category]
 *     summary: Delete a category
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
 *     responses:
 *       200:
 *         description: Category deleted
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
router.delete('/:id', requireAuth, asyncHandler(categoryController.deleteCategory))

export default router
