import { useEffect } from 'react';
import { useHabitStore } from '@/stores/habitStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { MonthSelector } from '@/components/shared/MonthSelector';
import { ProgressAreaChart } from '@/components/dashboard/ProgressAreaChart';
import { DailyCompletionRing } from '@/components/dashboard/DailyCompletionRing';
import { TopHabits } from '@/components/dashboard/TopHabits';
import { WeeklyProgressBars } from '@/components/dashboard/WeeklyProgressBars';
import { HabitMatrix } from '@/components/dashboard/HabitMatrix';
import { format } from 'date-fns';

export default function Dashboard() {
  const { selectedMonth, setSelectedMonth, loadHabits, loadEntriesForMonth } = useHabitStore();
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
    loadHabits();
    loadEntriesForMonth(selectedMonth);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {settings?.userName ? `${settings.userName}'s` : 'My'} Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <MonthSelector currentMonth={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="md:col-span-2">
          <ProgressAreaChart />
        </div>
        
        {/* Daily Ring */}
        <div>
          <DailyCompletionRing />
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <WeeklyProgressBars />
        </div>
        <div>
          <TopHabits />
        </div>
      </div>

      {/* Habit Matrix */}
      <HabitMatrix />
    </div>
  );
}
