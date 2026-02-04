import { create } from 'zustand';
import { db, generateId, type Habit, type HabitEntry } from '@/db/database';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getWeek, parseISO } from 'date-fns';

interface HabitState {
  habits: Habit[];
  entries: HabitEntry[];
  isLoading: boolean;
  selectedMonth: Date;
  
  // Actions
  loadHabits: () => Promise<void>;
  loadEntriesForMonth: (date: Date) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'order'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitEntry: (habitId: string, date: string) => Promise<void>;
  setNumericEntry: (habitId: string, date: string, value: number) => Promise<void>;
  setSelectedMonth: (date: Date) => void;
  
  // Computed
  getHabitProgress: (habitId: string) => number;
  getDayCompletion: (date: string) => number;
  getWeeklyProgress: () => { week: number; progress: number }[];
  getMonthlyProgress: () => number;
  getTopHabits: (limit?: number) => { habit: Habit; progress: number }[];
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  entries: [],
  isLoading: false,
  selectedMonth: new Date(),

  loadHabits: async () => {
    set({ isLoading: true });
    try {
      const habits = await db.habits.orderBy('order').toArray();
      set({ habits });
    } finally {
      set({ isLoading: false });
    }
  },

  loadEntriesForMonth: async (date: Date) => {
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');
    
    const entries = await db.habitEntries
      .where('date')
      .between(start, end, true, true)
      .toArray();
    
    set({ entries });
  },

  addHabit: async (habitData) => {
    const habits = get().habits;
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      period: habitData.period || 'monthly',
      createdAt: new Date().toISOString(),
      order: habits.length,
    };
    
    await db.habits.add(newHabit);
    set({ habits: [...habits, newHabit] });
  },

  updateHabit: async (id, updates) => {
    await db.habits.update(id, updates);
    set({
      habits: get().habits.map(h => h.id === id ? { ...h, ...updates } : h),
    });
  },

  deleteHabit: async (id) => {
    await db.habits.delete(id);
    await db.habitEntries.where('habitId').equals(id).delete();
    set({ habits: get().habits.filter(h => h.id !== id) });
  },

  toggleHabitEntry: async (habitId, date) => {
    const existing = get().entries.find(e => e.habitId === habitId && e.date === date);
    
    if (existing) {
      await db.habitEntries.delete(existing.id);
      set({ entries: get().entries.filter(e => e.id !== existing.id) });
    } else {
      const newEntry: HabitEntry = {
        id: generateId(),
        habitId,
        date,
        value: 1,
        createdAt: new Date().toISOString(),
      };
      await db.habitEntries.add(newEntry);
      set({ entries: [...get().entries, newEntry] });
    }
  },

  setNumericEntry: async (habitId, date, value) => {
    const existing = get().entries.find(e => e.habitId === habitId && e.date === date);
    
    if (existing) {
      if (value === 0) {
        await db.habitEntries.delete(existing.id);
        set({ entries: get().entries.filter(e => e.id !== existing.id) });
      } else {
        await db.habitEntries.update(existing.id, { value });
        set({
          entries: get().entries.map(e => e.id === existing.id ? { ...e, value } : e),
        });
      }
    } else if (value > 0) {
      const newEntry: HabitEntry = {
        id: generateId(),
        habitId,
        date,
        value,
        createdAt: new Date().toISOString(),
      };
      await db.habitEntries.add(newEntry);
      set({ entries: [...get().entries, newEntry] });
    }
  },

  setSelectedMonth: (date) => {
    set({ selectedMonth: date });
    get().loadEntriesForMonth(date);
  },

  getHabitProgress: (habitId) => {
    const { entries, habits, selectedMonth } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    const habitEntries = entries.filter(e => e.habitId === habitId);
    const completedDays = habitEntries.length;
    
    return Math.min((completedDays / habit.goalValue) * 100, 100);
  },

  getDayCompletion: (date) => {
    const { entries, habits } = get();
    const activeHabits = habits.filter(h => h.active);
    if (activeHabits.length === 0) return 0;

    const dayEntries = entries.filter(e => e.date === date);
    return (dayEntries.length / activeHabits.length) * 100;
  },

  getWeeklyProgress: () => {
    const { entries, habits, selectedMonth } = get();
    const activeHabits = habits.filter(h => h.active);
    if (activeHabits.length === 0) return [];

    const days = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth),
    });

    const weekMap = new Map<number, { total: number; completed: number }>();

    days.forEach(day => {
      const weekNum = getWeek(day, { weekStartsOn: 1 });
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayEntries = entries.filter(e => e.date === dateStr);

      if (!weekMap.has(weekNum)) {
        weekMap.set(weekNum, { total: 0, completed: 0 });
      }
      const week = weekMap.get(weekNum)!;
      week.total += activeHabits.length;
      week.completed += dayEntries.length;
    });

    return Array.from(weekMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([week, data], idx) => ({
        week: idx + 1,
        progress: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      }));
  },

  getMonthlyProgress: () => {
    const { entries, habits, selectedMonth } = get();
    const activeHabits = habits.filter(h => h.active);
    if (activeHabits.length === 0) return 0;

    const days = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth),
    });

    const totalPossible = days.length * activeHabits.length;
    const totalCompleted = entries.length;

    return totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
  },

  getTopHabits: (limit = 5) => {
    const { habits } = get();
    const getProgress = get().getHabitProgress;
    
    return habits
      .filter(h => h.active)
      .map(habit => ({ habit, progress: getProgress(habit.id) }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit);
  },
}));
