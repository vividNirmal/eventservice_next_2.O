import { getRequest, postRequest, updateRequest } from '@/service/viewService';
import { toast } from 'sonner';

// export const fetchTemplateTypesByChannel = async (channel /* 'email' | 'sms' | 'whatsapp' */) => {
//   try {
//     // TemplateType: module=ticket, type=<channel>
//     const res = await getRequest(`template-types?module=ticket&type=${channel}`);
//     if (res.status === 1) {
//       return res.data?.templateTypes || res.data || [];
//     }
//   } catch (e) {
//     console.error('fetchTemplateTypesByChannel error', e);
//   }
//   return [];
// };

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

export const submitExhibitorFormData = async (formData, isEditMode, editData, eventId) => {
  try {
    const submitData = prepareFormDataForSubmission(formData, isEditMode, eventId);
    
    console.log('Submitting form data:', submitData); // Debug log
    
    const response = isEditMode
      ? await updateRequest(`exhibitor-forms/${editData._id}`, submitData)
      : await postRequest('exhibitor-forms', submitData);

    if (response.status === 1) {
      toast.success(`Form ${isEditMode ? 'updated' : 'created'} successfully`);
      return { success: true };
    } else {
      toast.error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} form`);
      return { success: false, error: response.message };
    }
  } catch (error) {
    console.error(`Error ${isEditMode ? 'updating' : 'creating'} form:`, error);
    toast.error(`Failed to ${isEditMode ? 'update' : 'create'} form`);
    return { success: false, error: error.message };
  }
};

export const prepareFormDataForSubmission = (formData, isEditMode, eventId) => {
  const hasFiles = formData.mediaInfo?.important_instructions_image || 
    (formData.mediaInfo?.supporting_documents && formData.mediaInfo.supporting_documents.length > 0);
  
  const companyId = localStorage.getItem('companyId');

  if (hasFiles) {
    const formDataToSend = new FormData();
    
    // Add basicInfo as JSON string
    formDataToSend.append('basicInfo', JSON.stringify(formData.basicInfo));
    
    // Add otherInfo as JSON string
    formDataToSend.append('otherInfo', JSON.stringify(formData.otherInfo));
    
    // Add notifications as JSON string
    formDataToSend.append('notifications', JSON.stringify(formData.notifications));
    
    // Handle important instructions image - FIXED
    if (formData.mediaInfo.important_instructions_image) {
      formDataToSend.append('important_instructions_image', formData.mediaInfo.important_instructions_image);
    } else {
      console.log('No important instructions image found');
    }
    
    // Handle supporting documents
    if (formData.mediaInfo.supporting_documents && formData.mediaInfo.supporting_documents.length > 0) {
      formData.mediaInfo.supporting_documents.forEach((doc, index) => {
        if (doc.file) {
          // Append file with index to maintain order
          formDataToSend.append(`supporting_documents[${index}][file]`, doc.file);
          // Append document name with the same index
          formDataToSend.append(`supporting_documents[${index}][name]`, doc.name || doc.fileName);
        }
      });
    }

    if (companyId && !isEditMode) {
      formDataToSend.append('companyId', companyId);
    }
    if (eventId && !isEditMode) {
      formDataToSend.append('eventId', eventId);
    }

    // Debug: Log all form data entries
    console.log('FormData entries:');
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ', ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
    }

    return formDataToSend;
  } else {
    // For non-file submissions
    const submitData = {
      basicInfo: formData.basicInfo,
      otherInfo: formData.otherInfo,
      notifications: formData.notifications,
      mediaInfo: {
        important_instructions_image: formData.mediaInfo.important_instructions_image,
        supporting_documents: formData.mediaInfo.supporting_documents?.map(doc => ({
          name: doc.name,
          path: doc.path,
        })).filter(doc => doc.name && doc.path)
      }
    };

    // Remove preview fields
    delete submitData.mediaInfo.important_instructions_image_preview;

    if (companyId && !isEditMode) {
      submitData.companyId = companyId;
    }
    if (eventId && !isEditMode) {
      submitData.eventId = eventId;
    }

    if (isEditMode) {
      delete submitData.createdAt;
      delete submitData.updatedAt;
      delete submitData.__v;
      delete submitData._id;
    }

    return submitData;
  }
};

// Update the template fetch functions to accept module parameter
export const fetchTemplateTypesByChannel = async (channel, module = 'exhibitor-form') => {
  try {
    const res = await getRequest(`template-types?module=${module}&type=${channel}`);
    if (res.status === 1) {
      return res.data?.templateTypes || res.data || [];
    }
  } catch (e) {
    console.error('fetchTemplateTypesByChannel error', e);
  }
  return [];
};