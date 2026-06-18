import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import {profileService} from '../services/profile.service'

export const profileController = {
    async getProfile(req: AuthedRequest, res: Response) {
        res.json(await profileService.getProfile(req.accessToken!))
    },
    async updateProfile(req: AuthedRequest, res: Response) {
        const { full_name, avatar_url } = req.body
        res.json(await profileService.updateProfile(req.accessToken!, full_name, avatar_url))
    },
    async uploadAvatar(req: AuthedRequest, res: Response) {
        const { image_base64 } = req.body
        if (!image_base64 || typeof image_base64 !== 'string') {
            return res.status(400).json({ message: 'image_base64 is required' })
        }
        res.json(await profileService.uploadAvatar(req.accessToken!, req.userId!, image_base64))
    }
}