import { useState, useCallback, useEffect } from 'react';
import { INITIAL_FORM_DATA } from '../constants/ticketConstants';
import { toast } from 'sonner';

export const useTicketForm = (editData = null) => {
  // Initialize form data with companyId from localStorage if available
  const getInitialFormData = useCallback(() => {
    const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;
    return {
      ...INITIAL_FORM_DATA,
      // companyId: companyId || null
    };
  }, []);

  const [formData, setFormData] = useState(getInitialFormData);
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


  const handleInputChange = useCallback(
    (field, value) => {
      setFormData(prev => {
        if (field.includes('.')) {
          return setByPath(prev, field, value);
        }
        return { ...prev, [field]: value };
      });

      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // const handleInputChange = useCallback((field, value) => {
  //   setFormData(prev => {
  //     if (field.includes('.')) {
  //       // Handle nested updates
  //       const [parent, child] = field.split('.');
  //       return {
  //         ...prev,
  //         [parent]: {
  //           ...prev[parent],
  //           [child]: value
  //         }
  //       };
  //     } else {
  //       // Flat update
  //       return {
  //         ...prev,
  //         [field]: value
  //       };
  //     }
  //   });

  //   // Clear error for this field when user starts typing
  //   if (errors[field]) {
  //     setErrors(prev => ({
  //       ...prev,
  //       [field]: undefined
  //     }));
  //   }
  // }, [errors]);

  const resetForm = useCallback(() => {
    const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;
    setFormData({
      ...INITIAL_FORM_DATA,
      // companyId: companyId || null
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
        advancedSettings: {
          ticketBuyLimitMin: editData.advancedSettings?.ticketBuyLimitMin || 1,
          ticketBuyLimitMax: editData.advancedSettings?.ticketBuyLimitMax || 10,
          hasQuantityLimit: editData.advancedSettings?.hasQuantityLimit || false,
          badgeCategory: editData.advancedSettings?.badgeCategory || 'visitor',
          registrationFilterDate: editData.advancedSettings?.registrationFilterDate
            ? new Date(editData.advancedSettings.registrationFilterDate).toISOString().slice(0, 10)
            : null,
          allowCrossRegister: editData.advancedSettings?.allowCrossRegister || false,
          crossRegisterCategories: editData.advancedSettings?.crossRegisterCategories || [],
          autoApprovedUser: editData.advancedSettings?.autoApprovedUser || false,
          authenticateByOTP: editData.advancedSettings?.authenticateByOTP || false,
          autoPassword: editData.advancedSettings?.autoPassword || false,
          addAllDiscount: editData.advancedSettings?.addAllDiscount || false,
          individualDiscount: editData.advancedSettings?.individualDiscount || false
        },
        notifications: {
          emailNotification: {
            enabled: editData.notifications?.emailNotification?.enabled ?? false,
            templates: (editData.notifications?.emailNotification?.templates || []).map(t => ({
              typeId: t.typeId?._id || t.typeId,
              templateId: t.templateId?._id || t.templateId,
              actionType: t.actionType || '',
              isCustom: !!t.isCustom,
              // templateRef optional; backend defaults it via pre-save
            })),
          },
          smsNotification: {
            enabled: editData.notifications?.smsNotification?.enabled ?? false,
            templates: (editData.notifications?.smsNotification?.templates || []).map(t => ({
              typeId: t.typeId?._id || t.typeId,
              templateId: t.templateId?._id || t.templateId,
              actionType: t.actionType || '',
              isCustom: !!t.isCustom,
            })),
          },
          whatsappNotification: {
            enabled: editData.notifications?.whatsappNotification?.enabled ?? false,
            templates: (editData.notifications?.whatsappNotification?.templates || []).map(t => ({
              typeId: t.typeId?._id || t.typeId,
              templateId: t.templateId?._id || t.templateId,
              actionType: t.actionType || '',
              isCustom: !!t.isCustom,
            })),
          }
        },
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
        ctaSettings: editData.ctaSettings || [],
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