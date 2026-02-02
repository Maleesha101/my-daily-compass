import { useMemo } from 'react';
import { format } from 'date-fns';
import { useHabitStore } from '@/stores/habitStore';
import { ProgressRing } from '@/components/shared/ProgressRing';

export function DailyCompletionRing() {
  const { habits, entries } = useHabitStore();
  const activeHabits = habits.filter(h => h.active);
  
  const todayStats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntries = entries.filter(e => e.date === today);
    const completed = todayEntries.length;
    const total = activeHabits.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const left = total - completed;
    
    return { completed, total, percentage, left };
  }, [entries, activeHabits]);

  return (
    <div className="dashboard-card">
      <h3 className="font-semibold mb-4">Overview Daily Progress</h3>
      <div className="flex items-center justify-center">
        <ProgressRing
          progress={todayStats.percentage}
          size={140}
          strokeWidth={12}
        />
      </div>
      <div className="flex justify-center gap-8 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">{todayStats.left}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Left</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{todayStats.completed}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Completed</p>
        </div>
      </div>
    </div>
  );
}
