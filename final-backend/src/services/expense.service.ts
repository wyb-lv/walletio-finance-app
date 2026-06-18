import {supabaseForUser} from '../config/supabase'
import { HttpError } from '../utils/HttpError'
import type { ExpenseDTO, CreateExpenseInput, UpdateExpenseInput } from '../dto/DTO'

async function getExpenses(accessToken: string, userId: string): Promise<ExpenseDTO[]> {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('expenses')
        .select('id, direction, amount, note, expense_date, wallets (name), categories (name), emotions (label), budgets (name)')
        .eq('user_id', userId)
        .order('expense_date', { ascending: false })
    if (error) throw new Error(error.message)
    // All expenses belong to the authenticated user, so profile_name is the same for every row.
    const { data: profile } = await db.from('profiles').select('name').eq('id', userId).single()
    const profileName: string | null = profile?.name ?? null
    const flatData: ExpenseDTO[] = data.map((item: any) => ({
        id: item.id,
        direction: item.direction,
        amount: item.amount,
        note: item.note,
        expense_date: item.expense_date,
        profile_name: profileName,
        wallet_name: item.wallets?.name || null,
        category_name: item.categories?.name || null,
        emotion_label: item.emotions?.label || null,
        budget_name: item.budgets?.name || null
    }));
    return flatData
}

// Ensures the wallet belongs to the user. When walletId is omitted, falls back to
// the user's first wallet so the client doesn't have to send one explicitly.
async function resolveWalletId(db: ReturnType<typeof supabaseForUser>, userId: string, walletId?: string | null): Promise<string> {
    if (walletId) {
        const { data, error } = await db
            .from('wallets')
            .select('id')
            .eq('id', walletId)
            .eq('user_id', userId)
            .maybeSingle()
        if (error) throw new Error(error.message)
        if (!data) throw new Error('Wallet not found')
        return data.id
    }
    const { data, error } = await db
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error('No wallet found for this user')
    return data.id
}

async function createExpense(accessToken: string, userId: string, input: CreateExpenseInput) {
    const db = supabaseForUser(accessToken)
    // Xác định ví ghi giao dịch: dùng wallet_id client gửi, nếu không có thì lấy ví đầu tiên của user.
    const walletId = await resolveWalletId(db, userId, input.wallet_id)
    // Chỉ insert bản ghi expense; KHÔNG tự cộng/trừ số dư. Số dư ví được tính tự động qua view
    // wallet_balances (= opening_balance + tổng thu - tổng chi) nên insert đúng là số dư & ngân sách tự khớp.
    const { data, error } = await db
        .from('expenses')
        .insert({
            user_id: userId,
            wallet_id: walletId,
            direction: input.direction,
            amount: input.amount,
            expense_date: new Date().toISOString(),
            note: input.note ?? null,
            category_id: input.category_id ?? null,
            emotion_id: input.emotion_id ?? null,
            budget_id: input.budget_id ?? null,
        })
        .select('id, direction, amount, note, expense_date, wallet_id, category_id, emotion_id, budget_id')
        .single()
    if (error) throw new Error(error.message)
    return data
}

async function updateExpense(accessToken: string, userId: string, expenseId: string, input: UpdateExpenseInput) {
    const db = supabaseForUser(accessToken)
    // Cập nhật một phần (partial update): chỉ đưa vào `updates` các field client gửi lên.
    // Phân biệt "không gửi" (undefined -> bỏ qua) với "gửi null" (cố ý xoá giá trị) nên
    // điều kiện check là `!== undefined` chứ không phải kiểm tra truthy.
    const updates: Record<string, unknown> = {}
    if (input.wallet_id !== undefined) updates.wallet_id = await resolveWalletId(db, userId, input.wallet_id)
    if (input.direction !== undefined) updates.direction = input.direction
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.note !== undefined) updates.note = input.note
    if (input.category_id !== undefined) updates.category_id = input.category_id
    if (input.emotion_id !== undefined) updates.emotion_id = input.emotion_id
    if (input.budget_id !== undefined) updates.budget_id = input.budget_id
    // Không có field nào để sửa -> báo lỗi thay vì gửi UPDATE rỗng.
    if (Object.keys(updates).length === 0) {
        throw new Error('No fields to update')
    }
    // Sửa amount/direction/wallet sẽ tự động đổi số dư ví & ngân sách qua view wallet_balances.
    // Ràng buộc .eq('user_id') đảm bảo user không sửa được giao dịch của người khác.

    const { data, error } = await db
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)
        .eq('user_id', userId)
        .select('id, direction, amount, note, expense_date, wallet_id, category_id, emotion_id, budget_id')
        .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new HttpError(404, 'Expense not found')
    return data
}

async function deleteExpense(accessToken: string, userId: string, id: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
    if (error) throw new Error(error.message)
    if (!data?.length) throw new HttpError(404, 'Expense not found')
    return { message: 'Expense deleted' }
}

export const expenseService = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
}