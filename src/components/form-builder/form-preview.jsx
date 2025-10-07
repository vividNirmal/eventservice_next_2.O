'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormRenderer } from '../form-renderer/form-renderer';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

/**
 * Form Preview Component
 * Shows a preview of how the form will look to end users
 */
export function FormPreview({ form, trigger }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (formData) => {
    // This is just a preview, so we'll just log the data
    console.log('Preview form submission:', formData);
    // Close the preview after a brief delay
    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  const PreviewTrigger = trigger || (
    <Button variant="outline">
      <Eye className="h-4 w-4 mr-2" />
      Preview Form
    </Button>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {PreviewTrigger}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl w-[90vw] max-h-[90vh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Form Preview</DialogTitle>
                <DialogDescription>
                  This is how your form will appear to users
                </DialogDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="py-4">
            {form?.pages?.elements?.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No elements to preview</p>
                <p className="text-sm">Add some form elements to see the preview</p>
              </div>
            ) : (
              <FormRenderer 
                form={form} 
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
