import { useCallback } from 'react';
import { toast } from 'sonner';

export const useImageUpload = (formData, setFormData) => {
  const validateImage = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, JPEG, GIF)');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return false;
    }
    
    return true;
  };

  const validateDocument = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a PDF, Word document, or image file');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleImageUpload = useCallback((imageField, previewField) => (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file); // Debug log
    
    if (file && validateImage(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('FileReader loaded, setting form data'); // Debug log
        setFormData(prev => {
          const updated = {
            ...prev,
            [imageField]: file,
            [previewField]: e.target.result
          };
          console.log('Updated form data:', updated); // Debug log
          return updated;
        });
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } else {
      // Reset the input
      e.target.value = '';
    }
  }, [setFormData]);

  const removeImage = useCallback((imageField, previewField) => () => {
    setFormData(prev => ({
      ...prev,
      [imageField]: null,
      [previewField]: null
    }));
  }, [setFormData]);

  const handleDocumentUpload = useCallback((documentsField) => (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(validateDocument);
    
    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped due to invalid format or size');
    }
    
    if (validFiles.length > 0) {
      const newDocs = validFiles.map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for default name
        path: URL.createObjectURL(file),
        file: file,
        fileName: file.name
      }));
      
      setFormData(prev => ({
        ...prev,
        [documentsField]: [...(prev[documentsField] || []), ...newDocs]
      }));
    }
    
    // Reset the input
    e.target.value = '';
  }, [setFormData]);

  const removeDocument = useCallback((documentsField, index) => {
    setFormData(prev => ({
      ...prev,
      [documentsField]: prev[documentsField].filter((_, i) => i !== index)
    }));
  }, [setFormData]);

  const updateDocumentName = useCallback((documentsField, index, name) => {
    setFormData(prev => {
      const updatedDocs = [...prev[documentsField]];
      updatedDocs[index] = { ...updatedDocs[index], name };
      return {
        ...prev,
        [documentsField]: updatedDocs
      };
    });
  }, [setFormData]);

  return {
    handleImageUpload,
    handleDocumentUpload,
    removeImage,
    removeDocument,
    updateDocumentName,
    validateImage,
    validateDocument
  };
};