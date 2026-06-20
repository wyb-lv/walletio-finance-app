import { supabaseForUser } from '../config/supabase'
import { HttpError } from '../utils/HttpError'
import type { CreateCategoryInput, UpdateCategoryInput } from '../dto/DTO'

async function getCategories(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('categories')
        .select('id, user_id, spending_group_id, name, icon, color')
        .eq('user_id', userId)
        .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

async function createCategory(accessToken: string, userId: string, input: CreateCategoryInput) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('categories')
        .insert({
            user_id: userId,
            name: input.name,
            spending_group_id: input.spending_group_id ?? null,
            icon: input.icon ?? null,
            color: input.color ?? null,
        })
        .select('id, user_id, spending_group_id, name, icon, color')
        .single()
    if (error) throw new Error(error.message)
    return data
}

async function updateCategory(accessToken: string, userId: string, id: string, input: UpdateCategoryInput) {
    const updates: Record<string, unknown> = {}
    if (input.name !== undefined) updates.name = input.name
    if (input.spending_group_id !== undefined) updates.spending_group_id = input.spending_group_id
    if (input.icon !== undefined) updates.icon = input.icon
    if (input.color !== undefined) updates.color = input.color
    if (Object.keys(updates).length === 0) throw new Error('No fields to update')

    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select('id, user_id, spending_group_id, name, icon, color')
        .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new HttpError(404, 'Category not found')
    return data
}

async function deleteCategory(accessToken: string, userId: string, id: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
    if (error) throw new Error(error.message)
    if (!data?.length) throw new HttpError(404, 'Category not found')
    return { message: 'Category deleted' }
}

export const categoryService = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
}
