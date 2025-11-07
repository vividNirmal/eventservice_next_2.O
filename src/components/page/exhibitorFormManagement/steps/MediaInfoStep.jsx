import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Upload, File, Plus } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const MediaInfoStep = ({ formData, handleInputChange, errors, imageHandlers }) => {
  const { mediaInfo } = formData;
  const docInputRef = useRef(null);

  const { handleImageUpload, removeImage } = imageHandlers;

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newDocs = files.map(file => ({
        name: '', // Empty name for user to fill
        path: URL.createObjectURL(file),
        file: file,
        fileName: file.name // Store original file name
      }));
      
      handleInputChange(
        'mediaInfo.supporting_documents', 
        [...mediaInfo.supporting_documents, ...newDocs]
      );
    }
  };

  const removeDocument = (index) => {
    const updatedDocs = mediaInfo.supporting_documents.filter((_, i) => i !== index);
    handleInputChange('mediaInfo.supporting_documents', updatedDocs);
  };

  const updateDocumentName = (index, name) => {
    const updatedDocs = [...mediaInfo.supporting_documents];
    updatedDocs[index] = { ...updatedDocs[index], name };
    handleInputChange('mediaInfo.supporting_documents', updatedDocs);
  };

  const addNewDocument = () => {
    docInputRef.current?.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Important Instructions Image - Fixed integration */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Upload Important Instructions</Label>
        <ImageUpload 
          label=""
          preview={mediaInfo.important_instructions_image_preview}
          onUpload={handleImageUpload('mediaInfo.important_instructions_image', 'mediaInfo.important_instructions_image_preview')}
          onRemove={removeImage('mediaInfo.important_instructions_image', 'mediaInfo.important_instructions_image_preview')}
          uploadId="instructions-image-upload"
          recommendedSize="Recommended size: 1MB"
        />
      </div>

      {/* Supporting Documents Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-semibold">Upload Supporting Documents (PDF)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewDocument}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>

        {/* Hidden file input */}
        <Input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          ref={docInputRef}
          onChange={handleDocumentUpload}
          className="hidden"
        />

        {/* Documents List */}
        <div className="space-y-4">
          {mediaInfo.supporting_documents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No supporting documents added</p>
                <p className="text-sm mt-2">Click "Add New" to upload documents</p>
              </CardContent>
            </Card>
          ) : (
            mediaInfo.supporting_documents.map((doc, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      #{index + 1}
                    </span>
                    Upload Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Document Title Input */}
                  <div className="space-y-2">
                    <Label htmlFor={`doc-name-${index}`}>Title</Label>
                    <Input
                      id={`doc-name-${index}`}
                      type="text"
                      value={doc.name}
                      onChange={(e) => updateDocumentName(index, e.target.value)}
                      placeholder="Enter document title"
                      className="w-full"
                    />
                  </div>

                  {/* File Info and Actions */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">
                          {doc.name || doc.fileName || 'Untitled Document'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doc.file ? `Size: ${(doc.file.size / 1024 / 1024).toFixed(2)}MB` : 'File uploaded'}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaInfoStep;