import { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useHabitStore } from '@/stores/habitStore';
import { getMonthDays } from '@/utils/helpers';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function HabitMatrix() {
  const { habits, entries, selectedMonth, toggleHabitEntry } = useHabitStore();
  const activeHabits = habits.filter(h => h.active);
  
  const days = useMemo(() => getMonthDays(selectedMonth), [selectedMonth]);
  
  // Group days by week for display
  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    
    // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = days[0].getDay();
    // Adjust for Monday start (0 = Monday)
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Add empty cells for days before the first
    for (let i = 0; i < mondayOffset; i++) {
      currentWeek.push(null);
    }
    
    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Push remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      result.push(currentWeek);
    }
    
    return result;
  }, [days]);

  const isCompleted = (habitId: string, date: string) => {
    return entries.some(e => e.habitId === habitId && e.date === date);
  };

  const handleToggle = (habitId: string, date: string) => {
    toggleHabitEntry(habitId, date);
  };

  const getHabitProgress = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    const completed = entries.filter(e => e.habitId === habitId).length;
    return Math.round((completed / habit.goalValue) * 100);
  };

  if (activeHabits.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="font-semibold mb-4">Daily Habits</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No active habits. Add some habits to start tracking!
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-card overflow-x-auto">
      <h3 className="font-semibold mb-4">Daily Habits</h3>
      
      <div className="min-w-[600px]">
        {/* Week headers */}
        <div className="flex gap-4 mb-2">
          <div className="w-32 shrink-0" />
          <div className="w-12 text-center text-xs font-medium text-muted-foreground shrink-0">Goal</div>
          {weeks.map((_, weekIdx) => (
            <div
              key={weekIdx}
              className="flex-1 text-center text-xs font-medium text-muted-foreground"
            >
              Week {weekIdx + 1}
            </div>
          ))}
          <div className="w-20 text-center text-xs font-medium text-muted-foreground shrink-0">Progress</div>
        </div>

        {/* Day of week headers */}
        <div className="flex gap-4 mb-1">
          <div className="w-32 shrink-0" />
          <div className="w-12 shrink-0" />
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex-1 flex gap-0.5 justify-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div
                  key={i}
                  className="w-5 text-center text-[10px] text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>
          ))}
          <div className="w-20 shrink-0" />
        </div>

        {/* Habit rows */}
        {activeHabits.map((habit) => {
          const progress = getHabitProgress(habit.id);
          const completed = entries.filter(e => e.habitId === habit.id).length;
          
          return (
            <div key={habit.id} className="flex gap-4 items-center py-1">
              {/* Habit name */}
              <div className="w-32 shrink-0 text-sm font-medium truncate" title={habit.name}>
                {habit.name}
              </div>
              
              {/* Goal */}
              <div className="w-12 text-center text-sm text-muted-foreground shrink-0">
                {habit.goalValue}
              </div>
              
              {/* Week grids */}
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex-1 flex gap-0.5 justify-center">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return <div key={dayIdx} className="w-5 h-5" />;
                    }
                    
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const done = isCompleted(habit.id, dateStr);
                    const today = isToday(day);
                    
                    return (
                      <Tooltip key={dayIdx}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleToggle(habit.id, dateStr)}
                            className={cn(
                              'habit-cell',
                              done ? 'habit-cell-complete' : 'habit-cell-empty',
                              today && 'ring-2 ring-primary ring-offset-1'
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(day, 'EEE, MMM d')}</p>
                          <p className="text-xs text-muted-foreground">
                            {done ? 'Completed' : 'Not completed'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
              
              {/* Progress */}
              <div className="w-20 shrink-0 flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
