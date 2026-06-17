import {supabaseForUser} from '../config/supabase'

async function getBudget(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db.from('budgets').select('id, name, total_income, month, year, created_at').eq('user_id', userId)
    if (error) throw new Error(error.message)
    return data
}

async function updateBudget(accessToken: string, userId: string, budgetId: string, name: string, totalIncome: number, month?: number, year?: number) {
    const db = supabaseForUser(accessToken)
    const updates: Record<string, unknown> = { name, total_income: totalIncome }
    if (month != null) updates.month = month
    if (year != null) updates.year = year
    const { data, error } = await db.from('budgets').update(updates).eq('id', budgetId).eq('user_id', userId)
    if (error) throw new Error(error.message)
    return data
}

async function upsertAllocation(accessToken: string, budgetId: string, categoryId: string, amount: number) {
    const db = supabaseForUser(accessToken)

    const { data: budget, error: budgetError } = await db
        .from('budgets')
        .select('total_income')
        .eq('id', budgetId)
        .single()
    if (budgetError) throw new Error(budgetError.message)

    const { data: existing, error: existingError } = await db
        .from('budget_allocations')
        .select('category_id, allocated')
        .eq('budget_id', budgetId)
    if (existingError) throw new Error(existingError.message)

    const othersTotal = (existing ?? [])
        .filter((row) => row.category_id !== categoryId)
        .reduce((sum, row) => sum + (row.allocated ?? 0), 0)

    if (othersTotal + amount > (budget?.total_income ?? 0)) {
        throw new Error('Total allocated amount exceeds the budget total income')
    }

    const { data, error } = await db
        .from('budget_allocations')
        .upsert({ budget_id: budgetId, category_id: categoryId, allocated: amount }, { onConflict: 'budget_id,category_id' })
        .select('budget_id, category_id, allocated')
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const budgetService = {
    getBudget,
    updateBudget,
    upsertAllocation,
}