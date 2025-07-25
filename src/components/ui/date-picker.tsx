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
        "w-full justify-start text-left font-normal h-10 px-3 py-2 text-sm border-input bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors",
        !value && "text-muted-foreground",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 opacity-70" />
      <span className="truncate flex-1 text-left">
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
          border-radius: 0.75rem;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          overflow: hidden;
          min-width: 280px;
        }

        .react-datepicker__header {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%);
          border-bottom: 1px solid hsl(var(--border));
          border-radius: 0;
          padding: 1rem 0.75rem;
          position: relative;
        }

        .react-datepicker__current-month {
          color: hsl(var(--primary-foreground));
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 0.5rem;
          text-align: center;
          text-shadow: 0 1px 2px rgb(0 0 0 / 0.1);
        }

        .react-datepicker__day-names {
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: space-around;
          background: hsl(var(--muted)/0.3);
          margin: 0;
          padding: 0.5rem 0;
        }

        .react-datepicker__day-name {
          color: hsl(var(--primary-foreground)/0.8);
          font-weight: 600;
          font-size: 0.75rem;
          width: 2.25rem;
          line-height: 1.5rem;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .react-datepicker__month {
          padding: 0.75rem;
          background: hsl(var(--background));
        }

        .react-datepicker__week {
          display: flex;
          justify-content: space-around;
          margin-bottom: 0.25rem;
        }

        .react-datepicker__day {
          color: hsl(var(--foreground));
          width: 2.25rem;
          height: 2.25rem;
          line-height: 2.25rem;
          border-radius: 0.5rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          font-weight: 500;
          text-align: center;
          position: relative;
          margin: 0.125rem;
          border: 2px solid transparent;
        }

        .react-datepicker__day:hover {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          transform: scale(1.05);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .react-datepicker__day--selected {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          border-color: hsl(var(--primary)) !important;
          font-weight: 600 !important;
          transform: scale(1.1) !important;
          box-shadow: 0 8px 15px -3px hsl(var(--primary)/0.4) !important;
        }

        .react-datepicker__day--selected:hover {
          background: hsl(var(--primary)/0.9) !important;
          transform: scale(1.1) !important;
        }

        .react-datepicker__day--keyboard-selected {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          border-color: hsl(var(--ring));
        }

        .react-datepicker__day--today {
          background: linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent)/0.8) 100%);
          color: hsl(var(--accent-foreground));
          font-weight: 700;
          border: 2px solid hsl(var(--primary)/0.3);
          position: relative;
        }

        .react-datepicker__day--today::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: hsl(var(--primary));
          border-radius: 50%;
        }

        .react-datepicker__day--outside-month {
          color: hsl(var(--muted-foreground));
          opacity: 0.4;
        }

        .react-datepicker__day--disabled {
          color: hsl(var(--muted-foreground));
          opacity: 0.3;
          cursor: not-allowed;
          background: hsl(var(--muted)/0.3);
        }

        .react-datepicker__day--disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .react-datepicker__navigation {
          top: 1.25rem;
          border: none;
          background: hsl(var(--background));
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
        }

        .react-datepicker__navigation:hover {
          background: hsl(var(--accent));
          transform: scale(1.1);
          box-shadow: 0 4px 6px rgb(0 0 0 / 0.15);
        }

        .react-datepicker__navigation--previous {
          left: 0.75rem;
        }

        .react-datepicker__navigation--next {
          right: 0.75rem;
        }

        .react-datepicker__navigation-icon::before {
          border-color: hsl(var(--primary));
          border-width: 2px 2px 0 0;
          width: 8px;
          height: 8px;
        }

        .react-datepicker__year-dropdown,
        .react-datepicker__month-dropdown {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          color: hsl(var(--foreground));
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
          max-height: 200px;
          overflow-y: auto;
        }

        .react-datepicker__year-option,
        .react-datepicker__month-option {
          color: hsl(var(--foreground));
          padding: 0.5rem 1rem;
          transition: all 0.15s ease-in-out;
          cursor: pointer;
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
          font-weight: 600;
        }

        .react-datepicker__triangle {
          display: none;
        }

        /* Animaciones suaves */
        .react-datepicker__month-container {
          transition: all 0.3s ease-in-out;
        }

        /* Scrollbar personalizado para dropdowns */
        .react-datepicker__year-dropdown::-webkit-scrollbar,
        .react-datepicker__month-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        .react-datepicker__year-dropdown::-webkit-scrollbar-track,
        .react-datepicker__month-dropdown::-webkit-scrollbar-track {
          background: hsl(var(--muted));
        }

        .react-datepicker__year-dropdown::-webkit-scrollbar-thumb,
        .react-datepicker__month-dropdown::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 3px;
        }

        .react-datepicker__year-dropdown::-webkit-scrollbar-thumb:hover,
        .react-datepicker__month-dropdown::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--accent));
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
