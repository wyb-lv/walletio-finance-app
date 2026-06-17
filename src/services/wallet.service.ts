import {supabaseForUser} from '../config/supabase'

async function getWallets(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db.from('wallet_balances').select('*').eq('user_id', userId)
    if (error) throw new Error(error.message)
    return data
}

async function getWalletSummary(accessToken: string, userId: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db.from('wallet_balances').select('type, balance').eq('user_id', userId)
    if (error) throw new Error(error.message)

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

export const walletService = {
    getWallets,
    getWalletSummary,
}