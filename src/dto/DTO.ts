export interface UserDTO {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
}

export interface ExpenseDTO {
    id: string
    direction: string
    amount: number
    note: string
    expense_date: string
    profile_name: string | null
    wallet_name: string | null
    category_name: string | null
    emotion_label: string | null
    budget_name: string | null
}

export interface CreateExpenseInput {
    wallet_id?: string | null
    direction: string
    amount: number
    note?: string | null
    category_id?: string | null
    emotion_id?: string | null
    budget_id?: string | null
}

export interface UpdateExpenseInput {
    wallet_id?: string
    direction?: string
    amount?: number
    note?: string | null
    category_id?: string | null
    emotion_id?: string | null
    budget_id?: string | null
}

export interface CreateTransferInput {
    from_wallet_id: string
    to_wallet_id: string
    amount: number
    transfer_date: string
    note?: string | null
}