import { supabaseForUser } from '../config/supabase'

function monthKey(i: number, year: number): string {
    return `${year}-${String(i + 1).padStart(2, '0')}`
}

// Income (direction 'in') vs expense (direction 'out') totalled per month for a year.
async function getSummary(accessToken: string, userId: string, year: number) {
    const db = supabaseForUser(accessToken)
    const start = `${year}-01-01`
    const end = `${year + 1}-01-01`
    const { data, error } = await db
        .from('expenses')
        .select('direction, amount, expense_date')
        .eq('user_id', userId)
        .gte('expense_date', start)
        .lt('expense_date', end)
    if (error) throw new Error(error.message)

    // Khởi tạo sẵn 12 tháng với income/expense = 0 để tháng không có giao dịch vẫn trả về 0
    // (đảm bảo biểu đồ luôn đủ 12 cột, không bị khuyết tháng).
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: monthKey(i, year),
        income: 0,
        expense: 0,
    }))
    // Duyệt từng giao dịch -> lấy chỉ số tháng từ ký tự 6-7 của ngày (YYYY-MM-DD), trừ 1 về 0-based,
    // rồi cộng dồn vào income (thu) hoặc expense (chi) đúng tháng.
    for (const row of (data ?? []) as any[]) {
        const m = Number(String(row.expense_date).slice(5, 7)) - 1
        if (m < 0 || m > 11) continue
        const amount = Number(row.amount) || 0
        if (row.direction === 'in') months[m]!.income += amount
        else if (row.direction === 'out') months[m]!.expense += amount
    }
    return { year, months }
}

// Category breakdown for the donut chart, for a direction (default 'out') and optional date range.
async function getOverview(
    accessToken: string,
    userId: string,
    opts: { from?: string | undefined; to?: string | undefined; direction?: 'in' | 'out' | undefined }
) {
    const db = supabaseForUser(accessToken)
    const direction = opts.direction ?? 'out'
    let query = db
        .from('expenses')
        .select('amount, category_id, categories (name)')
        .eq('user_id', userId)
        .eq('direction', direction)
    if (opts.from) query = query.gte('expense_date', opts.from)
    if (opts.to) query = query.lt('expense_date', opts.to)
    const { data, error } = await query
    if (error) throw new Error(error.message)

    // Gom tổng tiền theo từng danh mục bằng Map (key = category_id, hoặc 'uncategorized' nếu null).
    // Đồng thời cộng `total` toàn bộ để lát nữa tính % cho biểu đồ donut.
    const map = new Map<string, { category_id: string | null; category_name: string; total: number }>()
    let total = 0
    for (const row of (data ?? []) as any[]) {
        const key = row.category_id ?? 'uncategorized'
        const name = row.categories?.name ?? 'Uncategorized'
        const amount = Number(row.amount) || 0
        total += amount
        // Lấy bản ghi đang gom của danh mục này, chưa có thì tạo mới rồi cộng dồn.
        const current = map.get(key) ?? { category_id: row.category_id ?? null, category_name: name, total: 0 }
        current.total += amount
        map.set(key, current)
    }
    // Tính % mỗi danh mục so với tổng (làm tròn 2 chữ số) và sắp xếp giảm dần để donut hiển thị đẹp.
    // Lưu ý chia cho 0: nếu total = 0 thì percentage = 0 thay vì NaN.
    const categories = [...map.values()]
        .map((c) => ({ ...c, percentage: total ? Math.round((c.total / total) * 10000) / 100 : 0 }))
        .sort((a, b) => b.total - a.total)
    return { direction, total, categories }
}

// Total balance across all wallets over time. Transfers are internal moves between the
// user's own wallets, so they don't change the total; only income/expense does.
async function getBalanceTimeline(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    const { data: wallets, error: walletsError } = await db
        .from('wallets')
        .select('opening_balance')
        .eq('user_id', userId)
    if (walletsError) throw new Error(walletsError.message)
    // B1: số dư khởi điểm của đường biểu đồ = tổng opening_balance tất cả ví.
    const openingBalance = ((wallets ?? []) as any[]).reduce((sum, w) => sum + (Number(w.opening_balance) || 0), 0)

    const { data, error } = await db
        .from('expenses')
        .select('direction, amount, expense_date')
        .eq('user_id', userId)
        .order('expense_date', { ascending: true })
    if (error) throw new Error(error.message)

    // B2: gom thay đổi ròng (delta) theo từng tháng: thu (+amount), chi (-amount).
    const monthly = new Map<string, number>()
    for (const row of (data ?? []) as any[]) {
        const month = String(row.expense_date).slice(0, 7)
        const amount = Number(row.amount) || 0
        const delta = row.direction === 'in' ? amount : -amount
        monthly.set(month, (monthly.get(month) ?? 0) + delta)
    }

    // B3: cộng dồn lũy kế (running total) theo thứ tự tháng tăng dần để ra số dư cuối mỗi tháng.
    // running giữ giá trị qua các vòng lặp -> mỗi điểm = số dư tích luỹ tới hết tháng đó.
    let running = openingBalance
    const points = [...monthly.keys()].sort().map((month) => {
        running += monthly.get(month)!
        return { month, balance: running }
    })
    return { opening_balance: openingBalance, points }
}

export const analyticService = {
    getSummary,
    getOverview,
    getBalanceTimeline,
}
