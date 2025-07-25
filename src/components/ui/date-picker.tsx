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
          className="p-3"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
          components={{
            IconLeft: ({ ...props }) => (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
                <path d="m8.842 3.135.308.308-3.233 3.232 3.233 3.232-.308.308-3.54-3.54 3.54-3.54Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            ),
            IconRight: ({ ...props }) => (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
                <path d="m6.158 3.135 3.54 3.54-3.54 3.54-.308-.308 3.233-3.232-3.233-3.232.308-.308Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            ),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
