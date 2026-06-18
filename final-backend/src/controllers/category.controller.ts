import type { Response } from 'express'
import type { AuthedRequest } from '../middlewares/auth'
import { categoryService } from '../services/category.service'

export const categoryController = {
    async getCategories(req: AuthedRequest, res: Response) {
        res.json(await categoryService.getCategories(req.accessToken!, req.userId!))
    },
    async getCategoryById(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Category id is required' })
        }
        const data = await categoryService.getCategoryById(req.accessToken!, req.userId!, id)
        res.json(data)
    },
    async createCategory(req: AuthedRequest, res: Response) {
        const { name, spending_group_id, icon, color } = req.body
        if (!name) {
            return res.status(400).json({ message: 'name is required' })
        }
        const data = await categoryService.createCategory(req.accessToken!, req.userId!, { name, spending_group_id, icon, color })
        res.status(201).json({ message: 'Category created', data })
    },
    async updateCategory(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Category id is required' })
        }
        const { name, spending_group_id, icon, color } = req.body
        const data = await categoryService.updateCategory(req.accessToken!, req.userId!, id, { name, spending_group_id, icon, color })
        res.json({ message: 'Category updated', data })
    },
    async deleteCategory(req: AuthedRequest, res: Response) {
        const id = req.params.id
        if (typeof id !== 'string') {
            return res.status(400).json({ message: 'Category id is required' })
        }
        const data = await categoryService.deleteCategory(req.accessToken!, req.userId!, id)
        res.json(data)
    },
}
