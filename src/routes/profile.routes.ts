import {Router} from 'express'
import { profileController } from '../controllers/profile.controller'
import { asyncHandler } from '../utils/AsyncHandler'
import { requireAuth } from '../middlewares/auth'

const router = Router()

/**
 * @openapi
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get the current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The authenticated user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 full_name:
 *                   type: string
 *                   nullable: true
 *                 avatar_url:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Missing or invalid token
 */
router.get('/', requireAuth, asyncHandler(profileController.getProfile))

/**
 * @openapi
 * /profile:
 *   patch:
 *     tags: [Profile]
 *     summary: Update the current user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 nullable: true
 *               avatar_url:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 name:
 *                   type: string
 *                   nullable: true
 *                 avatar_url:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Missing or invalid token
 */
router.patch('/', requireAuth, asyncHandler(profileController.updateProfile))

export default router