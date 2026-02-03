import { create } from 'zustand';
import { db, generateId, type Stock } from '@/db/database';

interface PortfolioState {
  stocks: Stock[];
  isLoading: boolean;
  
  loadStocks: () => Promise<void>;
  addStock: (stock: Omit<Stock, 'id' | 'createdAt' | 'lastUpdated'>) => Promise<void>;
  averageStock: (id: string, quantity: number, buyPrice: number) => Promise<void>;
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

  averageStock: async (id, quantity, buyPrice) => {
    const stock = get().stocks.find(s => s.id === id);
    if (!stock) return;
    
    // Calculate new average: (old_qty * old_avg + new_qty * new_price) / total_qty
    const totalQty = stock.quantity + quantity;
    const totalInvested = (stock.quantity * stock.avgBuyPrice) + (quantity * buyPrice);
    const newAvgPrice = totalInvested / totalQty;
    
    const updates = {
      quantity: totalQty,
      avgBuyPrice: newAvgPrice,
      lastUpdated: new Date().toISOString(),
    };
    
    await db.stocks.update(id, updates);
    set({
      stocks: get().stocks.map(s => s.id === id ? { ...s, ...updates } : s),
    });
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
