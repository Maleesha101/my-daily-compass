import { create } from 'zustand';
import { db, generateId, type FinanceTransaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/db/database';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface FinanceState {
  transactions: FinanceTransaction[];
  isLoading: boolean;
  selectedMonth: Date;
  
  loadTransactionsForMonth: (date: Date) => Promise<void>;
  addTransaction: (transaction: Omit<FinanceTransaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<FinanceTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setSelectedMonth: (date: Date) => void;
  
  // Computed
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetSavings: () => number;
  getCategoryTotals: (type: 'income' | 'expense') => { category: string; total: number }[];
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  isLoading: false,
  selectedMonth: new Date(),

  loadTransactionsForMonth: async (date: Date) => {
    set({ isLoading: true });
    try {
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');
      
      const transactions = await db.transactions
        .where('date')
        .between(start, end, true, true)
        .toArray();
      
      set({ transactions });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transactionData) => {
    const newTransaction: FinanceTransaction = {
      ...transactionData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    await db.transactions.add(newTransaction);
    set({ transactions: [...get().transactions, newTransaction] });
  },

  updateTransaction: async (id, updates) => {
    await db.transactions.update(id, updates);
    set({
      transactions: get().transactions.map(t => t.id === id ? { ...t, ...updates } : t),
    });
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    set({ transactions: get().transactions.filter(t => t.id !== id) });
  },

  setSelectedMonth: (date) => {
    set({ selectedMonth: date });
    get().loadTransactionsForMonth(date);
  },

  getTotalIncome: () => {
    return get().transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalExpenses: () => {
    return get().transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getNetSavings: () => {
    return get().getTotalIncome() - get().getTotalExpenses();
  },

  getCategoryTotals: (type) => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const filtered = get().transactions.filter(t => t.type === type);
    
    return categories.map(category => ({
      category,
      total: filtered
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0),
    })).filter(c => c.total > 0);
  },
}));
