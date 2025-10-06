'use client';

import React, { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableElement } from './sortable-element';
import { FormElementRenderer } from '../form-elements/form-element-renderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Check, Pencil } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

/**
 * Form Canvas Component
 * Main area where form elements are displayed and can be edited
 */
export function FormCanvas({   
  pageuniqid,
  elements, 
  onElementEdit, 
  onElementDelete,
  selectedElementId,
  onElementSelect,
  title,
  description,
  onPagetitleUpdate
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [cardtitle, setTitle] = useState(title);
  const [carddescription, setDescription] = useState(description);

  const { setNodeRef, isOver } = useDroppable({
    id: `form-canvas-${pageuniqid}`,
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

  
  const handleSave = () => {
    setIsEditing(false);
    onPagetitleUpdate({
      'pageTitle' : cardtitle,
      'pageDescription' : carddescription,
      'pageindex' : pageuniqid
    })
    // you can trigger API call here to save updated values
  };
  
  return (
    <div className="flex-1 bg-gray-100">
     <Card className="max-w-full">
      <CardContent className="p-0 flex flex-col">
        <CardHeader className="p-0 mb-4 flex items-start justify-between">
          <div>
            {isEditing ? (
              <>
                <Input
                  value={cardtitle}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mb-2"
                />
                <Textarea
                  value={carddescription}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </>
            ) : (
              <>
                <CardTitle className="text-base 2xl:text-lg">{cardtitle}</CardTitle>
                <CardDescription>{carddescription}</CardDescription>
              </>
            )}
          </div>

          <div className="ml-2">
            {isEditing ? (
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
          <div ref={setNodeRef} onClick={handleCanvasClick} className={cn("min-h-96 rounded-lg border-2 border-dashed transition-all duration-200", isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white')}>
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
                    <SortableElement key={element._id} element={element} onEdit={onElementEdit} onDelete={onElementDelete} isSelected={selectedElementId === element._id} onSelect={onElementSelect}>
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
