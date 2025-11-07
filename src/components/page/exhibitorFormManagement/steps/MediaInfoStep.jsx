import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Upload, File } from 'lucide-react';

const MediaInfoStep = ({ formData, handleInputChange, errors, imageHandlers }) => {
  const { mediaInfo } = formData;
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  const { handleImageUpload, removeImage } = imageHandlers;

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const newDoc = {
        name: file.name,
        path: URL.createObjectURL(file),
        file: file
      };
      handleInputChange('mediaInfo.supporting_documents', [...mediaInfo.supporting_documents, newDoc]);
    });
  };

  const removeDocument = (index) => {
    const updatedDocs = mediaInfo.supporting_documents.filter((_, i) => i !== index);
    handleInputChange('mediaInfo.supporting_documents', updatedDocs);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Important Instructions Image */}
      <div className="space-y-4">
        <Label>Important Instructions Image</Label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
          {mediaInfo.important_instructions_image_preview ? (
            <div className="relative">
              <img 
                src={mediaInfo.important_instructions_image_preview} 
                alt="Important instructions" 
                className="max-h-64 rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage('mediaInfo.important_instructions_image', 'mediaInfo.important_instructions_image_preview')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">Upload important instructions image</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('instructions-image').click()}
              >
                Select Image
              </Button>
              <Input
                id="instructions-image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload('mediaInfo.important_instructions_image', 'mediaInfo.important_instructions_image_preview')}
                className="hidden"
              />
            </>
          )}
        </div>
      </div>

      {/* Supporting Documents */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Supporting Documents</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => docInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Documents
          </Button>
        </div>

        <Input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          ref={docInputRef}
          onChange={handleDocumentUpload}
          className="hidden"
        />

        <div className="space-y-2">
          {mediaInfo.supporting_documents.map((doc, index) => (
            <Card key={index}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.path}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {mediaInfo.supporting_documents.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No supporting documents added
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaInfoStep;