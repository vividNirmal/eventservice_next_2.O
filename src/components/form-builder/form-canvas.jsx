'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableElement } from './sortable-element';
import { FormElementRenderer } from '../form-elements/form-element-renderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Check, Pencil, PackagePlus } from 'lucide-react';
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
  onPagetitleUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [cardtitle, setTitle] = useState(title);
  const [carddescription, setDescription] = useState(description);

  const { setNodeRef, isOver } = useDroppable({
    id: `form-canvas-${pageuniqid}`,
    data: {
      type: 'canvas',
      pageIndex: pageuniqid,
    }
  });    
  
  const handleCanvasClick = (e) => {        
    // Only deselect if clicking directly on canvas, not on elements
    if (e.target === e.currentTarget || e.target.closest('.canvas-background')) {
      onElementSelect(null);
    }
  };  

  const handleSave = () => {
    setIsEditing(false);
    onPagetitleUpdate({
      'pageTitle': cardtitle,
      'pageDescription': carddescription,
      'pageindex': pageuniqid
    });
  };

  // Sort elements by position
  const sortedElements = [...elements].sort((a, b) => a.position - b.position);
  
  return (
    <div className="flex-1 bg-gray-100">
      <Card className="max-w-full border-2 transition-all duration-200">
        <CardContent className="p-0 flex flex-col">
          <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between space-y-0">
            <div className="flex-1">
              {isEditing ? (
                <>
                  <Input
                    value={cardtitle}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mb-2"
                    placeholder="Page title"
                  />
                  <Textarea
                    value={carddescription}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Page description"
                    rows={2}
                  />
                </>
              ) : (
                <>
                  <CardTitle className="text-base 2xl:text-lg">{cardtitle}</CardTitle>
                  <CardDescription className="mt-1">{carddescription}</CardDescription>
                </>
              )}
            </div>

            <div className="ml-2 flex-shrink-0">
              {isEditing ? (
                <Button size="sm" onClick={handleSave} className="h-8">
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-8"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>

          <div 
            ref={setNodeRef} 
            onClick={handleCanvasClick}
            className={cn(
              "min-h-96 mx-4 mb-4 rounded-lg border-2 border-dashed transition-all duration-300",
              isOver 
                ? 'border-blue-500 bg-blue-50 shadow-inner scale-[1.01]' 
                : 'border-gray-300 bg-white'
            )}
          >
            {elements.length === 0 ? (
              <div className={cn(
                "canvas-background flex items-center justify-center h-96 text-gray-500 transition-all duration-300",
                isOver && "scale-95"
              )}>
                <div className="text-center">
                  <PackagePlus className={cn(
                    "h-16 w-16 mx-auto mb-4 text-gray-400 transition-all duration-300",
                    isOver && "text-blue-500 scale-110"
                  )} />
                  <div className="text-lg font-medium mb-2">
                    {isOver ? "Drop element here" : "Drag elements here to build your form"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {isOver ? "Release to add" : "Choose from the sidebar to get started"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-4 2xl:p-6">
                <SortableContext 
                  items={sortedElements.map(el => el._id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {sortedElements.map((element) => (
                    <SortableElement 
                      key={element._id} 
                      element={element} 
                      onEdit={onElementEdit} 
                      onDelete={onElementDelete} 
                      isSelected={selectedElementId === element._id} 
                      onSelect={onElementSelect}
                    >
                      <FormElementRenderer element={element} preview={true} />
                    </SortableElement>
                  ))}
                </SortableContext>
                
                {/* Drop zone at the bottom */}
                {isOver && (
                  <div className="h-12 border-2 border-dashed border-blue-500 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-sm font-medium animate-pulse">
                    <PackagePlus className="h-4 w-4 mr-2" />
                    Drop here to add element at the end
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}