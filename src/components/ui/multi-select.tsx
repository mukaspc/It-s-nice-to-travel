import * as React from "react";
import { Check, X } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { Badge } from "./badge";
import { Command, CommandEmpty, CommandGroup, CommandInput } from "./command";
import { cn } from "../../lib/utils";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  allowCustom?: boolean;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Select items...",
  emptyMessage = "No items found.",
  className,
  disabled = false,
  allowCustom = true,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Tworzymy mapę wszystkich opcji (predefiniowanych i własnych)
  const allOptions = React.useMemo(() => {
    const customOptions = value.filter((v) => !options.some((o) => o.value === v)).map((v) => ({ value: v, label: v }));
    return [...options, ...customOptions];
  }, [options, value]);

  const handleUnselect = (item: string) => {
    onChange(value.filter((i) => i !== item));
  };

  const handleSelect = (selectedValue: string) => {
    console.log("handleSelect", selectedValue);
    if (!value.includes(selectedValue)) {
      onChange([...value, selectedValue]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && value.length > 0) {
          onChange(value.slice(0, -1));
        }
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (inputValue.trim() && allowCustom) {
          handleSelect(inputValue.trim());
        }
      }
      if (e.key === "Escape") {
        input.blur();
        setOpen(false);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue.trim() && allowCustom) {
      handleSelect(inputValue.trim());
    }
    // Opóźniamy zamknięcie, aby pozwolić na kliknięcie opcji
    setTimeout(() => setOpen(false), 200);
  };

  const filteredOptions = options.filter(
    (option) => !value.includes(option.value) && option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Command onKeyDown={handleKeyDown} className={cn("overflow-visible bg-transparent", className)}>
      <div
        className={cn(
          "group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex flex-wrap gap-1 w-full">
          {value.map((item) => {
            const option = allOptions.find((o) => o.value === item);
            return (
              <Badge
                key={item}
                variant="secondary"
                className={cn("hover:bg-secondary/80", disabled && "hover:bg-secondary")}
              >
                {option?.label || item}
                {!disabled && (
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus-within:ring-offset-2"
                    onKeyDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.key === "Enter") {
                        handleUnselect(item);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            );
          })}
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={handleBlur}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? placeholder : "Add more..."}
            disabled={disabled}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && filteredOptions.length > 0 ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="max-h-[200px] overflow-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    console.log("onClick", option.value);
                    handleSelect(option.value);
                    setOpen(false);
                  }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <Check className={cn("mr-2 h-4 w-4", value.includes(option.value) ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </div>
              ))}
            </CommandGroup>
          </div>
        ) : null}
      </div>
      {open && filteredOptions.length === 0 && allowCustom && inputValue.trim() && (
        <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <CommandEmpty>Press Enter to add "{inputValue}"</CommandEmpty>
        </div>
      )}
      {open && filteredOptions.length === 0 && (!allowCustom || !inputValue.trim()) && (
        <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <CommandEmpty>{emptyMessage}</CommandEmpty>
        </div>
      )}
    </Command>
  );
}
