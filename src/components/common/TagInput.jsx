
"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../ui/input";

export default function TagInput({ value = [], onChange, placeholder = "Enter keywords..." }) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (["Enter", "Tab", ",", " "].includes(e.key)) {
      e.preventDefault();
      addTag();
    }
  };

  const handleBlur = () => {
    addTag();
  };

  const removeTag = (indexToRemove) => {
    const newTags = value.filter((_, idx) => idx !== indexToRemove);
    onChange(newTags);
  };

  return (
    <div className="w-full border border-gray-300 rounded-md px-1 py-1 shadow-sm bg-white">
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-[#7367f0] text-white px-2 py-1 rounded-md text-xs"
          >
            <span>{tag}</span>
            <X
              className="cursor-pointer w-4 h-4 hover:text-gray-200"
              onClick={() => removeTag(index)}
            />
          </div>
        ))}
        <Input
          type="text"
          placeholder={placeholder}
          className="flex-1 min-w-[150px] border-none focus:ring-0 p-1 text-xs"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}
