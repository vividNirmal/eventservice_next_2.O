import { useCallback } from 'react';
import { toast } from 'sonner';

export const useImageUpload = (formData, setFormData) => {
  const validateImage = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return false;
    }
    
    return true;
  };

  const handleImageUpload = useCallback((imageField, previewField) => (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [imageField]: file,
          [previewField]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  }, [setFormData]);

  const removeImage = useCallback((imageField, previewField) => () => {
    setFormData(prev => ({
      ...prev,
      [imageField]: null,
      [previewField]: null
    }));
  }, [setFormData]);

  return {
    handleImageUpload,
    removeImage
  };
};