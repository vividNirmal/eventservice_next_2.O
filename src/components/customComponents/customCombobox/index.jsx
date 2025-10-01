"use client";

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

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
  maxDisplay = 3,
  multiSelect = false, 
  renderTriggerContent,
  ...props
}) {
  const [open, setOpen] = React.useState(false)

  // Normalize value to always work with arrays internally
  const normalizedValue = React.useMemo(() => {
    if (multiSelect) {
      return Array.isArray(value) ? value : []
    }
    return value ? [value] : []
  }, [value, multiSelect])

  // Find selected options for display
  const selectedOptions = React.useMemo(() => {
    return options.filter((opt) => normalizedValue.includes(opt[valueKey]))
  }, [options, normalizedValue, valueKey])

  const handleSelect = React.useCallback(
    (selectedValue) => {
      if (multiSelect) {
        const newValue = normalizedValue.includes(selectedValue)
          ? normalizedValue.filter((v) => v !== selectedValue) // Remove if already selected
          : [...normalizedValue, selectedValue] // Add if not selected
        onChange?.(newValue)
      } else {
        // Single select mode
        const newValue = selectedValue === value ? "" : selectedValue
        onChange?.(newValue)
        setOpen(false) // Close popover after single selection
      }
    },
    [normalizedValue, onChange, multiSelect, value],
  )

  const handleRemove = React.useCallback(
    (valueToRemove) => {
      if (multiSelect) {
        const newValue = normalizedValue.filter((v) => v !== valueToRemove)
        onChange?.(newValue)
      }
    },
    [normalizedValue, onChange, multiSelect],
  )

  const handleOpenChange = React.useCallback(
    (isOpen) => {
      setOpen(isOpen)
      if (!isOpen && onBlur) {
        onBlur()
      }
    },
    [onBlur],
  )

  // Default display content if renderTriggerContent is not provided
  const defaultDisplayContent = React.useMemo(() => {
    if (selectedOptions.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>
    }

    if (!multiSelect) {
      // Single select display
      return <span>{selectedOptions[0]?.[labelKey]}</span>
    }

    // Multi select display
    if (selectedOptions.length <= maxDisplay) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge key={option[valueKey]} variant="secondary" className="text-xs">
              {option[labelKey]}
              <span
                role="button" // Indicate it's an interactive element
                tabIndex={0} // Make it focusable
                className="ml-1 hover:bg-muted rounded-full cursor-pointer" // Add cursor style
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(option[valueKey])
                }}
                onKeyDown={(e) => {
                  // Add keyboard support for accessibility
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    e.stopPropagation()
                    handleRemove(option[valueKey])
                  }
                }}
              >
                <X className="h-3 w-3" />
              </span>
            </Badge>
          ))}
        </div>
      )
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
            e.stopPropagation()
            onChange?.([])
          }}
        >
          Clear all
        </button>
      </div>
    )
  }, [selectedOptions, maxDisplay, placeholder, labelKey, valueKey, handleRemove, onChange, multiSelect])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", multiSelect ? "min-h-10 h-auto" : "h-10", className)}
          name={name}
          id={id}
        >
          <div className="flex-1 text-left overflow-hidden">
            {renderTriggerContent ? renderTriggerContent() : defaultDisplayContent}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option[valueKey]}
                  value={option[labelKey]} // Use label for search functionality
                  onSelect={() => handleSelect(option[valueKey])}
                  disabled={option[disabledKey]}
                >
                  {option[labelKey]}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      normalizedValue.includes(option[valueKey]) ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
