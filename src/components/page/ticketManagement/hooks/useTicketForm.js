import { useState, useCallback, useEffect } from 'react';
import { INITIAL_FORM_DATA } from '../constants/ticketConstants';
import { toast } from 'sonner';

export const useTicketForm = (editData = null) => {
  // Initialize form data with companyId from localStorage if available
  const getInitialFormData = useCallback(() => {
    const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;
    return {
      ...INITIAL_FORM_DATA,
      companyId: companyId || null
    };
  }, []);

  const [formData, setFormData] = useState(getInitialFormData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const resetForm = useCallback(() => {
    const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;
    setFormData({
      ...INITIAL_FORM_DATA,
      companyId: companyId || null
    });
    setIsEditMode(false);
    setErrors({});
  }, []);

  const initializeEditData = useCallback(async (editData, fetchFormsByUserType) => {
    if (editData) {
      setIsEditMode(true);
      
      // First fetch forms for the user type if it exists
      if (editData.userType) {
        await fetchFormsByUserType(editData.userType);
      }
      
      // Then set the form data with proper registrationFormId
      setFormData({
        ...editData,
        // Ensure strings for proper form handling
        ticketName: editData.ticketName || null,
        userType: editData.userType || null,
        registrationFormId: editData.registrationFormId?._id || editData.registrationFormId || null,
        ticketCategory: editData.ticketCategory || null,
        serialNoPrefix: editData.serialNoPrefix || null,
        startCount: editData.startCount?.toString() || null,
        description: editData.description || null,
        companyId: editData.companyId || null,
        bannerImage: editData.bannerImage || null,
        bannerImagePreview: editData.bannerImage || null,
        materialNumber: editData.materialNumber || null,
        wbs: editData.wbs || null,
        linkBannerDesktop: editData.linkBannerDesktop || null,
        linkBannerMobile: editData.linkBannerMobile || null,
        desktopBannerImage: editData.desktopBannerImage || null,
        desktopBannerImagePreview: editData.desktopBannerImageUrl || editData.desktopBannerImage || null,
        mobileBannerImage: editData.mobileBannerImage || null,
        mobileBannerImagePreview: editData.mobileBannerImageUrl || editData.mobileBannerImage || null,
        badgeCategory: editData.badgeCategory || null,
        registrationFilterDate: editData.registrationFilterDate
          ? new Date(editData.registrationFilterDate).toISOString().slice(0, 10)
          : null,
        // Ensure slotAmounts has proper structure
        slotAmounts: editData.slotAmounts && editData.slotAmounts.length > 0
          ? editData.slotAmounts.map(slot => ({
            startDateTime: slot.startDateTime ? new Date(slot.startDateTime).toISOString().slice(0, 16) : null,
            endDateTime: slot.endDateTime ? new Date(slot.endDateTime).toISOString().slice(0, 16) : null,
            amount: slot.amount || 0
          }))
          : [{
            startDateTime: null,
            endDateTime: null,
            amount: 0
          }],
        // Ensure arrays are properly initialized
        crossRegisterCategories: editData.crossRegisterCategories || [],
      });
    } else {
      setIsEditMode(false);
      const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;
      setFormData({
        ...INITIAL_FORM_DATA,
        companyId: companyId || null
      });
    }
  }, []);

  return {
    formData,
    setFormData,
    isEditMode,
    errors,
    setErrors,
    handleInputChange,
    resetForm,
    initializeEditData
  };
};