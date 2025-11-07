import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Upload, File, Plus, Image as ImageIcon, X, Download } from 'lucide-react';

const MediaInfoStep = ({ formData, handleInputChange, errors, imageHandlers, isEditMode }) => {
  const { mediaInfo } = formData;
  const docInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Image selected:', file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('mediaInfo.important_instructions_image', file);
        handleInputChange('mediaInfo.important_instructions_image_preview', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    handleInputChange('mediaInfo.important_instructions_image', null);
    handleInputChange('mediaInfo.important_instructions_image_preview', null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const currentDocs = mediaInfo.supporting_documents || [];
      const newDocs = files.map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for default name
        fileName: file.name,
        file: file,
        path: URL.createObjectURL(file),
        isNew: true // Mark as new document
      }));
      
      handleInputChange(
        'mediaInfo.supporting_documents', 
        [...currentDocs, ...newDocs]
      );
    }
  };

  const removeDocument = (index) => {
    const updatedDocs = [...mediaInfo.supporting_documents];
    
    if (updatedDocs[index].path && !updatedDocs[index].file) {
      // Existing document - mark for deletion
      updatedDocs[index].deleted = true;
    } else {
      // New document - remove completely
      updatedDocs.splice(index, 1);
    }
    
    handleInputChange('mediaInfo.supporting_documents', updatedDocs);
  };

  const restoreDocument = (index) => {
    const updatedDocs = [...mediaInfo.supporting_documents];
    delete updatedDocs[index].deleted;
    handleInputChange('mediaInfo.supporting_documents', updatedDocs);
  };

  const updateDocumentName = (index, name) => {
    const updatedDocs = [...mediaInfo.supporting_documents];
    updatedDocs[index] = { 
      ...updatedDocs[index], 
      name,
      nameChanged: true // Mark that name was changed
    };
    handleInputChange('mediaInfo.supporting_documents', updatedDocs);
  };

  const addNewDocument = () => {
    docInputRef.current?.click();
  };

  const downloadDocument = (doc) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else if (doc.path && doc.path.startsWith('blob:')) {
      // For new uploaded files, create download link
      const link = document.createElement('a');
      link.href = doc.path;
      link.download = doc.fileName || doc.name;
      link.click();
    }
  };

  // Filter out deleted documents for display (but keep in array for submission)
  const displayDocuments = mediaInfo.supporting_documents?.filter(doc => !doc.deleted) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Important Instructions Image */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Upload Important Instructions</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/50">
          {mediaInfo.important_instructions_image_preview ? (
            <div className="space-y-4">
              <div className="relative mx-auto max-w-md">
                <img
                  src={mediaInfo.important_instructions_image_preview}
                  alt="Upload preview"
                  className="w-full h-48 object-contain rounded-lg border"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    className="bg-white/90 hover:bg-white shadow-sm"
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="bg-white/90 hover:bg-white shadow-sm"
                  >
                    <X className="h-4 w-4 text-black" />
                  </Button>
                </div>
              </div>
              <p className="text-center text-sm text-green-600">
                Image uploaded successfully!
              </p>
            </div>
          ) : mediaInfo.important_instructions_image_url ? (
            <div className="space-y-4">
              <div className="relative mx-auto max-w-md">
                <img
                  src={mediaInfo.important_instructions_image_url}
                  alt="Current instructions"
                  className="w-full h-48 object-contain rounded-lg border"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    className="bg-white/90 hover:bg-white shadow-sm"
                  >
                    Change
                  </Button>
                </div>
              </div>
              <p className="text-center text-sm text-blue-600">
                Current image
              </p>
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
                  Recommended size: 1MB
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 mx-auto"
              >
                <Upload className="h-4 w-4" />
                Choose Image
              </Button>
            </div>
          )}
          
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
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
          {displayDocuments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No supporting documents added</p>
                <p className="text-sm mt-2">Click "Add New" to upload documents</p>
              </CardContent>
            </Card>
          ) : (
            displayDocuments.map((doc, index) => {
              const originalIndex = mediaInfo.supporting_documents.findIndex(d => d === doc);
              return (
                <Card key={originalIndex} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        #{originalIndex + 1}
                      </span>
                      {doc.isNew ? 'New Document' : 'Existing Document'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Document Title Input */}
                    <div className="space-y-2">
                      <Label htmlFor={`doc-name-${originalIndex}`}>Title</Label>
                      <Input
                        id={`doc-name-${originalIndex}`}
                        type="text"
                        value={doc.name}
                        onChange={(e) => updateDocumentName(originalIndex, e.target.value)}
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
                            {doc.file ? `New upload - Size: ${(doc.file.size / 1024 / 1024).toFixed(2)}MB` : 
                             doc.url ? 'Existing document' : 'New document'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(doc.url || doc.path) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadDocument(doc)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(originalIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Show deleted documents count */}
        {mediaInfo.supporting_documents?.filter(doc => doc.deleted).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              {mediaInfo.supporting_documents.filter(doc => doc.deleted).length} document(s) marked for deletion. 
              They will be removed when you save the form.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaInfoStep;