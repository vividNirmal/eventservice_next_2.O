'use client';

import { useState, useCallback } from 'react';
import { DndFormBuilder } from './dnd-context';
import { ElementSidebar } from './element-sidebar';
import { FormCanvas } from './form-canvas';
import { ElementProperties } from './element-properties';

/**
 * Main Form Builder Component
 */
export function FormBuilder({ form, onFormChange }) {
  const [selectedElementId, setSelectedElementId] = useState(null);

  const selectedElement = selectedElementId 
    ? form.elements.find(el => el.id === selectedElementId) || null 
    : null;

  const handleElementsChange = useCallback((newElements) => {
    onFormChange({
      ...form,
      elements: newElements,
    });
  }, [form, onFormChange]);

  const handleAddElement = useCallback((newElement) => {
    const elementWithPosition = {
      ...newElement,
      position: form.elements.length,
    };
    
    const updatedElements = [...form.elements, elementWithPosition];
    handleElementsChange(updatedElements);
    setSelectedElementId(newElement.id);
  }, [form.elements, handleElementsChange]);

  const handleElementEdit = useCallback((element) => {
    setSelectedElementId(element.id);
  }, []);

  const handleElementDelete = useCallback((elementId) => {
    const filteredElements = form.elements
      .filter(el => el.id !== elementId)
      .map((el, index) => ({ ...el, position: index }));
    
    handleElementsChange(filteredElements);
    
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  }, [form.elements, selectedElementId, handleElementsChange]);

  const handleElementSelect = useCallback((elementId) => {
    setSelectedElementId(elementId);
  }, []);

  const handleElementSave = useCallback((updatedElement) => {
    const updatedElements = form.elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    handleElementsChange(updatedElements);
    setSelectedElementId(null);
  }, [form.elements, handleElementsChange]);

  const handlePropertiesClose = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  return (
    <div className="flex flex-col bg-gray-100 h-16 grow">
      <DndFormBuilder
        elements={form.elements}
        onElementsChange={handleElementsChange}
        onAddElement={handleAddElement}
      >
        <div className="flex grow overflow-auto">
          <ElementSidebar />
          
          <FormCanvas
            elements={form.elements}
            onElementEdit={handleElementEdit}
            onElementDelete={handleElementDelete}
            selectedElementId={selectedElementId}
            onElementSelect={handleElementSelect}
          />
          
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
