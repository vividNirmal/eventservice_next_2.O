"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash2, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sortable Element Component
 * Wraps form elements to make them sortable within the canvas
 */
export function SortableElement({
  element,
  children,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element._id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(element._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(element);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(element._id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white border-1 rounded-lg p-4 mb-3 group transition-all duration-200 hover:bg-gray-100",
        isSelected
          ? "border-gray-600 shadow-lg ring-1 ring-blue-200"
          : "border-gray-200 hover:border-gray-300",
        isDragging ? "opacity-50" : ""
      )}
      onClick={handleClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="group-hover:bg-white p-1 rounded-sm absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-5 text-gray-400" />
      </div>

      {/* Action Buttons */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col xl:flex-row gap-1">
        {/* <Button variant="outline" size="sm" onClick={handleEdit} className="size-8 p-0 bg-white hover:bg-gray-50">
          <Edit className="size-4" />
        </Button> */}
        {element.fieldPermission === "DEFAULT_FIELD_NON_REMOVED" ? (
          // add toolkit
          <div className="relative group">
            <OctagonAlert className="size-4 text-gray-300 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              That is Default Field is Non Removed
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="size-8 p-0 bg-white hover:bg-red-50 hover:border-red-200"
          >
            <Trash2 className="size-4 text-red-500" />
          </Button>
        )}
      </div>
      <div className="px-8">{children}</div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded-lg" />
      )}
    </div>
  );
}
