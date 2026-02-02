import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useHabitStore } from '@/stores/habitStore';
import { getMonthDays } from '@/utils/helpers';
import { format } from 'date-fns';

export function ProgressAreaChart() {
  const { habits, entries, selectedMonth } = useHabitStore();
  const activeHabits = habits.filter(h => h.active);
  
  const chartData = useMemo(() => {
    const days = getMonthDays(selectedMonth);
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayEntries = entries.filter(e => e.date === dateStr);
      const completion = activeHabits.length > 0
        ? (dayEntries.length / activeHabits.length) * 100
        : 0;
      
      return {
        date: format(day, 'd'),
        fullDate: format(day, 'MMM d'),
        completion: Math.round(completion),
      };
    });
  }, [selectedMonth, entries, activeHabits]);

  if (activeHabits.length === 0) {
    return (
      <div className="dashboard-card h-64">
        <h3 className="font-semibold mb-4">Global Progress</h3>
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Add habits to see your progress
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h3 className="font-semibold mb-4">Global Progress</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => `${v}%`}
              width={35}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md">
                      <p className="text-sm font-medium">{payload[0].payload.fullDate}</p>
                      <p className="text-sm text-muted-foreground">
                        Completion: {payload[0].value}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="completion"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#progressGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
