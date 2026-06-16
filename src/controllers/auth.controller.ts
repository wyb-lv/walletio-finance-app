import type { Request, Response } from 'express'
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
}