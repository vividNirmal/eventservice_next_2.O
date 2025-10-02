'use client';

import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createDefaultElement, generateId } from '@/lib/form-utils';

/**
 * DndFormBuilder Component
 * Provides drag and drop context for the form builder with multi-page support
 */
export function DndFormBuilder({ 
  children, 
  elements, 
  onElementsChange, 
  onAddElement,
  currentPageIndex // Add current page index prop
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    console.log('Drag started:', event);
  };

  const handleDragOver = (event) => {
    console.log('Drag over:', event);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log('Drag ended:', { active, over });

    if (!over) return;

    // Extract page index from the canvas ID (form-canvas-{pageIndex})
    const getPageIndexFromCanvasId = (canvasId) => {
      if (typeof canvasId === 'string' && canvasId.startsWith('form-canvas-')) {
        return parseInt(canvasId.replace('form-canvas-', ''), 10);
      }
      return null;
    };

    // Check if dragging from sidebar to canvas
    if (active.id.startsWith('sidebar-')) {
      const elementType = active.id.replace('sidebar-', '');
      console.log('Adding new element:', active, over);
      
      // Determine which page to add to
      let targetPageIndex = currentPageIndex;
      
      // Check if dropping directly on a canvas
      if (over.id && typeof over.id === 'string' && over.id.startsWith('form-canvas-')) {
        targetPageIndex = getPageIndexFromCanvasId(over.id);
      }
      
      // Check if dropping on canvas or on an existing element
      if (over.id.startsWith('form-canvas-') || !over.id.startsWith('sidebar-')) {
        // Create new element
        const newElement = createDefaultElement(elementType);
        
        // If dropping on an existing element, insert after it
        if (!over.id.startsWith('form-canvas-') && !over.id.startsWith('sidebar-')) {
          const targetIndex = elements.findIndex(el => el.id === over.id);
          if (targetIndex !== -1) {
            newElement.position = targetIndex + 1;
            // Update positions of elements after the target
            const updatedElements = [...elements];
            updatedElements.forEach((el, index) => {
              if (index > targetIndex) {
                el.position = el.position + 1;
              }
            });
            updatedElements.splice(targetIndex + 1, 0, newElement);
            onElementsChange(updatedElements.map((el, index) => ({...el, position: index})), targetPageIndex);
            return;
          }
        }
        
        // Add element to the specific page
        onAddElement(newElement, targetPageIndex);
      }
      return;
    }

    // Check if reordering elements within canvas
    if (active.id !== over.id && !active.id.startsWith('sidebar-') && !over.id.startsWith('sidebar-')) {
      const oldIndex = elements.findIndex(el => el.id === active.id);
      const newIndex = elements.findIndex(el => el.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        console.log('Reordering elements:', { oldIndex, newIndex });
        const reorderedElements = arrayMove(elements, oldIndex, newIndex);
        
        // Update positions
        const updatedElements = reorderedElements.map((el, index) => ({
          ...el,
          position: index
        }));
        
        onElementsChange(updatedElements, currentPageIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={elements.map(el => el.id)} 
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
      
      <DragOverlay>
        {/* Drag overlay content can be added here if needed */}
      </DragOverlay>
    </DndContext>
  );
}