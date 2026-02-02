import Dexie, { type EntityTable } from 'dexie';

// Type definitions
export interface Habit {
  id: string;
  name: string;
  category: 'Health' | 'Learning' | 'Finance' | 'Productivity' | 'Personal';
  goalValue: number; // Target days per month
  type: 'boolean' | 'numeric';
  unit?: string; // For numeric habits (e.g., "glasses", "minutes")
  active: boolean;
  createdAt: string;
  order: number;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number; // 1 for boolean, actual value for numeric
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  type: 'habit' | 'finance' | 'portfolio';
  referenceId?: string; // Link to habit, category, or portfolio
  target: number;
  current: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'failed';
  createdAt: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  lastUpdated: string;
  createdAt: string;
}

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface AppSettings {
  id: string;
  userName: string;
  currency: 'LKR';
  monthStartDay: number; // 1-28
  createdAt: string;
  updatedAt: string;
}

// Database class
class TrackerDatabase extends Dexie {
  habits!: EntityTable<Habit, 'id'>;
  habitEntries!: EntityTable<HabitEntry, 'id'>;
  goals!: EntityTable<Goal, 'id'>;
  stocks!: EntityTable<Stock, 'id'>;
  transactions!: EntityTable<FinanceTransaction, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('PersonalTrackerDB');
    
    this.version(1).stores({
      habits: 'id, category, active, order',
      habitEntries: 'id, habitId, date, [habitId+date]',
      goals: 'id, type, status, referenceId',
      stocks: 'id, symbol',
      transactions: 'id, type, category, date',
      settings: 'id',
    });
  }
}

export const db = new TrackerDatabase();

// Helper to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Default categories
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Bills',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Refund',
  'Other',
];

export const HABIT_CATEGORIES: Habit['category'][] = [
  'Health',
  'Learning',
  'Finance',
  'Productivity',
  'Personal',
];

// Initialize default settings
export const initializeSettings = async (): Promise<AppSettings> => {
  const existing = await db.settings.toArray();
  if (existing.length > 0) {
    return existing[0];
  }

  const defaultSettings: AppSettings = {
    id: 'default',
    userName: 'User',
    currency: 'LKR',
    monthStartDay: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.settings.add(defaultSettings);
  return defaultSettings;
};
