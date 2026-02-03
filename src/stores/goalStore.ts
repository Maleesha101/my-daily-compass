import { create } from 'zustand';
import { db, generateId, type Goal } from '@/db/database';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  
  loadGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'current'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalProgress: (id: string, current: number) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,

  loadGoals: async () => {
    set({ isLoading: true });
    try {
      const goals = await db.goals.toArray();
      set({ goals });
    } finally {
      set({ isLoading: false });
    }
  },

  addGoal: async (goalData) => {
    const newGoal: Goal = {
      ...goalData,
      id: generateId(),
      current: 0,
      trackingType: goalData.trackingType || 'cumulative',
      createdAt: new Date().toISOString(),
    };
    
    await db.goals.add(newGoal);
    set({ goals: [...get().goals, newGoal] });
  },

  updateGoal: async (id, updates) => {
    await db.goals.update(id, updates);
    set({
      goals: get().goals.map(g => g.id === id ? { ...g, ...updates } : g),
    });
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id);
    set({ goals: get().goals.filter(g => g.id !== id) });
  },

  updateGoalProgress: async (id, current) => {
    const goal = get().goals.find(g => g.id === id);
    if (!goal) return;

    const status = current >= goal.target ? 'completed' : 'active';
    await db.goals.update(id, { current, status });
    set({
      goals: get().goals.map(g => g.id === id ? { ...g, current, status } : g),
    });
  },
}));
