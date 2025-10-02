import { getRequest, postRequest, updateRequest } from '@/service/viewService';
import { toast } from 'sonner';

export const fetchFormsByUserType = async (userType, eventId, setAvailableForms) => {
  try {
    // Include both userType and eventId in the query
    const response = await getRequest(`forms?userType=${userType}&eventId=${eventId}`);

    if (response.status === 1) {
      setAvailableForms(response.data.forms || []);
    } else {
      console.warn('Failed to fetch forms:', response.message);
      setAvailableForms([]);
    }
  } catch (error) {
    console.error('Error fetching forms:', error);
    setAvailableForms([]);
  }
};

export const prepareFormDataForSubmission = (formData, isEditMode, eventId) => {
  const hasFiles = formData.bannerImage || formData.desktopBannerImage || formData.mobileBannerImage;
  const companyId = localStorage.getItem('companyId');

  if (hasFiles) {
    // Use FormData for file uploads
    const formDataToSend = new FormData();
    // Add all form fields
    Object.keys(formData).forEach(key => {
      // Skip system fields in edit mode
      if (isEditMode && (key === '_id' || key === 'createdAt' || key === 'updatedAt' || key === '__v')) {
        return;
      }

      // Skip URL fields that come from backend and preview fields
      if (key.endsWith('Url') || key.includes('Preview')) {
        return;
      }

      if (key === 'slotAmounts') {
        // Handle slot amounts array - stringify for FormData
        const slots = formData.isFree ? [] : formData.slotAmounts.map(slot => ({
          ...slot,
          startDateTime: new Date(slot.startDateTime),
          endDateTime: new Date(slot.endDateTime),
          amount: Number(slot.amount)
        }));
        formDataToSend.append(key, JSON.stringify(slots));
      } else if (key === 'ctaSettings') {
        // Handle array fields
        formData[key].forEach((item, index) => {
          formDataToSend.append(`ctaSettings[${index}]`, item);
        });
      } else if (key === 'advancedSettings') {
        // Send advancedSettings as JSON string
        formDataToSend.append('advancedSettings', JSON.stringify(formData.advancedSettings));
      } else if (key === 'notifications') {
        // Send notifications as JSON string
        formDataToSend.append('notifications', JSON.stringify(formData.notifications));
      }
      
      // else if (key === 'crossRegisterCategories') {
      //   // Handle array fields
      //   formData[key].forEach((item, index) => {
      //     formDataToSend.append(`crossRegisterCategories[${index}]`, item);
      //   });
      // } 
      else if (key === 'bannerImage' || key === 'desktopBannerImage' || key === 'mobileBannerImage') {
        // Handle file uploads
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      } else if (formData[key] !== null && formData[key] !== undefined) {
        // Handle other fields
        if (key === 'startCount' || key === 'ticketPerUser' || key === 'ticketBuyLimitMin' || key === 'ticketBuyLimitMax') {
          formDataToSend.append(key, Number(formData[key]));
        } else if (key === 'registrationFilterDate') {
          if (formData[key]) {
            formDataToSend.append(key, new Date(formData[key]).toISOString());
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    if (companyId && !isEditMode) {
      formDataToSend.append('companyId', companyId);
    }
    if (eventId && !isEditMode) {
      formDataToSend.append('eventId', eventId);
    }

    return formDataToSend;
  } else {
    // Use JSON for non-file submissions
    const submitData = {
      ...formData,
      // Convert string dates to Date objects for slot amounts
      slotAmounts: formData.isFree ? [] : formData.slotAmounts.map(slot => ({
        ...slot,
        startDateTime: new Date(slot.startDateTime),
        endDateTime: new Date(slot.endDateTime),
        amount: Number(slot.amount)
      })),
      startCount: Number(formData.startCount),
      ticketPerUser: Number(formData.ticketPerUser),
      advancedSettings: {
        ...formData.advancedSettings,
        ticketBuyLimitMin: Number(formData.advancedSettings.ticketBuyLimitMin),
        ticketBuyLimitMax: Number(formData.advancedSettings.ticketBuyLimitMax),
        registrationFilterDate: formData.advancedSettings.registrationFilterDate
          ? new Date(formData.advancedSettings.registrationFilterDate)
          : null
      },
      notifications: {
        ...formData.notifications
      }

    };

    // Remove file-related fields when not using FormData
    delete submitData.bannerImage;
    delete submitData.bannerImagePreview;
    delete submitData.desktopBannerImage;
    delete submitData.desktopBannerImagePreview;
    delete submitData.mobileBannerImage;
    delete submitData.mobileBannerImagePreview;
    delete submitData.desktopBannerImageUrl;
    delete submitData.mobileBannerImageUrl;
    delete submitData.bannerImageUrl;

    // If it is update mode then remove system fields
    if (isEditMode) {
      delete submitData.createdAt;
      delete submitData.updatedAt;
      delete submitData.__v;
      delete submitData._id;
    }

    if (companyId && !isEditMode) {
      submitData.companyId = companyId;
    }
    if (eventId && !isEditMode) {
      submitData.eventId = eventId;
    }

    return submitData;
  }
};

export const submitTicketData = async (formData, isEditMode, editData, eventId) => {
  try {
    const submitData = prepareFormDataForSubmission(formData, isEditMode, eventId);

    console.log(`${isEditMode ? 'Updating' : 'Creating'} ticket data`);

    const response = isEditMode
      ? await updateRequest(`tickets/${editData._id}`, submitData)
      : await postRequest('tickets', submitData);

    if (response.status === 1) {
      toast.success(`Ticket ${isEditMode ? 'updated' : 'created'} successfully`);
      return { success: true };
    } else {
      toast.error(response.message || response.errors?.message || `Failed to ${isEditMode ? 'update' : 'create'} ticket`);
      return { success: false, error: response.message || response.errors?.message };
    }
  } catch (error) {
    console.error(`Error ${isEditMode ? 'updating' : 'creating'} ticket:`, error);
    toast.error(`Failed to ${isEditMode ? 'update' : 'create'} ticket`);
    return { success: false, error: error.message };
  }
};