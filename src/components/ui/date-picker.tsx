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
        className,
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
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
          overflow: hidden;
          min-width: 280px;
        }

        .react-datepicker__header {
          background: hsl(var(--muted));
          border-bottom: 1px solid hsl(var(--border));
          border-radius: 0;
          padding: 1rem;
          position: relative;
        }

        .react-datepicker__current-month {
          color: hsl(var(--foreground));
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .react-datepicker__day-names {
          margin: 0;
          padding: 0.5rem 0;
          display: flex;
          justify-content: space-around;
          background: hsl(var(--muted)/0.5);
          border-top: 1px solid hsl(var(--border));
        }

        .react-datepicker__day-name {
          color: hsl(var(--muted-foreground));
          font-weight: 500;
          font-size: 0.75rem;
          width: 2rem;
          line-height: 1.5rem;
          text-align: center;
          text-transform: uppercase;
        }

        .react-datepicker__month {
          padding: 1rem;
          background: hsl(var(--background));
        }

        .react-datepicker__week {
          display: flex;
          justify-content: space-around;
          margin-bottom: 0.375rem;
        }

        .react-datepicker__day {
          color: hsl(var(--foreground));
          width: 2rem;
          height: 2rem;
          line-height: 2rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          cursor: pointer;
          font-weight: 400;
          text-align: center;
          margin: 0.125rem;
          border: none;
          background: transparent;
        }

        .react-datepicker__day:hover {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .react-datepicker__day--selected {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          font-weight: 600 !important;
        }

        .react-datepicker__day--selected:hover {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }

        .react-datepicker__day--keyboard-selected {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring));
        }

        .react-datepicker__day--today {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          font-weight: 500;
          border: 1px solid hsl(var(--primary));
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.2); }
        }

        .react-datepicker__day--outside-month {
          color: hsl(var(--muted-foreground));
          opacity: 0.3;
          background: hsl(var(--muted)/0.1);
        }

        .react-datepicker__day--disabled {
          color: hsl(var(--muted-foreground));
          opacity: 0.2;
          cursor: not-allowed;
          background: hsl(var(--muted)/0.2);
          box-shadow: none;
        }

        .react-datepicker__day--disabled:hover {
          transform: none;
          box-shadow: none;
          background: hsl(var(--muted)/0.2);
        }

        /* BOTONES DE NAVEGACIÓN MEJORADOS */
        .react-datepicker__navigation {
          top: 1.5rem;
          border: none;
          background: linear-gradient(135deg,
            hsl(var(--background)) 0%,
            hsl(var(--muted)/0.3) 100%);
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 4px 6px rgb(0 0 0 / 0.1),
            0 0 0 1px hsl(var(--border)),
            0 0 0 1px rgb(255 255 255 / 0.1) inset;
          backdrop-filter: blur(8px);
          z-index: 20;
        }

        .react-datepicker__navigation:hover {
          background: linear-gradient(135deg,
            hsl(var(--primary)) 0%,
            hsl(var(--primary)/0.9) 100%);
          transform: scale(1.15) translateY(-2px);
          box-shadow:
            0 8px 15px hsl(var(--primary)/0.4),
            0 4px 6px rgb(0 0 0 / 0.1),
            0 0 0 1px hsl(var(--primary)/0.3);
        }

        .react-datepicker__navigation:active {
          transform: scale(1.05) translateY(-1px);
        }

        .react-datepicker__navigation--previous {
          left: 1rem;
        }

        .react-datepicker__navigation--next {
          right: 1rem;
        }

        .react-datepicker__navigation-icon::before {
          border-color: hsl(var(--foreground));
          border-width: 2.5px 2.5px 0 0;
          width: 10px;
          height: 10px;
          transition: all 0.2s ease;
        }

        .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: hsl(var(--primary-foreground));
          border-width: 3px 3px 0 0;
          width: 12px;
          height: 12px;
        }

        /* DROPDOWNS MEJORADOS */
        .react-datepicker__year-dropdown,
        .react-datepicker__month-dropdown {
          background: hsl(var(--background));
          border: none;
          border-radius: 0.75rem;
          color: hsl(var(--foreground));
          box-shadow:
            0 20px 25px -5px rgb(0 0 0 / 0.25),
            0 0 0 1px hsl(var(--border)),
            0 0 0 1px rgb(255 255 255 / 0.05) inset;
          max-height: 240px;
          overflow: hidden;
          backdrop-filter: blur(12px);
          margin-top: 0.5rem;
        }

        .react-datepicker__year-dropdown-container--scrollable,
        .react-datepicker__month-dropdown {
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .react-datepicker__year-option,
        .react-datepicker__month-option {
          color: hsl(var(--foreground));
          padding: 0.75rem 1.25rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          font-weight: 500;
          border-bottom: 1px solid hsl(var(--border)/0.3);
          position: relative;
          overflow: hidden;
        }

        .react-datepicker__year-option::before,
        .react-datepicker__month-option::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: linear-gradient(90deg,
            hsl(var(--primary)/0.1),
            hsl(var(--primary)/0.05));
          transition: width 0.3s ease;
        }

        .react-datepicker__year-option:hover,
        .react-datepicker__month-option:hover {
          background: linear-gradient(90deg,
            hsl(var(--accent)) 0%,
            hsl(var(--accent)/0.9) 100%);
          color: hsl(var(--accent-foreground));
          transform: translateX(4px);
          padding-left: 1.5rem;
          font-weight: 600;
        }

        .react-datepicker__year-option:hover::before,
        .react-datepicker__month-option:hover::before {
          width: 4px;
          background: hsl(var(--primary));
        }

        .react-datepicker__year-option--selected,
        .react-datepicker__month-option--selected {
          background: linear-gradient(90deg,
            hsl(var(--primary)) 0%,
            hsl(var(--primary)/0.9) 100%);
          color: hsl(var(--primary-foreground));
          font-weight: 700;
          position: relative;
          box-shadow: 0 2px 4px hsl(var(--primary)/0.3);
        }

        .react-datepicker__year-option--selected::after,
        .react-datepicker__month-option--selected::after {
          content: '✓';
          position: absolute;
          right: 1rem;
          font-weight: 800;
          font-size: 0.875rem;
        }

        .react-datepicker__triangle {
          display: none;
        }

        /* ANIMACIONES Y TRANSICIONES */
        .react-datepicker__month-container {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* SCROLLBARS PERSONALIZADOS */
        .react-datepicker__year-dropdown::-webkit-scrollbar,
        .react-datepicker__month-dropdown::-webkit-scrollbar {
          width: 8px;
        }

        .react-datepicker__year-dropdown::-webkit-scrollbar-track,
        .react-datepicker__month-dropdown::-webkit-scrollbar-track {
          background: hsl(var(--muted)/0.3);
          border-radius: 4px;
        }

        .react-datepicker__year-dropdown::-webkit-scrollbar-thumb,
        .react-datepicker__month-dropdown::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg,
            hsl(var(--primary)/0.6),
            hsl(var(--primary)/0.4));
          border-radius: 4px;
          border: 1px solid hsl(var(--background));
        }

        .react-datepicker__year-dropdown::-webkit-scrollbar-thumb:hover,
        .react-datepicker__month-dropdown::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg,
            hsl(var(--primary)),
            hsl(var(--primary)/0.8));
        }

        /* BOTÓN HOY MEJORADO */
        .react-datepicker__today-button {
          background: linear-gradient(135deg,
            hsl(var(--primary)) 0%,
            hsl(var(--primary)/0.9) 100%);
          border: none;
          border-radius: 0.75rem;
          color: hsl(var(--primary-foreground));
          padding: 0.75rem 1.5rem;
          margin: 1rem;
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 6px hsl(var(--primary)/0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .react-datepicker__today-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px hsl(var(--primary)/0.4);
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
        yearDropdownItemNumber={60}
        scrollableYearDropdown
        minDate={new Date("1900-01-01")}
        maxDate={new Date()}
        placeholderText={placeholder}
        disabled={disabled}
        popperClassName="z-50"
        popperPlacement="bottom-start"
        calendarClassName="modern-calendar"
        wrapperClassName="w-full"
        showPopperArrow={false}
        fixedHeight
        todayButton="Hoy"
        clearButtonTitle="Limpiar"
      />
    </>
  );
}
