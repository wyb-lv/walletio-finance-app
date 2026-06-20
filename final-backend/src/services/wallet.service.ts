import { supabaseForUser } from '../config/supabase'
import { HttpError } from '../utils/HttpError'
import type { CreateWalletInput, UpdateWalletInput } from '../dto/DTO'

async function getWallets(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db.from('wallet_balances').select('*').eq('user_id', userId)
    if (error) throw new Error(error.message)
    return data
}

async function getWalletSummary(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    // Đọc số dư từng ví (đã tính sẵn ở view wallet_balances) kèm loại ví.
    const { data, error } = await db.from('wallet_balances').select('type, balance').eq('user_id', userId)
    if (error) throw new Error(error.message)

    // Gộp nhiều dòng ví thành 1 tổng hợp tài sản bằng reduce:
    //  - total: tổng tất cả ví.
    //  - payment: tổng ví thanh toán (dùng làm trần ngân sách, xem budget.service).
    //  - tracking: tổng ví theo dõi (vd tiết kiệm), không tính vào ngân sách.
    const summary = (data ?? []).reduce(
        (acc, row) => {
            const balance = row.balance ?? 0
            acc.total += balance
            if (row.type === 'payment') acc.payment += balance
            else if (row.type === 'tracking') acc.tracking += balance
            return acc
        },
        { total: 0, payment: 0, tracking: 0 }
    )
    return summary
}

async function createWallet(accessToken: string, userId: string, input: CreateWalletInput) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('wallets')
        .insert({
            user_id: userId,
            name: input.name,
            type: input.type,
            opening_balance: input.opening_balance ?? 0,
        })
        .select('id, user_id, name, type, opening_balance')
        .single()
    if (error) throw new Error(error.message)
    return data
}

async function updateWallet(accessToken: string, userId: string, id: string, input: UpdateWalletInput) {
    const updates: Record<string, unknown> = {}
    if (input.name !== undefined) updates.name = input.name
    if (input.type !== undefined) updates.type = input.type
    if (input.opening_balance !== undefined) updates.opening_balance = input.opening_balance
    if (Object.keys(updates).length === 0) throw new Error('No fields to update')

    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('wallets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select('id, user_id, name, type, opening_balance')
        .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new HttpError(404, 'Wallet not found')
    return data
}

async function deleteWallet(accessToken: string, userId: string, id: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('wallets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
    if (error) throw new Error(error.message)
    if (!data?.length) throw new HttpError(404, 'Wallet not found')
    return { message: 'Wallet deleted' }
}

export const walletService = {
    getWallets,
    getWalletSummary,
    createWallet,
    updateWallet,
    deleteWallet,
}