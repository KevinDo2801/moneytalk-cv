import { supabaseAdmin } from '../config/supabase';
import { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest, 
  TransactionQueryParams 
} from '../models/transaction';

export class TransactionService {
  async createTransaction(data: CreateTransactionRequest, userId: string): Promise<Transaction> {
    if (!userId) {
      throw new Error('User ID is required to create a transaction');
    }

    const insertData = {
      user_id: userId,
      type: data.type,
      category: data.category,
      amount: data.amount,
      note: data.note || null,
      date: data.date || new Date().toISOString().split('T')[0]
    };

    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return transaction;
  }

  async getAllTransactions(userId: string, queryParams: TransactionQueryParams = {}): Promise<Transaction[]> {
    if (!userId) {
      throw new Error('User ID is required to fetch transactions');
    }

    let query = supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId) // Filter by user
      .order('date', { ascending: false });

    // Apply filters
    if (queryParams.type) {
      query = query.eq('type', queryParams.type);
    }

    if (queryParams.category) {
      query = query.eq('category', queryParams.category);
    }

    if (queryParams.startDate) {
      query = query.gte('date', queryParams.startDate);
    }

    if (queryParams.endDate) {
      query = query.lte('date', queryParams.endDate);
    }

    // Apply pagination
    if (queryParams.limit) {
      query = query.limit(queryParams.limit);
    }

    if (queryParams.offset) {
      query = query.range(queryParams.offset, queryParams.offset + (queryParams.limit || 10) - 1);
    }

    const { data: transactions, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return transactions || [];
  }

  async getTransactionById(id: string, userId: string): Promise<Transaction> {
    if (!userId) {
      throw new Error('User ID is required to fetch transaction');
    }

    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only access their own transaction
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Transaction not found');
      }
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }

    return transaction;
  }

  async updateTransaction(id: string, data: UpdateTransactionRequest, userId: string): Promise<Transaction> {
    if (!userId) {
      throw new Error('User ID is required to update transaction');
    }

    const updateData: any = {};
    
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.date !== undefined) updateData.date = data.date;

    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own transaction
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Transaction not found');
      }
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return transaction;
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to delete transaction');
    }

    const { error } = await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only delete their own transaction

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Transaction not found');
      }
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }

  // Helper method to calculate date range from parameters
  private calculateDateRange(params: {
    days?: number;
    weeks?: number;
    months?: number;
    years?: number;
    period?: string;
    startDate?: string;
    endDate?: string;
  }): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now.toISOString().split('T')[0]); // Today

    // Custom date range takes priority
    if (params.startDate && params.endDate) {
      return {
        startDate: params.startDate,
        endDate: params.endDate
      };
    }

    // Calculate relative date range
    if (params.days) {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - params.days);
    } else if (params.weeks) {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (params.weeks * 7));
    } else if (params.months) {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - params.months);
    } else if (params.years) {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - params.years);
    } else if (params.period) {
      startDate = new Date(now);
      switch (params.period) {
        case 'day':
          // Just today
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30); // Default to 30 days
      }
    } else {
      // Default to last 30 days
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  async getSpendingAnalysis(userId: string, params: {
    days?: number;
    weeks?: number;
    months?: number;
    years?: number;
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    if (!userId) {
      throw new Error('User ID is required for spending analysis');
    }

    const { startDate, endDate } = this.calculateDateRange(params);

    // Get all transactions in the date range
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch transactions for analysis: ${error.message}`);
    }

    const allTransactions = transactions || [];

    // Calculate totals
    const totalExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown: { [key: string]: { total: number; count: number; transactions: Transaction[] } } = {};
    
    allTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!categoryBreakdown[t.category]) {
          categoryBreakdown[t.category] = { total: 0, count: 0, transactions: [] };
        }
        categoryBreakdown[t.category].total += t.amount;
        categoryBreakdown[t.category].count += 1;
        categoryBreakdown[t.category].transactions.push(t);
      });

    // Top categories
    const topCategories = Object.entries(categoryBreakdown)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Daily trend (last 7 days of the period)
    const dailyTrend: { [key: string]: { expenses: number; income: number } } = {};
    allTransactions.forEach(t => {
      if (!dailyTrend[t.date]) {
        dailyTrend[t.date] = { expenses: 0, income: 0 };
      }
      if (t.type === 'expense') {
        dailyTrend[t.date].expenses += t.amount;
      } else {
        dailyTrend[t.date].income += t.amount;
      }
    });

    // Recent transactions (last 10)
    const recentTransactions = allTransactions.slice(0, 10);

    return {
      success: true,
      period: { startDate, endDate },
      summary: {
        totalExpenses,
        totalIncome,
        netAmount: totalIncome - totalExpenses,
        transactionCount: allTransactions.length
      },
      topCategories,
      dailyTrend: Object.entries(dailyTrend)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      recentTransactions
    };
  }

  async getSpendingSummary(userId: string, params: {
    days?: number;
    weeks?: number;
    months?: number;
    years?: number;
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    if (!userId) {
      throw new Error('User ID is required for spending summary');
    }

    const { startDate, endDate } = this.calculateDateRange(params);

    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      throw new Error(`Failed to fetch transactions for summary: ${error.message}`);
    }

    const allTransactions = transactions || [];

    const totalExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      success: true,
      period: { startDate, endDate },
      totalExpenses,
      totalIncome,
      netAmount: totalIncome - totalExpenses,
      transactionCount: allTransactions.length
    };
  }

  async getCategoryAnalysis(userId: string, params: {
    days?: number;
    weeks?: number;
    months?: number;
    years?: number;
    period?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  }) {
    if (!userId) {
      throw new Error('User ID is required for category analysis');
    }

    const { startDate, endDate } = this.calculateDateRange(params);

    let query = supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    // Filter by specific category if provided
    if (params.category) {
      query = query.eq('category', params.category);
    }

    const { data: transactions, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch transactions for category analysis: ${error.message}`);
    }

    const allTransactions = transactions || [];

    const totalExpenses = allTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown: { [key: string]: { total: number; count: number; transactions: Transaction[] } } = {};
    
    allTransactions.forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { total: 0, count: 0, transactions: [] };
      }
      categoryBreakdown[t.category].total += t.amount;
      categoryBreakdown[t.category].count += 1;
      categoryBreakdown[t.category].transactions.push(t);
    });

    const categories = Object.entries(categoryBreakdown)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
        averagePerTransaction: data.count > 0 ? data.total / data.count : 0,
        transactions: data.transactions.sort((a, b) => b.date.localeCompare(a.date))
      }))
      .sort((a, b) => b.total - a.total);

    return {
      success: true,
      period: { startDate, endDate },
      totalExpenses,
      categoryCount: categories.length,
      categories,
      filteredBy: params.category || null
    };
  }
}
