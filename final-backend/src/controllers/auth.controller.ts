import type { Request, Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import { authService } from '../services/auth.service'

export const authController = {
  async signup(req: Request, res: Response) {
    const { email, password, name } = req.body
    res.status(201).json(await authService.signup(email, password, name))
  },
  async login(req: Request, res: Response) {
    const { email, password } = req.body
    res.json(await authService.login(email, password))
  },
  async refresh(req: Request, res: Response) {
    const { refresh_token } = req.body
    if (!refresh_token || typeof refresh_token !== 'string') {
      return res.status(400).json({ message: 'refresh_token is required' })
    }
    res.json(await authService.refresh(refresh_token))
  },
  async changePassword(req: AuthedRequest, res: Response) {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'oldPassword and newPassword are required' })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ message: 'newPassword must be at least 6 characters' })
    }
    if (oldPassword === newPassword) {
      return res.status(400).json({ message: 'newPassword must be different from oldPassword' })
    }
    res.json(await authService.changePassword(req.accessToken!, oldPassword, newPassword))
  },
}