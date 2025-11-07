import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

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
  const [localPreview, setLocalPreview] = useState(null);

  // Use local preview if provided preview is not available
  const displayPreview = preview || localPreview;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setLocalPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Call the parent handler
      if (onUpload) {
        onUpload(e);
      }
    }
  };

  const handleRemove = () => {
    setLocalPreview(null);
    if (onRemove) {
      onRemove();
    }
    // Reset the file input
    const fileInput = document.getElementById(uploadId);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <Label className="text-base font-medium">{label}</Label>}
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
        {displayPreview ? (
          <div className="space-y-4">
            <div className="relative mx-auto max-w-md">
              <img
                src={displayPreview}
                alt="Upload preview"
                className="w-full h-48 object-contain rounded-lg border"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById(uploadId).click()}
                  className="bg-white/90 hover:bg-white shadow-sm"
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="bg-white/90 hover:bg-white shadow-sm"
                >
                  <X className="h-4 w-4" />
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
          onChange={handleFileChange}
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