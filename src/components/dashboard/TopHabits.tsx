import { useHabitStore } from '@/stores/habitStore';

export function TopHabits() {
  const { getTopHabits } = useHabitStore();
  const topHabits = getTopHabits(5);

  if (topHabits.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="font-semibold mb-4">Top 5 Daily Habits</h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          No habits yet
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h3 className="font-semibold mb-4">Top 5 Daily Habits</h3>
      <div className="space-y-2">
        {topHabits.map(({ habit, progress }, index) => (
          <div key={habit.id} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
              {index + 1}
            </span>
            <span className="flex-1 text-sm truncate">{habit.name}</span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
