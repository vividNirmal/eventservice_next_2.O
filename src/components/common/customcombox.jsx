"use client";

import React, { useState, useMemo, useCallback, useRef, useLayoutEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { FixedSizeList } from "react-window";

const ITEM_HEIGHT = 36;

// ✅ outerElementType for FixedSizeList
const OuterElement = React.forwardRef(function OuterElement({ children, className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      {...rest}
      className={cn("overflow-auto p-1", className)} // mimic CommandList style
    >
      {children}
    </div>
  );
});

const InnerElement = React.forwardRef(function InnerElement({ children, className, ...rest }, ref) {
  return (
    <div ref={ref} {...rest} className={className}>
      {children}
    </div>
  );
});

export function CustomCombobox({
  options = [],
  name,
  value,
  onChange,
  onBlur,
  valueKey = "value",
  labelKey = "label",
  disabledKey = "disabled",
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  disabled = false,
  className = "",
  id = "",
  maxDisplay = 7,
  multiSelect = false,
  renderTriggerContent,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [triggerWidth, setTriggerWidth] = useState(0);
  const triggerRef = useRef(null);

  useLayoutEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open, options, value, className]);

  const normalizedValue = useMemo(() => {
    return multiSelect ? (Array.isArray(value) ? value : []) : value ? [value] : [];
  }, [value, multiSelect]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) => opt[labelKey].toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm, labelKey]);

  const selectedOptions = useMemo(() => {
    return options.filter((opt) => normalizedValue.includes(opt[valueKey]));
  }, [options, normalizedValue, valueKey]);

  const handleSelect = useCallback(
    (selectedValue) => {
      if (multiSelect) {
        const newValue = normalizedValue.includes(selectedValue)
          ? normalizedValue.filter((v) => v !== selectedValue)
          : [...normalizedValue, selectedValue];
        onChange?.(newValue);
      } else {
        const newValue = selectedValue === value ? "" : selectedValue;
        onChange?.(newValue);
        setOpen(false);
      }
    },
    [normalizedValue, onChange, multiSelect, value]
  );

  const handleRemove = useCallback(
    (valueToRemove) => {
      if (multiSelect) {
        const newValue = normalizedValue.filter((v) => v !== valueToRemove);
        onChange?.(newValue);
      }
    },
    [normalizedValue, onChange, multiSelect]
  );

  const handleOpenChange = useCallback(
    (isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        onBlur?.();
        setSearchTerm("");
      }
    },
    [onBlur]
  );

  const defaultDisplayContent = useMemo(() => {
    if (selectedOptions.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }
    if (!multiSelect) {
      return <span>{selectedOptions[0]?.[labelKey]}</span>;
    }
    if (selectedOptions.length <= maxDisplay) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((opt) => (
            <Badge key={opt[valueKey]} variant="secondary" className="text-xs">
              {opt[labelKey]}
              <span
                role="button"
                tabIndex={0}
                className="ml-1 hover:bg-muted rounded-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(opt[valueKey]);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(opt[valueKey]);
                  }
                }}
              >
                <X className="h-3 w-3" />
              </span>
            </Badge>
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {selectedOptions.length} selected
        </Badge>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onChange?.([]);
          }}
        >
          Clear all
        </button>
      </div>
    );
  }, [
    selectedOptions,
    maxDisplay,
    placeholder,
    labelKey,
    valueKey,
    handleRemove,
    onChange,
    multiSelect,
  ]);

  const Row = useCallback(
    ({ index, style }) => {
      const opt = filteredOptions[index];
      if (!opt) return null;

      const isSelected = normalizedValue.includes(opt[valueKey]);
      const isDisabled = opt[disabledKey];

      return (
        <CommandItem
          key={opt[valueKey]}
          value={opt[labelKey]}
          onSelect={() => handleSelect(opt[valueKey])}
          disabled={isDisabled}
          style={style}
          className={cn(
            "flex items-center justify-between",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {opt[labelKey]}
          <Check className={cn("ml-auto h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
        </CommandItem>
      );
    },
    [filteredOptions, normalizedValue, valueKey, labelKey, disabledKey, handleSelect]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            multiSelect ? "min-h-10 h-auto" : "h-10",
            className
          )}
          name={name}
          id={id}
        >
          <div className="flex-1 text-left overflow-hidden">
            {renderTriggerContent ? renderTriggerContent() : defaultDisplayContent}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: triggerWidth }} align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          {filteredOptions.length === 0 ? (
            <CommandEmpty>{emptyMessage}</CommandEmpty>
          ) : (
            <FixedSizeList
              height={Math.min(filteredOptions.length * ITEM_HEIGHT, 300)}
              itemCount={filteredOptions.length}
              itemSize={ITEM_HEIGHT}
              width="100%"
              outerElementType={OuterElement}
              innerElementType={InnerElement}
            >
              {Row}
            </FixedSizeList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
