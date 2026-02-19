import { useMemo, useState } from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useHabitStore } from '@/stores/habitStore';
import { getMonthDays } from '@/utils/helpers';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function HabitMatrix() {
  const { habits, entries, selectedMonth, toggleHabitEntry, setNumericEntry } = useHabitStore();

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

  const getEntryValue = (habitId: string, date: string): number => {
    const entry = entries.find(e => e.habitId === habitId && e.date === date);
    return entry?.value || 0;
  };

  const isCompleted = (habitId: string, date: string) => {
    return entries.some(e => e.habitId === habitId && e.date === date);
  };

  const handleToggle = (habitId: string, date: string) => {
    toggleHabitEntry(habitId, date);
  };

  const handleNumericChange = (habitId: string, date: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setNumericEntry(habitId, date, numValue);
  };

  const getHabitProgress = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return { progress: 0, completed: 0, total: 0 };
    
    const habitEntries = entries.filter(e => e.habitId === habitId);
    
    // For numeric daily habits, sum up values
    if (habit.type === 'numeric' && habit.period === 'daily') {
      const totalValue = habitEntries.reduce((sum, e) => sum + e.value, 0);
      const targetTotal = habit.goalValue * days.length;
      return {
        progress: Math.round((totalValue / targetTotal) * 100),
        completed: totalValue,
        total: targetTotal,
      };
    }
    
    // For boolean or other habits, count completions
    const completedDays = habitEntries.length;
    return {
      progress: Math.round((completedDays / habit.goalValue) * 100),
      completed: completedDays,
      total: habit.goalValue,
    };
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
          <div className="w-24 text-center text-xs font-medium text-muted-foreground shrink-0">Progress</div>
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
          <div className="w-24 shrink-0" />
        </div>

        {/* Habit rows */}
        {activeHabits.map((habit) => {
          const { progress, completed, total } = getHabitProgress(habit.id);
          const isNumericDaily = habit.type === 'numeric' && habit.period === 'daily';
          
          return (
            <div key={habit.id} className="flex gap-4 items-center py-1">
              {/* Habit name */}
              <div className="w-32 shrink-0 text-sm font-medium truncate" title={habit.name}>
                {habit.name}
              </div>
              
              {/* Goal */}
              <div className="w-12 text-center text-sm text-muted-foreground shrink-0">
                {isNumericDaily ? `${habit.goalValue}${habit.unit ? `/${habit.unit}` : '/d'}` : habit.goalValue}
              </div>
              
              {/* Week grids */}
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex-1 flex gap-0.5 justify-center">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return <div key={dayIdx} className="w-5 h-5" />;
                    }
                    
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const today = isToday(day);
                    
                    // Numeric daily habits - show value input
                    if (isNumericDaily) {
                      const value = getEntryValue(habit.id, dateStr);
                      const hasValue = value > 0;
                      
                      return (
                        <Popover key={dayIdx}>
                          <PopoverTrigger asChild>
                            <button
                              className={cn(
                                'habit-cell text-[8px] font-medium',
                                hasValue ? 'habit-cell-complete' : 'habit-cell-empty',
                                today && 'ring-2 ring-primary ring-offset-1'
                              )}
                            >
                              {hasValue ? value : ''}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-32 p-2" align="center">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">{format(day, 'EEE, MMM d')}</p>
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                placeholder="0"
                                defaultValue={value || ''}
                                className="h-8 text-sm"
                                onChange={(e) => handleNumericChange(habit.id, dateStr, e.target.value)}
                              />
                              <p className="text-[10px] text-muted-foreground">
                                {habit.unit || 'hours'}
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    }
                    
                    // Boolean habits - show toggle
                    const done = isCompleted(habit.id, dateStr);
                    
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
              <div className="w-24 shrink-0 flex flex-col gap-1">
                <div className="flex items-center gap-2">
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
                {isNumericDaily && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    {completed} / {total} {habit.unit || 'hrs'}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Summary row */}
        <div className="flex gap-4 items-center py-1 mt-2 border-t border-border">
          <div className="w-32 shrink-0 text-xs font-semibold text-muted-foreground">
            Daily Total
          </div>
          <div className="w-12 shrink-0" />
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex-1 flex gap-0.5 justify-center">
              {week.map((day, dayIdx) => {
                if (!day) return <div key={dayIdx} className="w-5 h-5" />;

                const dateStr = format(day, 'yyyy-MM-dd');
                const today = isToday(day);

                // Sum numeric daily habit values + count boolean completions
                const numericSum = activeHabits
                  .filter(h => h.type === 'numeric' && h.period === 'daily')
                  .reduce((sum, h) => sum + getEntryValue(h.id, dateStr), 0);

                const booleanCount = activeHabits
                  .filter(h => !(h.type === 'numeric' && h.period === 'daily'))
                  .filter(h => isCompleted(h.id, dateStr)).length;

                const booleanTotal = activeHabits.filter(
                  h => !(h.type === 'numeric' && h.period === 'daily')
                ).length;

                const hasAnyEntry = numericSum > 0 || booleanCount > 0;

                return (
                  <Tooltip key={dayIdx}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'w-5 h-5 rounded-sm flex items-center justify-center text-[7px] font-bold cursor-default',
                          hasAnyEntry
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted/40 text-muted-foreground',
                          today && 'ring-2 ring-primary ring-offset-1'
                        )}
                      >
                        {booleanCount > 0 || numericSum > 0
                          ? booleanTotal > 0
                            ? booleanCount
                            : ''
                          : ''}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{format(day, 'EEE, MMM d')}</p>
                      {booleanTotal > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {booleanCount}/{booleanTotal} habits done
                        </p>
                      )}
                      {numericSum > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {numericSum} numeric units logged
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
          <div className="w-24 shrink-0">
            {/* Monthly totals */}
            {(() => {
              const totalNumeric = activeHabits
                .filter(h => h.type === 'numeric' && h.period === 'daily')
                .reduce(
                  (sum, h) =>
                    sum + entries.filter(e => e.habitId === h.id).reduce((s, e) => s + e.value, 0),
                  0
                );
              const totalBoolean = activeHabits
                .filter(h => !(h.type === 'numeric' && h.period === 'daily'))
                .reduce(
                  (sum, h) => sum + entries.filter(e => e.habitId === h.id).length,
                  0
                );
              return (
                <div className="text-[10px] text-muted-foreground text-center leading-tight">
                  {totalBoolean > 0 && <div>{totalBoolean} checks</div>}
                  {totalNumeric > 0 && <div>{totalNumeric} units</div>}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
