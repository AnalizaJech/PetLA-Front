import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecciona una fecha",
  disabled = false,
  className,
  fromYear = 1990,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 py-2 text-sm border-input bg-background hover:bg-accent hover:text-accent-foreground",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {date ? (
              format(date, "dd/MM/yyyy", { locale: es })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border bg-background"
        align="start"
        sideOffset={4}
      >
        <DayPicker
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange?.(selectedDate);
            setOpen(false);
          }}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          locale={es}
          fromYear={fromYear}
          toYear={toYear}
          captionLayout="dropdown-buttons"
          showOutsideDays={false}
          fixedWeeks={true}
          className="p-3"
          styles={{
            caption: { display: 'flex', justifyContent: 'center', padding: '0.5rem 0', position: 'relative' },
            nav: { display: 'flex', gap: '0.25rem' },
            nav_button: {
              position: 'absolute',
              height: '1.75rem',
              width: '1.75rem',
              background: 'transparent',
              opacity: 0.5,
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            },
            nav_button_previous: { left: '0.25rem' },
            nav_button_next: { right: '0.25rem' },
            table: { width: '100%', borderCollapse: 'collapse' },
            head_row: { display: 'flex' },
            head_cell: {
              color: 'hsl(var(--muted-foreground))',
              borderRadius: '0.375rem',
              width: '2.25rem',
              fontWeight: 'normal',
              fontSize: '0.8rem'
            },
            row: { display: 'flex', width: '100%', marginTop: '0.5rem' },
            cell: {
              height: '2.25rem',
              width: '2.25rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              position: 'relative'
            },
            day: {
              height: '2.25rem',
              width: '2.25rem',
              fontWeight: 'normal',
              border: 'none',
              background: 'transparent',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            },
            day_selected: {
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))'
            },
            day_today: {
              backgroundColor: 'hsl(var(--accent))',
              color: 'hsl(var(--accent-foreground))'
            },
            day_outside: {
              color: 'hsl(var(--muted-foreground))',
              opacity: 0.5
            },
            day_disabled: {
              color: 'hsl(var(--muted-foreground))',
              opacity: 0.5,
              cursor: 'not-allowed'
            }
          }}
          components={{
            IconLeft: () => (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m8.842 3.135.308.308-3.233 3.232 3.233 3.232-.308.308-3.54-3.54 3.54-3.54Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            ),
            IconRight: () => (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.158 3.135 3.54 3.54-3.54 3.54-.308-.308 3.233-3.232-3.233-3.232.308-.308Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            ),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
