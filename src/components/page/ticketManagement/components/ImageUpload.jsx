import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ImageUpload = ({ 
  label, 
  preview, 
  onUpload, 
  onRemove, 
  uploadId, 
  recommendedSize, 
  linkValue = null,
  onLinkChange = null,
  linkPlaceholder = null
}) => {
  return (
    <div className="space-y-4">
      <div className="text-left flex flex-col gap-1">
        <Label>{label}</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 text-center">
          <div className="text-blue-500 mb-2">
            {preview ? (
              <div className="space-y-2">
                <img
                  src={preview}
                  alt={`${label} preview`}
                  className="max-w-full h-48 object-cover rounded-lg mx-auto"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(uploadId).click()}
                  >
                    Change Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById(uploadId).click()}
                >
                  Choose Image
                </Button>
              </div>
            )}
            <input
              id={uploadId}
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-600">{label}</p>
          {recommendedSize && (
            <p className="text-xs text-gray-500">{recommendedSize}</p>
          )}
        </div>
        
        {linkValue !== null && onLinkChange && (
          <Input
            type="url"
            value={linkValue}
            onChange={(e) => onLinkChange(e.target.value)}
            placeholder={linkPlaceholder}
          />
        )}
      </div>
    </div>
  );
};

export default ImageUpload;