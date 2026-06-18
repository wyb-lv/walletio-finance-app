import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import { emotionService } from '../services/emotion.service'

export const emotionController = {
    async getEmotions(req: AuthedRequest, res: Response) {
        res.json(await emotionService.getEmotions(req.accessToken!))
    },
}
