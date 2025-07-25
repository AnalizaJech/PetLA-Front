import * as React from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Registrar el locale español
registerLocale("es", es);

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
  const CustomInput = React.forwardRef<
    HTMLButtonElement,
    { value?: string; onClick?: () => void }
  >(({ value, onClick }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal h-10 px-3 py-2 text-sm border-input bg-background hover:bg-accent hover:text-accent-foreground",
        !value && "text-muted-foreground",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
      <span className="truncate">
        {value || <span className="text-muted-foreground">{placeholder}</span>}
      </span>
    </Button>
  ));

  CustomInput.displayName = "CustomInput";

  return (
    <>
      <style>{`
        .react-datepicker {
          font-family: inherit;
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }

        .react-datepicker__header {
          background: hsl(var(--muted));
          border-bottom: 1px solid hsl(var(--border));
          border-radius: 0.5rem 0.5rem 0 0;
          padding: 0.5rem;
        }

        .react-datepicker__current-month,
        .react-datepicker-time__header,
        .react-datepicker-year-header {
          color: hsl(var(--foreground));
          font-weight: 600;
          font-size: 0.875rem;
        }

        .react-datepicker__day-name {
          color: hsl(var(--muted-foreground));
          font-weight: 500;
          font-size: 0.75rem;
          width: 2rem;
          line-height: 2rem;
        }

        .react-datepicker__day {
          color: hsl(var(--foreground));
          width: 2rem;
          height: 2rem;
          line-height: 2rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }

        .react-datepicker__day:hover {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .react-datepicker__day--selected {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }

        .react-datepicker__day--keyboard-selected {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .react-datepicker__day--today {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          font-weight: 600;
        }

        .react-datepicker__day--outside-month {
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
        }

        .react-datepicker__day--disabled {
          color: hsl(var(--muted-foreground));
          opacity: 0.3;
          cursor: not-allowed;
        }

        .react-datepicker__navigation {
          top: 0.75rem;
          border: none;
          background: none;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-in-out;
        }

        .react-datepicker__navigation:hover {
          background: hsl(var(--accent));
        }

        .react-datepicker__navigation-icon::before {
          border-color: hsl(var(--foreground));
          border-width: 2px 2px 0 0;
          width: 6px;
          height: 6px;
        }

        .react-datepicker__year-dropdown,
        .react-datepicker__month-dropdown {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.375rem;
          color: hsl(var(--foreground));
        }

        .react-datepicker__year-option,
        .react-datepicker__month-option {
          color: hsl(var(--foreground));
        }

        .react-datepicker__year-option:hover,
        .react-datepicker__month-option:hover {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .react-datepicker__year-option--selected,
        .react-datepicker__month-option--selected {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
      `}</style>

      <ReactDatePicker
        selected={date}
        onChange={(date: Date | null) => onDateChange?.(date || undefined)}
        customInput={<CustomInput />}
        dateFormat="dd/MM/yyyy"
        locale="es"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        yearDropdownItemNumber={50}
        scrollableYearDropdown
        minDate={new Date("1900-01-01")}
        maxDate={new Date()}
        placeholderText={placeholder}
        disabled={disabled}
        popperClassName="z-50"
        popperPlacement="bottom-start"
      />
    </>
  );
}
