'use client';

import { useState, useCallback } from 'react';
import { DndFormBuilder } from './dnd-context';
import { ElementSidebar } from './element-sidebar';
import { FormCanvas } from './form-canvas';
import { ElementProperties } from './element-properties';
import { Button } from '../ui/button';

/**
 * Main Form Builder Component
 */
export function FormBuilder({ form, onFormChange }) {
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Find selected element across all pages
  const selectedElement = selectedElementId 
    ? form.pages.flatMap(page => page.elements).find(el => el.id === selectedElementId) || null 
    : null;

  const handleElementsChange = useCallback((newElements, pageIndex) => {
    const updatedPages = [...form.pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      elements: newElements,
    };
    
    onFormChange({
      ...form,
      pages: updatedPages,
    });
  }, [form, onFormChange]);

  const handleAddElement = useCallback((newElement, pageIndex) => {
    const targetPageIndex = pageIndex ?? currentPageIndex;
    const updatedPages = [...form.pages];
    
    const elementWithPosition = {
      ...newElement,
      position: updatedPages[targetPageIndex].elements.length,
    };
    
    updatedPages[targetPageIndex] = {
      ...updatedPages[targetPageIndex],
      elements: [...updatedPages[targetPageIndex].elements, elementWithPosition],
    };
    
    onFormChange({
      ...form,
      pages: updatedPages,
    });
    
    setSelectedElementId(newElement.id);
  }, [form, currentPageIndex, onFormChange]);

  const handleElementEdit = useCallback((element) => {
    setSelectedElementId(element.id);
  }, []);

  const handleElementDelete = useCallback((elementId) => {
    const updatedPages = form.pages.map(page => ({
      ...page,
      elements: page.elements
        .filter(el => el.id !== elementId)
        .map((el, index) => ({ ...el, position: index })),
    }));
    
    onFormChange({
      ...form,
      pages: updatedPages,
    });
    
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  }, [form, selectedElementId, onFormChange]);

  const handleElementSelect = useCallback((elementId) => {
    setSelectedElementId(elementId);
  }, []);

  const handleElementSave = useCallback((updatedElement) => {
    const updatedPages = form.pages.map(page => ({
      ...page,
      elements: page.elements.map(el => 
        el.id === updatedElement.id ? updatedElement : el
      ),
    }));
    
    onFormChange({
      ...form,
      pages: updatedPages,
    });
    
    setSelectedElementId(null);
  }, [form, onFormChange]);

  const handlePropertiesClose = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  // Get all elements from current page for DndContext
  const currentPageElements = form.pages[currentPageIndex]?.elements || [];

  return (
    <div className="flex flex-col bg-gray-100 h-16 grow">
      <DndFormBuilder
        elements={currentPageElements}
        onElementsChange={handleElementsChange}
        onAddElement={handleAddElement}
        currentPageIndex={currentPageIndex}
      >
        <div className="flex grow overflow-auto">
          <ElementSidebar />
          <div className='w-1/3 grow flex flex-col gap-4 p-4 sticky top-0'>
            <div className='overflow-auto gap-4 flex flex-col h-20 grow pr-4'>
              {
                form.pages.map((page, pageIndex) => ( 
                  <FormCanvas 
                    key={`page-${pageIndex}`}
                    pageuniqid={pageIndex}
                    title={page.name}
                    description={page.description}
                    elements={page.elements || []}
                    onElementEdit={handleElementEdit}
                    onElementDelete={handleElementDelete}
                    selectedElementId={selectedElementId}
                    onElementSelect={handleElementSelect}
                  />
                ))
              }
            </div>
            <div className='flex flex-wrap justify-end gap-4 bg-white p-4 rounded-xl shadow-lg'>
              <Button>Save</Button>
              <Button variant={"secondary"}>Discard</Button>
              <Button variant={"secondary"}>Reset field</Button>
            </div>
          </div>
          
          <ElementProperties
            element={selectedElement}
            onSave={handleElementSave}
            onClose={handlePropertiesClose}
          />
        </div>
      </DndFormBuilder>
    </div>
  );
}