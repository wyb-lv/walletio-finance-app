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

export interface SpendingGroupDTO {
    id: string
    user_id: string
    name: string
    description: string | null
}

export interface CreateSpendingGroupInput {
    name: string
}

export interface UpdateSpendingGroupInput {
    name?: string
}

export interface CategoryDTO {
    id: string
    user_id: string
    name: string
    icon: string | null
}

export interface CreateCategoryInput {
    name: string
    spending_group_id?: string | null
    icon?: string | null
    color?: string | null
}

export interface UpdateCategoryInput {
    name?: string
    spending_group_id?: string | null
    icon?: string | null
    color?: string | null
}

export interface CreateWalletInput {
    name: string
    type: 'payment' | 'tracking'
    opening_balance?: number
}

export interface UpdateWalletInput {
    name?: string
    type?: 'payment' | 'tracking'
    opening_balance?: number
}