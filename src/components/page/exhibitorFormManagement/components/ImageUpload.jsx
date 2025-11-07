import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ 
  label, 
  preview, 
  onUpload, 
  onRemove, 
  uploadId, 
  recommendedSize, 
  linkValue = null,
  onLinkChange = null,
  linkPlaceholder = null,
  className = ""
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {label && <Label className="text-base font-medium">{label}</Label>}
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
        {preview ? (
          <div className="space-y-4">
            <div className="relative mx-auto max-w-md">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full h-48 object-contain rounded-lg border"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById(uploadId).click()}
                  className="bg-white/90 hover:bg-white"
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onRemove}
                  className="bg-white/90 hover:bg-white"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <ImageIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Upload Important Instructions Image
              </p>
              <p className="text-xs text-gray-500">
                {recommendedSize || 'PNG, JPG, GIF up to 5MB'}
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(uploadId).click()}
              className="flex items-center gap-2 mx-auto"
            >
              <Upload className="h-4 w-4" />
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
      
      {/* Optional Link Input */}
      {linkValue !== null && onLinkChange && (
        <div className="space-y-2">
          <Label>Image Link (Optional)</Label>
          <Input
            type="url"
            value={linkValue}
            onChange={(e) => onLinkChange(e.target.value)}
            placeholder={linkPlaceholder || "Enter image URL"}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;