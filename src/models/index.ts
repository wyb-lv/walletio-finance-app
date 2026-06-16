export type WalletType = 'payment' | 'tracking'
export type TxnDirection = 'in' | 'out'

export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Wallet {
  id: string
  user_id: string
  name: string
  type: WalletType
  opening_balance: number
  is_default: boolean
  created_at: string
}

// view wallet_balances (read-only)
export interface WalletBalance {
  wallet_id: string
  user_id: string
  name: string
  type: WalletType
  opening_balance: number
  balance: number
}

export interface SpendingGroup {
  id: string
  user_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  spending_group_id: string | null
  name: string
  icon: string | null
  color: string | null
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  month: number
  year: number
  total_income: number
  created_at: string
}

export interface BudgetAllocation {
  id: string
  budget_id: string
  category_id: string
  allocated: number
}

export interface Expense {
  id: string
  user_id: string
  wallet_id: string
  category_id: string | null
  budget_id: string | null
  emotion_id: number | null
  direction: TxnDirection
  amount: number
  note: string | null
  expense_date: string
  created_at: string
}

export interface Emotion {
  id: number
  label: string
  emoji_key: string
}