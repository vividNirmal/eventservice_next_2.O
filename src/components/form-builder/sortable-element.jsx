'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Trash2 } from 'lucide-react';

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
  onSelect
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(element);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(element.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white border-2 rounded-lg p-4 mb-3 transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-gray-300'
        }
        ${isDragging ? 'opacity-50' : ''}
      `}
      onClick={handleClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      {/* Action Buttons */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className="h-8 w-8 p-0 bg-white hover:bg-gray-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 bg-white hover:bg-red-50 hover:border-red-200"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      {/* Element Content */}
      <div className="pr-20 pl-8">
        {children}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded-lg" />
      )}
    </div>
  );
}
