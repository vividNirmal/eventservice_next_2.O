'use client';

import React, { useState } from 'react';
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
import { generateId } from '@/lib/form-utils';

/**
 * DndFormBuilder Component
 * Provides drag and drop context for the form builder with multi-page support
 */
export function DndFormBuilder({ 
  children, 
  elements, 
  onElementsChange, 
  onAddElement,
  currentPageIndex 
}) {
  const [activeId, setActiveId] = useState(null);
  const [activeElement, setActiveElement] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15, // Increased from 8 to 15 pixels - requires more intentional drag        
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    // Store the active element for drag overlay
    if (active.id.startsWith('sidebar-')) {
      setActiveElement(active.data.current);
    } else {
      const element = elements.find(el => el._id === active.id);
      setActiveElement(element);
    }
  };

  const handleDragOver = (event) => {
    // You can add visual feedback here if needed
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveElement(null);
    
    // VALIDATION 1: If no drop target at all, cancel the drag
    if (!over) {
      console.log('❌ Drop canceled: No drop target');
      return;
    }

    // VALIDATION 2: Check if dragging from sidebar
    if (active.id.startsWith('sidebar-')) {
      // CRITICAL FIX: Check multiple conditions for sidebar drops
      const isSidebarDrop = 
        (over.id && typeof over.id === 'string' && over.id.startsWith('sidebar-')) || // Dropped on sidebar element
        over.id === 'sidebar-droppable'; // Dropped on sidebar container
      
      if (isSidebarDrop) {
        console.log('❌ Drop canceled: Cannot drop back on sidebar', { overId: over.id });
        return; // Don't add element - user canceled
      }
      
      // Check if the drop target is valid
      const isOverCanvas = over.id && typeof over.id === 'string' && over.id.startsWith('form-canvas-');
      const isOverCanvasElement = over.id && 
        !over.id.startsWith('sidebar-') && 
        !over.id.startsWith('form-canvas-') &&
        !over.id.startsWith('properties-'); // Also exclude properties panel
      
      // Only proceed if dropped on canvas area or existing canvas element
      if (!isOverCanvas && !isOverCanvasElement) {
        console.log('❌ Drop canceled: Invalid drop zone', {
          droppedOn: over.id,
          isOverCanvas,
          isOverCanvasElement
        });
        return; // Cancel the drop
      }
      
      console.log('✅ Valid drop zone detected', {
        droppedOn: over.id,
        isOverCanvas,
        isOverCanvasElement
      });
    }

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
      // Determine which page to add to
      let targetPageIndex = currentPageIndex;
      
      // Check if dropping directly on a canvas
      if (over.id && typeof over.id === 'string' && over.id.startsWith('form-canvas-')) {
        targetPageIndex = getPageIndexFromCanvasId(over.id);
      }
      
      // Check if dropping on canvas or on an existing element
      if (over.id.startsWith('form-canvas-') || !over.id.startsWith('sidebar-')) {
        const newElementData = {
          ...active.data.current,
          _id: generateId()
        };
        const newElement = newElementData;
        
        // If dropping on an existing element, insert after it
        if (!over.id.startsWith('form-canvas-') && !over.id.startsWith('sidebar-')) {
          const targetIndex = elements.findIndex(el => el._id === over.id);
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
      const oldIndex = elements.findIndex(el => el._id === active.id);
      const newIndex = elements.findIndex(el => el._id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {        
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

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveElement(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext 
        items={elements.map(el => el._id)} 
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
      
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeElement ? (
          <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-2xl opacity-90 cursor-grabbing">
            <div className="text-sm font-medium text-gray-900">
              {activeElement.fieldTitle || activeElement.fieldName || 'Element'}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}