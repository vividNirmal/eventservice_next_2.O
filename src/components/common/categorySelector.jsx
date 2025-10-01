"use client";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function CategorySelector({
  passUnique = false,
  categories,
  selectedCategories = [],
  onSelectionChange,
  label = "Category",
  categoryLabelClass = "",
  categoryListClass = "",
}) {
  //   const [selected, setSelected] = useState(selectedCategories)
  const selected = selectedCategories;

  const getId = (category) => (passUnique ? category.unique_id : category._id);

  const handleCheckboxChange = (categoryId) => {
    const newSelected = selected.includes(categoryId)
      ? selected.filter((id) => id !== categoryId)
      : [...selected, categoryId];

    onSelectionChange?.(newSelected);
  };

  return (
    <div className="flex flex-wrap relative w-full">
      <Label className={cn("text-xs 2xl:text-base mb-1 w-full lg:w-auto lg:min-w-60",categoryLabelClass)}>{label}</Label>
      <div className={cn("w-full lg:w-2/4 grow", categoryListClass)}>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 w-full custom-scroll">
          {categories.map((category) => {
            const idValue = getId(category);

            return (
              <li key={idValue} className="w-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={idValue}
                    checked={selected.includes(idValue)}
                    onCheckedChange={() => handleCheckboxChange(idValue)}
                    className="rounded-sm size-[18px] border-[#7367f0] data-[state=checked]:bg-[#7367f0]"
                  />
                  <Label
                    htmlFor={idValue}
                    className="text-xs 2xl:text-xs font-normal cursor-pointer mb-0"
                  >
                    {category.name}
                  </Label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
