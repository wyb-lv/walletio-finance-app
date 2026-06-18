import { supabaseForUser } from '../config/supabase'
import { HttpError } from '../utils/HttpError'
import type { CreateSpendingGroupInput, UpdateSpendingGroupInput } from '../dto/DTO'

async function getSpendingGroups(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('spending_groups')
        .select('id, user_id, name, sort_order')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

async function createSpendingGroup(accessToken: string, userId: string, input: CreateSpendingGroupInput) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('spending_groups')
        .insert({
            user_id: userId,
            name: input.name,
        })
        .select('id, user_id, name, sort_order')
        .single()
    if (error) throw new Error(error.message)
    return data
}

async function updateSpendingGroup(accessToken: string, userId: string, id: string, input: UpdateSpendingGroupInput) {
    const updates: Record<string, unknown> = {}
    if (input.name !== undefined) updates.name = input.name
    if (Object.keys(updates).length === 0) throw new Error('No fields to update')

    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('spending_groups')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select('id, user_id, name, sort_order')
        .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new HttpError(404, 'Spending group not found')
    return data
}

async function deleteSpendingGroup(accessToken: string, userId: string, id: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('spending_groups')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
    if (error) throw new Error(error.message)
    if (!data?.length) throw new HttpError(404, 'Spending group not found')
    return { message: 'Spending group deleted' }
}

export const spendingGroupService = {
    getSpendingGroups,
    createSpendingGroup,
    updateSpendingGroup,
    deleteSpendingGroup,
}
