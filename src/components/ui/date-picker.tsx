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
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecciona una fecha",
  disabled = false,
  className,
  fromYear = 1990,
  toYear = new Date().getFullYear(),
  minDate,
  maxDate,
}: DatePickerProps) {
  const CustomInput = React.forwardRef<
    HTMLButtonElement,
    { value?: string; onClick?: () => void }
  >(({ value, onClick }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal h-10 px-3 py-2 text-sm border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
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
    <div className="w-full relative">
      <ReactDatePicker
        selected={date}
        onChange={(date: Date | null) => onDateChange?.(date || undefined)}
        customInput={<CustomInput />}
        dateFormat="dd/MM/yyyy"
        locale="es"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholder}
        disabled={disabled}
        className="w-full"
        calendarClassName="react-datepicker-custom"
        popperClassName="react-datepicker-popper-custom"
        popperPlacement="bottom-start"
        showPopperArrow={false}
        fixedHeight
        todayButton="Hoy"
        autoComplete="off"
        withPortal={false}
        preventOpenOnFocus={false}
        popperModifiers={[
          {
            name: "preventOverflow",
            options: {
              rootBoundary: "viewport",
              tether: false,
              altAxis: true,
            },
          },
          {
            name: "flip",
            options: {
              fallbackPlacements: ["bottom-end", "top-start", "top-end"],
            },
          },
          {
            name: "offset",
            options: {
              offset: [0, 4],
            },
          },
        ]}
      />
    </div>
  );
}
