import { useHabitStore } from '@/stores/habitStore';

export function WeeklyProgressBars() {
  const { getWeeklyProgress } = useHabitStore();
  const weeklyProgress = getWeeklyProgress();

  if (weeklyProgress.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="font-semibold mb-4">Weekly Progress</h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          No data available
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h3 className="font-semibold mb-4">Weekly Progress</h3>
      <div className="flex gap-3 items-end justify-center h-32">
        {weeklyProgress.map(({ week, progress }) => (
          <div key={week} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full bg-muted rounded-t-md relative" style={{ height: '80px' }}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all duration-300"
                style={{ height: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            <span className="text-xs font-medium">Week {week}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
