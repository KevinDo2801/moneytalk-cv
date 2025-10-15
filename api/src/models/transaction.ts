export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note?: string | null;
  date: string;
  created_at: string;
}

export interface CreateTransactionRequest {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note?: string;
  date?: string;
}

export interface UpdateTransactionRequest {
  type?: 'income' | 'expense';
  category?: string;
  amount?: number;
  note?: string;
  date?: string;
}

export interface TransactionQueryParams {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
