import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Transaction, TransactionCategory, ChartData, FinancialData, TimeFilter } from '../types/financial';

interface UseFinancialDataReturn {
  data: {
    expenses: FinancialData;
    income: FinancialData;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const EXPENSE_CATEGORIES: TransactionCategory[] = [
  { id: '1', name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B', percentage: 0, amount: 0 },
  { id: '2', name: 'Transportation', icon: '🚗', color: '#4ECDC4', percentage: 0, amount: 0 },
  { id: '3', name: 'Shopping', icon: '🛍️', color: '#45B7D1', percentage: 0, amount: 0 },
  { id: '4', name: 'Entertainment', icon: '🎬', color: '#96CEB4', percentage: 0, amount: 0 },
  { id: '5', name: 'Bills & Utilities', icon: '💡', color: '#FFEAA7', percentage: 0, amount: 0 },
  { id: '6', name: 'Healthcare', icon: '🏥', color: '#DDA0DD', percentage: 0, amount: 0 },
  { id: '7', name: 'Other', icon: '📝', color: '#98D8C8', percentage: 0, amount: 0 },
];

const INCOME_CATEGORIES: TransactionCategory[] = [
  { id: '1', name: 'Salary', icon: '💰', color: '#2ECC71', percentage: 0, amount: 0 },
  { id: '2', name: 'Freelance', icon: '💼', color: '#3498DB', percentage: 0, amount: 0 },
  { id: '3', name: 'Investment', icon: '📈', color: '#9B59B6', percentage: 0, amount: 0 },
  { id: '4', name: 'Business', icon: '🏢', color: '#E67E22', percentage: 0, amount: 0 },
  { id: '5', name: 'Other', icon: '📝', color: '#95A5A6', percentage: 0, amount: 0 },
];

const getDateRange = (filter: TimeFilter): { start: Date; end: Date } => {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  switch (filter) {
    case 'day':
      start.setDate(now.getDate());
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    case 'period':
      // For period, we'll use a default of 30 days
      start.setDate(now.getDate() - 30);
      break;
  }

  return { start, end };
};

const processTransactions = (
  transactions: Transaction[],
  predefinedCategories: TransactionCategory[],
  type: 'income' | 'expense'
): { categories: TransactionCategory[]; chartData: ChartData; total: number } => {
  const filteredTransactions = transactions.filter(t => t.type === type);
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Group transactions by category
  const categoryMap = new Map<string, { amount: number; count: number }>();
  
  filteredTransactions.forEach(transaction => {
    const existing = categoryMap.get(transaction.category) || { amount: 0, count: 0 };
    categoryMap.set(transaction.category, {
      amount: existing.amount + transaction.amount,
      count: existing.count + 1
    });
  });

  // Create categories dynamically from actual transaction data
  const updatedCategories: TransactionCategory[] = [];
  
  // First, add predefined categories that have data
  predefinedCategories.forEach(category => {
    const data = categoryMap.get(category.name);
    if (data && data.amount > 0) {
      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
      updatedCategories.push({
        ...category,
        amount: data.amount,
        percentage: Math.round(percentage * 100) / 100
      });
    }
  });

  // Then, add any categories from transactions that aren't in predefined list
  const predefinedNames = new Set(predefinedCategories.map(c => c.name));
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FF9F43', '#6C5CE7', '#A29BFE'];
  const icons = ['🍽️', '🚗', '🛍️', '🎬', '💡', '🏥', '📝', '☕', '💼', '🎯'];
  
  let colorIndex = 0;
  let iconIndex = 0;

  categoryMap.forEach((data, categoryName) => {
    if (!predefinedNames.has(categoryName) && data.amount > 0) {
      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
      updatedCategories.push({
        id: `dynamic-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
        name: categoryName,
        icon: icons[iconIndex % icons.length],
        color: colors[colorIndex % colors.length],
        amount: data.amount,
        percentage: Math.round(percentage * 100) / 100
      });
      colorIndex++;
      iconIndex++;
    }
  });

  // Sort by amount descending
  updatedCategories.sort((a, b) => b.amount - a.amount);

  // Create chart data
  const chartData: ChartData = {
    labels: updatedCategories.map(c => c.name),
    datasets: [{
      data: updatedCategories.map(c => c.amount),
      backgroundColor: updatedCategories.map(c => c.color),
      borderWidth: 0,
      cutout: '70%',
    }],
  };

  return { categories: updatedCategories, chartData, total };
};

export const useFinancialData = (timeFilter: TimeFilter = 'month'): UseFinancialDataReturn => {
  const { user } = useAuth();
  const [data, setData] = useState<{ expenses: FinancialData; income: FinancialData }>({
    expenses: {
      balance: 0,
      total: 0,
      categories: EXPENSE_CATEGORIES,
      chartData: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, cutout: '70%' }] },
    },
    income: {
      balance: 0,
      total: 0,
      categories: INCOME_CATEGORIES,
      chartData: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, cutout: '70%' }] },
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setData({
        expenses: {
          balance: 0,
          total: 0,
          categories: EXPENSE_CATEGORIES,
          chartData: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, cutout: '70%' }] },
        },
        income: {
          balance: 0,
          total: 0,
          categories: INCOME_CATEGORIES,
          chartData: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, cutout: '70%' }] },
        },
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange(timeFilter);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      const transactionsList = transactions as Transaction[];

      // Process expenses
      const expenseData = processTransactions(transactionsList, EXPENSE_CATEGORIES, 'expense');
      
      // Process income
      const incomeData = processTransactions(transactionsList, INCOME_CATEGORIES, 'income');

      // Calculate balance (income - expenses)
      const balance = incomeData.total - expenseData.total;

      setData({
        expenses: {
          balance,
          total: expenseData.total,
          categories: expenseData.categories,
          chartData: expenseData.chartData,
        },
        income: {
          balance,
          total: incomeData.total,
          categories: incomeData.categories,
          chartData: incomeData.chartData,
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial data';
      setError(errorMessage);
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, timeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
