import { create } from 'zustand';
import { db, initializeSettings, type AppSettings } from '@/db/database';

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await initializeSettings();
      set({ settings });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    const current = get().settings;
    if (!current) return;

    const updated = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await db.settings.update(current.id, updated);
    set({ settings: { ...current, ...updated } });
  },

  exportData: async () => {
    const [habits, habitEntries, goals, stocks, transactions, settings] = await Promise.all([
      db.habits.toArray(),
      db.habitEntries.toArray(),
      db.goals.toArray(),
      db.stocks.toArray(),
      db.transactions.toArray(),
      db.settings.toArray(),
    ]);

    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        habits,
        habitEntries,
        goals,
        stocks,
        transactions,
        settings,
      },
    };

    return JSON.stringify(exportData, null, 2);
  },

  importData: async (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      
      if (!parsed.version || !parsed.data) {
        throw new Error('Invalid backup file format');
      }

      const { habits, habitEntries, goals, stocks, transactions, settings } = parsed.data;

      // Clear existing data
      await Promise.all([
        db.habits.clear(),
        db.habitEntries.clear(),
        db.goals.clear(),
        db.stocks.clear(),
        db.transactions.clear(),
        db.settings.clear(),
      ]);

      // Import new data
      await Promise.all([
        habits?.length && db.habits.bulkAdd(habits),
        habitEntries?.length && db.habitEntries.bulkAdd(habitEntries),
        goals?.length && db.goals.bulkAdd(goals),
        stocks?.length && db.stocks.bulkAdd(stocks),
        transactions?.length && db.transactions.bulkAdd(transactions),
        settings?.length && db.settings.bulkAdd(settings),
      ]);

      // Reload settings
      await get().loadSettings();
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
}));
