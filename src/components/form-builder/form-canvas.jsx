'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableElement } from './sortable-element';
import { FormElementRenderer } from '../form-elements/form-element-renderer';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Form Canvas Component
 * Main area where form elements are displayed and can be edited
 */
export function FormCanvas({ 
  elements, 
  onElementEdit, 
  onElementDelete,
  selectedElementId,
  onElementSelect
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas',
    data: {
      type: 'type1',
    }
  });

  const handleCanvasClick = (e) => {
    // Only deselect if clicking directly on canvas, not on elements
    if (e.target === e.currentTarget) {
      onElementSelect(null);
    }
  };

  return (
    <div className="flex-1 p-4 2xl:p-6 bg-gray-100 sticky top-0 overflow-auto">
      <Card className="max-w-full">
        <CardContent className="p-0">
          <div ref={setNodeRef} onClick={handleCanvasClick} className={cn("min-h-96 rounded-lg border-2 border-dashed transition-all duration-200",isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white')}>
            {elements.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">Drag elements here to build your form</div>
                  <div className="text-sm">Choose from the sidebar to get started</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4 2xl:p-6">
                {elements
                  .sort((a, b) => a.position - b.position)
                  .map((element) => (
                    <SortableElement key={element.id} element={element} onEdit={onElementEdit} onDelete={onElementDelete} isSelected={selectedElementId === element.id} onSelect={onElementSelect}>
                      <FormElementRenderer element={element} preview={true} />
                    </SortableElement>
                  ))}
                
                {/* Drop zone at the bottom */}
                {isOver && (
                  <div className="h-8 border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-sm">Drop here to add element</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
