import {supabaseForUser} from '../config/supabase'
import {walletService} from './wallet.service'

async function getBudget(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db.from('budgets').select('id, name, total_income, month, year, created_at').eq('user_id', userId)
    if (error) throw new Error(error.message)

    // Total money in a budget equals the sum of the payment ("ví thanh toán")
    // wallet balances. Tracking wallets (e.g. savings) are excluded.
    const { payment } = await walletService.getWalletSummary(accessToken, userId)
    return (data ?? []).map((budget) => ({ ...budget, total_income: payment }))
}

// Ensures a budget row exists for the given month/year (one per user/month), so
// the client always has a budgetId to allocate against. Idempotent: returns the
// existing budget if one is already there.
async function createBudget(accessToken: string, userId: string, month: number, year: number, name?: string) {
    const db = supabaseForUser(accessToken)
    // total_income không lưu trong bảng mà luôn lấy theo tổng số dư ví thanh toán hiện tại.
    const { payment } = await walletService.getWalletSummary(accessToken, userId)

    // Luồng upsert thủ công: tìm ngân sách của user trong đúng tháng/năm trước.
    // Ràng buộc nghiệp vụ là mỗi user chỉ có 1 ngân sách / tháng nên dùng maybeSingle().
    const { data: existing, error: findError } = await db
        .from('budgets')
        .select('id, name, total_income, month, year, created_at')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()
    if (findError) throw new Error(findError.message)
    // Đã có -> trả về luôn (idempotent), không tạo trùng. Vẫn ghi đè total_income theo ví.
    if (existing) return { ...existing, total_income: payment }

    // Chưa có -> mới tạo bản ghi rỗng (total_income=0, sẽ được tính lại khi trả về).
    const { data, error } = await db
        .from('budgets')
        .insert({ user_id: userId, name: name ?? `Budget ${month}/${year}`, month, year, total_income: 0 })
        .select('id, name, total_income, month, year, created_at')
        .single()
    if (error) throw new Error(error.message)
    return { ...data, total_income: payment }
}

// Returns every allocation belonging to the user's budgets, flattened with the
// parent budget's month/year so the client can match allocations to a month.
async function getAllocations(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('budget_allocations')
        .select('id, budget_id, category_id, allocated, budgets!inner(user_id, month, year)')
        .eq('budgets.user_id', userId)
    if (error) throw new Error(error.message)
    return (data ?? []).map((row: any) => ({
        id: row.id,
        budget_id: row.budget_id,
        category_id: row.category_id,
        allocated: row.allocated,
        month: row.budgets?.month ?? null,
        year: row.budgets?.year ?? null,
    }))
}

async function updateBudget(accessToken: string, userId: string, budgetId: string, name: string, _totalIncome: number, month?: number, year?: number) {
    const db = supabaseForUser(accessToken)
    // total_income is derived from the sum of wallet balances (see getBudget), so it is not persisted here.
    const updates: Record<string, unknown> = { name }
    if (month != null) updates.month = month
    if (year != null) updates.year = year
    const { data, error } = await db.from('budgets').update(updates).eq('id', budgetId).eq('user_id', userId)
    if (error) throw new Error(error.message)
    return data
}

async function upsertAllocation(accessToken: string, budgetId: string, categoryId: string, amount: number, categoryName?: string, budgetName?: string) {
    const db = supabaseForUser(accessToken)

    // B1: lấy user_id chủ ngân sách để biết tính tổng thu nhập theo ví của ai.
    const { data: budget, error: budgetError } = await db
        .from('budgets')
        .select('user_id')
        .eq('id', budgetId)
        .single()
    if (budgetError) throw new Error(budgetError.message)

    // B2: đọc toàn bộ phân bổ hiện có của ngân sách để kiểm tra ràng buộc tổng tiền.
    const { data: existing, error: existingError } = await db
        .from('budget_allocations')
        .select('category_id, allocated')
        .eq('budget_id', budgetId)
    if (existingError) throw new Error(existingError.message)

    // B3: cộng dồn phần đã phân bổ cho CÁC danh mục khác (loại trừ danh mục đang sửa),
    // vì danh mục đang sửa sẽ bị ghi đè bằng `amount` mới chứ không cộng thêm.
    const othersTotal = (existing ?? [])
        .filter((row) => row.category_id !== categoryId)
        .reduce((sum, row) => sum + (row.allocated ?? 0), 0)

    // B4: trần phân bổ = tổng số dư ví thanh toán của user (xem getBudget).
    const { payment: totalIncome } = await walletService.getWalletSummary(accessToken, budget?.user_id)

    // B5: chặn nếu tổng (các danh mục khác + amount mới) vượt quá thu nhập -> tránh phân bổ âm/vượt quỹ.
    if (othersTotal + amount > totalIncome) {
        throw new Error('Total allocated amount exceeds the budget total income')
    }

    // B6: upsert theo khoá (budget_id, category_id) -> sửa nếu đã có, thêm nếu chưa.
    const { data, error } = await db
        .from('budget_allocations')
        .upsert({ budget_id: budgetId, category_id: categoryId, allocated: amount }, { onConflict: 'budget_id,category_id' })
        .select('id, budget_id, category_id, allocated, budgets(name), categories(name)')
        .single()
    if (error) throw new Error(error.message)
    return data
}

async function deleteAllocation(accessToken: string, id: string) {
    const db = supabaseForUser(accessToken)
    const { error } = await db
        .from('budget_allocations')
        .delete()
        .eq('id', id)
    if (error) throw new Error(error.message)
    return { message: 'Allocation deleted' }
}

export const budgetService = {
    getBudget,
    createBudget,
    getAllocations,
    updateBudget,
    upsertAllocation,
    deleteAllocation,
}