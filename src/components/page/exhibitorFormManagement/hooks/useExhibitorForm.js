import { useState, useCallback } from 'react';
import { INITIAL_FORM_DATA } from '../constants/exhibitorFormConstants';

export const useExhibitorForm = (editData = null) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const setByPath = (prev, path, value) => {
    const keys = path.split('.');
    const newState = { ...prev };
    let cursor = newState;
    let prevCursor = prev;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      cursor[key] = { ...(prevCursor?.[key] || {}) };
      cursor = cursor[key];
      prevCursor = prevCursor?.[key];
    }
    cursor[keys[keys.length - 1]] = value;
    return newState;
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        return setByPath(prev, field, value);
      }
      return { ...prev, [field]: value };
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleArrayFieldChange = useCallback((field, value, operation = 'add') => {
    setFormData(prev => {
      const keys = field.split('.');
      let cursor = prev;
      
      for (let i = 0; i < keys.length - 1; i++) {
        cursor = cursor[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      const currentArray = cursor[lastKey] || [];

      let newArray;
      switch (operation) {
        case 'add':
          newArray = [...currentArray, value];
          break;
        case 'remove':
          newArray = currentArray.filter(item => item !== value);
          break;
        case 'remove-index':
          newArray = currentArray.filter((_, index) => index !== value);
          break;
        default:
          newArray = currentArray;
      }

      return setByPath(prev, field, newArray);
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setIsEditMode(false);
    setErrors({});
  }, []);

  const initializeEditData = useCallback((editData) => {
    if (editData) {
      setIsEditMode(true);
      setFormData({
        ...editData,
        mediaInfo: {
          ...editData.mediaInfo,
          important_instructions_image_preview: editData.mediaInfo?.important_instructions_image || null
        }
      });
    } else {
      setIsEditMode(false);
      setFormData(INITIAL_FORM_DATA);
    }
  }, []);

  return {
    formData,
    setFormData,
    isEditMode,
    errors,
    setErrors,
    handleInputChange,
    handleArrayFieldChange,
    resetForm,
    initializeEditData
  };
};