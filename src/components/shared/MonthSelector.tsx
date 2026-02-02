import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { navigateMonth } from '@/utils/helpers';

interface MonthSelectorProps {
  currentMonth: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ currentMonth, onChange }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(navigateMonth(currentMonth, 'prev'))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[140px] text-center">
        <span className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(navigateMonth(currentMonth, 'next'))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
