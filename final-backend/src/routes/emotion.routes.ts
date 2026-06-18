import { Router } from 'express'
import { asyncHandler } from '../utils/AsyncHandler'
import { requireAuth } from '../middlewares/auth'
import { emotionController } from '../controllers/emotion.controller'

const router = Router()

/**
 * @openapi
 * /emotions:
 *   get:
 *     tags: [Emotion]
 *     summary: Get the emotion lookup list
 *     description: Read-only reference table used when tagging expenses with an emotion.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of emotions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   label:
 *                     type: string
 *       401:
 *         description: Missing or invalid token
 */
router.get('/', requireAuth, asyncHandler(emotionController.getEmotions))

export default router
