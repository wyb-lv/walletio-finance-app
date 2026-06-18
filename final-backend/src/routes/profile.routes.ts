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

/**
 * @openapi
 * /profile/avatar:
 *   post:
 *     tags: [Profile]
 *     summary: Upload (or replace) the current user's avatar
 *     description: Stores a single avatar at {userId}/avatar.jpeg in the avatar bucket and saves its public URL on the profile.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image_base64]
 *             properties:
 *               image_base64:
 *                 type: string
 *                 description: Base64-encoded JPEG (data-URI prefix optional)
 *     responses:
 *       200:
 *         description: Profile with the updated avatar_url
 *       400:
 *         description: Missing image_base64
 *       401:
 *         description: Missing or invalid token
 */
router.post('/avatar', requireAuth, asyncHandler(profileController.uploadAvatar))

export default router