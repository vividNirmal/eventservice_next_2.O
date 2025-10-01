"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"


import { CustomCombobox } from "../customCombobox"
import { countries } from "@/lib/countries"

export function PhoneInputWithCountryCode({
  value, 
  onChange, 
  id,
  name,
  placeholder = "Phone number",
  disabled = false,
  className,
  ...props
}) {
  const initialCountryCode =
    value?.countryCode || countries.find((c) => c.isoCode === "US")?.dial_code || countries[0].dial_code

  const countryOptions = React.useMemo(() => {
    return countries.map((country) => ({      
      uniqueId: country.isoCode,      
      dialCode: country.dial_code,      
      label: `${country.flag} ${country.name} (${country.dial_code})`,
    }))
  }, [])

  // Find the currently selected country's unique ID (isoCode)
  // This is what FlexibleCombobox will receive as its 'value' prop
  const selectedCountryUniqueId = React.useMemo(() => {
    const selectedCountry = countries.find((c) => c.dial_code === initialCountryCode)
    return selectedCountry
      ? selectedCountry.isoCode
      : countries.find((c) => c.isoCode === "US")?.isoCode || countries[0].isoCode
  }, [initialCountryCode])

  const handleCountryCodeChange = React.useCallback(
    (selectedUniqueId) => {      
      const selectedCountry = countries.find((c) => c.isoCode === selectedUniqueId)
      if (selectedCountry) {
        onChange?.({ ...value, countryCode: selectedCountry.dial_code })
      }
    },
    [onChange, value],
  )

  const handlePhoneNumberChange = React.useCallback(
    (e) => {
      onChange?.({ ...value, phoneNumber: e.target.value })
    },
    [onChange, value],
  )

  // Find the currently selected country option to display its flag and dial code in the trigger
  const selectedCountryOption = React.useMemo(() => {
    return countries.find((c) => c.dial_code === initialCountryCode)
  }, [initialCountryCode])

  return (
    <div className={cn("flex gap-2", className)}>
      <CustomCombobox
        id={`${id}-country-code`}
        name={`${name}-country-code`}
        options={countryOptions}
        value={selectedCountryUniqueId} // Pass the unique ID (isoCode) as the value
        onChange={handleCountryCodeChange}
        multiSelect={false} // Ensure it's single select
        placeholder="Select code..."
        searchPlaceholder="Search country..."
        emptyMessage="No country found."
        valueKey="uniqueId" // Tell FlexibleCombobox to use 'uniqueId' for keys and internal value tracking
        labelKey="label" // Use 'label' for display and search in the dropdown
        renderTriggerContent={() => (
          <span className="flex items-center gap-1">
            {selectedCountryOption?.flag} {selectedCountryOption?.dial_code}
          </span>
        )}
        className="w-1/3"
      />
      <Input
        id={id}
        name={name}
        type="tel" // Use type="tel" for phone numbers
        placeholder={placeholder}
        value={value?.phoneNumber || ""}
        onChange={handlePhoneNumberChange}
        disabled={disabled}
        className="flex-1"
        {...props}
      />
    </div>
  )
}
