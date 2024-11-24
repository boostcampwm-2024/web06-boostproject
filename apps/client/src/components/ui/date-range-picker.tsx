import * as React from 'react';
import { addDays, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onChange?: (date: DateRange) => void;
}

export function DateRangePicker({ className, date, onChange }: DateRangePickerProps) {
  const [dateState, setDateState] = React.useState<DateRange | undefined>(
    date || {
      from: new Date(),
      to: addDays(new Date(), 7),
    }
  );

  const handleSelect = (newDate: DateRange | undefined) => {
    setDateState(newDate);
    if (onChange && newDate?.from && newDate?.to) {
      onChange(newDate);
    }
  };

  React.useEffect(() => {
    if (date) {
      setDateState(date);
    }
  }, [date]);

  const getDateRangeText = () => {
    if (!dateState?.from) {
      return <span>Pick a date</span>;
    }

    if (dateState.to) {
      return (
        <>
          {format(dateState.from, 'LLL dd, y')} - {format(dateState.to, 'LLL dd, y')}
        </>
      );
    }

    return format(dateState.from, 'LLL dd, y');
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn('w-[300px] justify-start text-left font-normal', !dateState && '')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDateRangeText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-surface w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateState?.from}
            selected={dateState}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
