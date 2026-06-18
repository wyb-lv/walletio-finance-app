import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { asyncHandler } from '../utils/AsyncHandler'
import { requireAuth } from '../middlewares/auth'


const router = Router()

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: huytest@outlook.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               name:
 *                 type: string
 *                 example: Bao Huy
 *     responses:
 *       201:
 *         description: User created (session returned if email confirmation is disabled)
 *       400:
 *         description: Signup failed
 */
router.post('/signup', asyncHandler(authController.signup))

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: huytest@outlook.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful, returns session with access_token
 *       400:
 *         description: Invalid credentials or email not confirmed
 */
router.post('/login', asyncHandler(authController.login))

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new session
 *     description: Returns a fresh access_token and a rotated refresh_token. No access token required.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: v1.M2Y4...
 *     responses:
 *       200:
 *         description: New session with access_token and refresh_token
 *       400:
 *         description: Missing or invalid refresh token
 */
router.post('/refresh', asyncHandler(authController.refresh))

/**
 * @openapi
 * /auth/password:
 *   put:
 *     tags: [Auth]
 *     summary: Change the authenticated user's password
 *     description: Verifies the current password, then sets a new one.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword456!
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Old password incorrect or invalid input
 *       401:
 *         description: Missing or invalid token
 */
router.put('/password', requireAuth, asyncHandler(authController.changePassword))

export default router