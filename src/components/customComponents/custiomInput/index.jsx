"use client";

import React from "react";
import { Input } from "../../components/ui/input";
import { cn } from "@/lib/utils";

function CustomInput({ disabled, type, placeholder, inputClassName, id, name, value, error, onChange, onBlur, errorClass,label }) {
  return (
    <div className="w-full relative">
        {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 block mb-1">
          {label}
        </label>
      )}
      <Input type={type ? type : "text"} id={id} name={name} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled ? disabled : false} placeholder={placeholder ? placeholder : "Enter your text"} className={cn(inputClassName)} />
      {error && (
        <span className={cn("text-xs block text-left text-red-600 font-normal absolute left-1 -bottom-4", errorClass && errorClass)}>{error}</span>
      )}
    </div>
  );
}

export default CustomInput;
