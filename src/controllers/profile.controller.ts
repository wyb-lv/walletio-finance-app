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
    }
}