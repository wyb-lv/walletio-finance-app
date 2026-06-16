import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { asyncHandler } from '../utils/AsyncHandler'

const router = Router()
router.post('/signup', asyncHandler(authController.signup))
router.post('/login', asyncHandler(authController.login))
export default router