import { create } from 'zustand';
import { db, generateId, type Stock } from '@/db/database';

interface PortfolioState {
  stocks: Stock[];
  isLoading: boolean;
  
  loadStocks: () => Promise<void>;
  addStock: (stock: Omit<Stock, 'id' | 'createdAt' | 'lastUpdated'>) => Promise<void>;
  updateStock: (id: string, updates: Partial<Stock>) => Promise<void>;
  updateStockPrice: (id: string, currentPrice: number) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;
  
  // Computed
  getTotalInvested: () => number;
  getTotalCurrentValue: () => number;
  getTotalPL: () => number;
  getTotalPLPercent: () => number;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  stocks: [],
  isLoading: false,

  loadStocks: async () => {
    set({ isLoading: true });
    try {
      const stocks = await db.stocks.toArray();
      set({ stocks });
    } finally {
      set({ isLoading: false });
    }
  },

  addStock: async (stockData) => {
    const newStock: Stock = {
      ...stockData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    
    await db.stocks.add(newStock);
    set({ stocks: [...get().stocks, newStock] });
  },

  updateStock: async (id, updates) => {
    const updated = { ...updates, lastUpdated: new Date().toISOString() };
    await db.stocks.update(id, updated);
    set({
      stocks: get().stocks.map(s => s.id === id ? { ...s, ...updated } : s),
    });
  },

  updateStockPrice: async (id, currentPrice) => {
    const lastUpdated = new Date().toISOString();
    await db.stocks.update(id, { currentPrice, lastUpdated });
    set({
      stocks: get().stocks.map(s => s.id === id ? { ...s, currentPrice, lastUpdated } : s),
    });
  },

  deleteStock: async (id) => {
    await db.stocks.delete(id);
    set({ stocks: get().stocks.filter(s => s.id !== id) });
  },

  getTotalInvested: () => {
    return get().stocks.reduce((sum, s) => sum + (s.quantity * s.avgBuyPrice), 0);
  },

  getTotalCurrentValue: () => {
    return get().stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
  },

  getTotalPL: () => {
    const invested = get().getTotalInvested();
    const current = get().getTotalCurrentValue();
    return current - invested;
  },

  getTotalPLPercent: () => {
    const invested = get().getTotalInvested();
    if (invested === 0) return 0;
    const pl = get().getTotalPL();
    return (pl / invested) * 100;
  },
}));
