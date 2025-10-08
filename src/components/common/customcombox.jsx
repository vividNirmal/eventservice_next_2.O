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
  CommandGroup,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const ITEM_HEIGHT = 36;
const MAX_HEIGHT = 300;

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
  search = true,
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
    return options.filter((opt) => 
      opt[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
      return <span className="truncate">{selectedOptions[0]?.[labelKey]}</span>;
    }
    if (selectedOptions.length <= maxDisplay) {
      return (
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {selectedOptions.map((opt) => (
            <Badge 
              key={opt[valueKey]} 
              variant="secondary" 
              className="text-xs max-w-[120px] truncate"
            >
              <span className="truncate">{opt[labelKey]}</span>
              <button
                type="button"
                className="ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(opt[valueKey]);
                }}
              >
                <X className="h-3 w-3" />
              </button>
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
            multiSelect ? "min-h-10 h-auto py-2" : "h-10",
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
      <PopoverContent 
        className="p-0 w-full min-w-[var(--radix-popover-trigger-width)]" 
        align="start"
        style={{ width: triggerWidth > 0 ? triggerWidth : "auto" }}
      >
        <Command className="border-0">
          {search && (
            <div className="border-b">
              <CommandInput
                placeholder={searchPlaceholder}
                className="h-9 border-0"
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
            </div>
          )}
          <CommandList className="max-h-[300px]">
            {filteredOptions.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm">
                {emptyMessage}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((opt) => {
                  const isSelected = normalizedValue.includes(opt[valueKey]);
                  const isDisabled = opt[disabledKey];

                  return (
                    <CommandItem
                      key={opt[valueKey]}
                      value={opt[labelKey]}
                      onSelect={() => !isDisabled && handleSelect(opt[valueKey])}
                      disabled={isDisabled}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-sm",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span className="flex-1 truncate">{opt[labelKey]}</span>
                      <Check 
                        className={cn(
                          "ml-2 h-4 w-4 flex-shrink-0", 
                          isSelected ? "opacity-100" : "opacity-0"
                        )} 
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}