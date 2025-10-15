export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note?: string;
  date: string;
  created_at: string;
  user_id: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  percentage: number;
  amount: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
    cutout: string;
  }[];
}

export interface FinancialData {
  balance: number;
  total: number;
  categories: TransactionCategory[];
  chartData: ChartData;
}

export type TabType = 'expenses' | 'income';

export type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'period';

export interface TimeFilterOption {
  value: TimeFilter;
  label: string;
}

export const TIME_FILTERS: TimeFilterOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'period', label: 'Period' },
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [];

export const INCOME_CATEGORIES: TransactionCategory[] = [];

export const EXPENSE_CHART_DATA: ChartData = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: [],
    borderWidth: 0,
    cutout: '70%',
  }],
};

export const INCOME_CHART_DATA: ChartData = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: [],
    borderWidth: 0,
    cutout: '70%',
  }],
};
