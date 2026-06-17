import {supabaseForUser} from '../config/supabase'
import type { CreateTransferInput } from '../dto/DTO'

interface FilterOptions {
    transfer_date?: string | undefined;
    from_wallet_id?: string | undefined;
}

async function getTransfers(accessToken: string, userId: string, options?: FilterOptions) {
    const db = supabaseForUser(accessToken)
    let query = db
        .from('wallet_transfers')
        .select('*')
        .eq('user_id', userId)
    if (options?.transfer_date) {
        query = query.eq('transfer_date', options.transfer_date);
    }
    if (options?.from_wallet_id) {
        query = query.eq('from_wallet_id', options.from_wallet_id);
    }
    const { data, error } = await query.order('transfer_date', { ascending: false })
    if (error) throw new Error(error.message)
    return data
}

async function createTransfer(accessToken: string, userId: string, input: CreateTransferInput) {
    const db = supabaseForUser(accessToken)
    if (input.from_wallet_id === input.to_wallet_id) {
        throw new Error('from_wallet_id and to_wallet_id must be different')
    }

    // Both wallets must exist and belong to the user, otherwise only one side of
    // the transfer would be valid and the view balances would not update correctly.
    const { data: wallets, error: walletsError } = await db
        .from('wallet_balances')
        .select('wallet_id, balance')
        .eq('user_id', userId)
        .in('wallet_id', [input.from_wallet_id, input.to_wallet_id])
    if (walletsError) throw new Error(walletsError.message)

    const fromWallet = wallets?.find((w) => w.wallet_id === input.from_wallet_id)
    const toWallet = wallets?.find((w) => w.wallet_id === input.to_wallet_id)
    if (!fromWallet) throw new Error('Source wallet not found')
    if (!toWallet) throw new Error('Destination wallet not found')
    if (input.amount > (fromWallet.balance ?? 0)) {
        throw new Error('Transfer amount exceeds the source wallet balance')
    }

    const { data, error } = await db
        .from('wallet_transfers')
        .insert({
            user_id: userId,
            from_wallet_id: input.from_wallet_id,
            to_wallet_id: input.to_wallet_id,
            amount: input.amount,
            transfer_date: input.transfer_date,
            note: input.note ?? null,
        })
        .select('id, from_wallet_id, to_wallet_id, amount, transfer_date, note')
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const transferService = {
    getTransfers,
    createTransfer,
}