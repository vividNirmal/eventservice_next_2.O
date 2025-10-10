import { getRequest, postRequest, updateRequest } from '@/service/viewService';
import { toast } from 'sonner';

export const fetchTemplateTypesByChannel = async (channel /* 'email' | 'sms' | 'whatsapp' */) => {
  try {
    // TemplateType: module=ticket, type=<channel>
    const res = await getRequest(`template-types?module=ticket&type=${channel}`);
    if (res.status === 1) {
      return res.data?.templateTypes || res.data || [];
    }
  } catch (e) {
    console.error('fetchTemplateTypesByChannel error', e);
  }
  return [];
};

// Fetch both admin Templates and user UserTemplates for a specific typeId
export const fetchTemplatesForTypeId = async ({ typeId, channel, eventId, companyId }) => {
  try {
    const [adminRes, userRes] = await Promise.all([
      getRequest(`templates?type=${channel}&typeId=${typeId}&status=active`),
      getRequest(
        `user-templates?type=${channel}&typeId=${typeId}&status=active${eventId ? `&eventId=${eventId}` : ''}${companyId ? `&companyId=${companyId}` : ''}`
      ),
    ]);
    const admin = (adminRes.status === 1 ? (adminRes.data?.templates || adminRes.data || []) : []);
    const user = (userRes.status === 1 ? (userRes.data?.templates || userRes.data || []) : []);

    // Normalize records to { _id, name, isCustom, templateRef }
    const adminNorm = admin.map(t => ({
      _id: t._id,
      name: t.name || t.subject || 'Untitled',
      isCustom: false,
      templateRef: 'Template',
    }));
    const userNorm = user.map(t => ({
      _id: t._id,
      name: t.name || t.subject || 'Untitled',
      isCustom: true,
      templateRef: 'UserTemplate',
    }));

    return { admin: adminNorm, user: userNorm };
  } catch (e) {
    console.error('fetchTemplatesForTypeId error', e);
    return { admin: [], user: [] };
  }
};

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

  // Prepare ticketAmount based on selected type only
  const prepareTicketAmount = () => {
    const { ticketAmount } = formData;
    
    // Base structure with type
    const baseAmount = {
      type: ticketAmount.type,
      feeSetting: ticketAmount.feeSetting,
      materialNumber: ticketAmount.materialNumber || null,
      wbs: ticketAmount.wbs || null
    };

    switch (ticketAmount.type) {
      case 'free':
        // For free tickets, only send type and optional fields
        return baseAmount;

      case 'dateSlab':
        // For dateSlab, only send dateRangeAmounts and currency
        return {
          ...baseAmount,
          currency: ticketAmount.currency,
          dateRangeAmounts: ticketAmount.dateRangeAmounts
            .filter(slab => slab.startDateTime && slab.endDateTime) // Only include valid slabs
            .map(slab => ({
              startDateTime: new Date(slab.startDateTime),
              endDateTime: new Date(slab.endDateTime),
              amount: Number(slab.amount) || 0
            }))
        };

      case 'businessSlab':
        // For businessSlab, only send businessSlabs and currency
        return {
          ...baseAmount,
          currency: ticketAmount.currency,
          businessSlabs: ticketAmount.businessSlabs
            .filter(slab => slab.startDateTime && slab.endDateTime) // Only include valid slabs
            .map(slab => ({
              startDateTime: new Date(slab.startDateTime),
              endDateTime: new Date(slab.endDateTime),
              categoryAmounts: (slab.categoryAmounts || [])
                .filter(cat => cat.category && cat.amount > 0) // Only include valid categories
                .map(cat => ({
                  category: cat.category,
                  amount: Number(cat.amount) || 0
                }))
            }))
            .filter(slab => slab.categoryAmounts.length > 0) // Only include slabs with valid categories
        };

      default:
        return baseAmount;
    }
  };

  const ticketAmountForSubmission = prepareTicketAmount();

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

      if (key === 'ticketAmount') {
        // Stringify only the relevant ticketAmount data
        formDataToSend.append('ticketAmount', JSON.stringify(ticketAmountForSubmission));
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
      } else if (key === 'bannerImage' || key === 'desktopBannerImage' || key === 'mobileBannerImage') {
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
      ticketAmount: ticketAmountForSubmission,
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
    delete submitData.loginBannerImage;
    delete submitData.mobileBannerImagePreview;
    delete submitData.loginBannerImagePreview;
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