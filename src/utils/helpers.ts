import { format, parse, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth } from 'date-fns';

// Format currency in LKR
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format percentage
export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Get days in month for habit grid
export const getMonthDays = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

// Group days by week
export const groupDaysByWeek = (days: Date[]) => {
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  days.forEach((day, index) => {
    const dayOfWeek = getDay(day); // 0 = Sunday
    
    if (index === 0) {
      // Add empty slots for days before the first day
      for (let i = 0; i < (dayOfWeek === 0 ? 6 : dayOfWeek - 1); i++) {
        currentWeek.push(null as any);
      }
    }
    
    currentWeek.push(day);
    
    // Start new week on Monday (or when we have 7 days)
    if (dayOfWeek === 0 || currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // Push remaining days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  
  return weeks;
};

// Calculate color intensity based on completion percentage
export const getCompletionColor = (percentage: number): string => {
  if (percentage === 0) return 'bg-habit-empty';
  if (percentage < 50) return 'bg-habit-partial';
  return 'bg-habit-complete';
};

// Calculate P&L color
export const getPLColor = (value: number): string => {
  if (value > 0) return 'text-success';
  if (value < 0) return 'text-destructive';
  return 'text-muted-foreground';
};

// Format date for display
export const formatDisplayDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
};

// Parse date string
export const parseDate = (dateStr: string): Date => {
  return parse(dateStr, 'yyyy-MM-dd', new Date());
};

// Navigate months
export const navigateMonth = (current: Date, direction: 'prev' | 'next'): Date => {
  return direction === 'next' ? addMonths(current, 1) : subMonths(current, 1);
};

// Check if date is today
export const checkIsToday = (date: Date): boolean => {
  return isToday(date);
};

// Check if date is in current month
export const checkIsSameMonth = (date1: Date, date2: Date): boolean => {
  return isSameMonth(date1, date2);
};

// Generate a color for charts based on index
export const getChartColor = (index: number): string => {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  return colors[index % colors.length];
};

// Truncate text
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Download file helper
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
