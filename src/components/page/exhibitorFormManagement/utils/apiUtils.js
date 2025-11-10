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
  const hasNewFiles = formData.mediaInfo?.important_instructions_image instanceof File || 
    (formData.mediaInfo?.supporting_documents && formData.mediaInfo.supporting_documents.some(doc => doc.file));
  
  const companyId = localStorage.getItem('companyId');

  // Use FormData when there are files or in edit mode
  if (hasNewFiles || isEditMode) {
    const formDataToSend = new FormData();
    
    // Add basicInfo as JSON string
    formDataToSend.append('basicInfo', JSON.stringify(formData.basicInfo));
    
    // Add otherInfo as JSON string
    formDataToSend.append('otherInfo', JSON.stringify(formData.otherInfo));
    
    // Add notifications as JSON string
    formDataToSend.append('notifications', JSON.stringify(formData.notifications));
    
    // Add ExhibitorFormConfiguration if present
    if (formData.ExhibitorFormConfiguration) {
      formDataToSend.append('ExhibitorFormConfiguration', formData.ExhibitorFormConfiguration);
    }
    
    // Handle important instructions image
    if (formData.mediaInfo.important_instructions_image instanceof File) {
      formDataToSend.append('important_instructions_image', formData.mediaInfo.important_instructions_image);
    }
    // No else needed - backend will preserve existing if no new file
    
    // Handle supporting documents
    if (formData.mediaInfo.supporting_documents && formData.mediaInfo.supporting_documents.length > 0) {
      if (isEditMode) {
        // EDIT MODE: Use metadata approach
        const supportingDocsMetadata = [];
        
        formData.mediaInfo.supporting_documents.forEach((doc, index) => {
          if (doc.deleted) {
            supportingDocsMetadata.push({
              index,
              action: 'delete',
              path: doc.path
            });
          } else if (doc.file) {
            // New file upload
            formDataToSend.append(`supporting_documents_files`, doc.file);
            supportingDocsMetadata.push({
              index,
              action: 'new',
              name: doc.name || doc.fileName,
              fileIndex: index
            });
          } else if (doc.path) {
            // Existing document
            supportingDocsMetadata.push({
              index,
              action: doc.nameChanged ? 'update' : 'keep',
              name: doc.name,
              path: doc.path
            });
          }
        });
        
        formDataToSend.append('supporting_documents_metadata', JSON.stringify(supportingDocsMetadata));
      } else {
        // CREATE MODE: Simpler approach - all documents are new
        const supportingDocsMetadata = [];
        
        formData.mediaInfo.supporting_documents.forEach((doc, index) => {
          if (doc.file) {
            formDataToSend.append('supporting_documents_files', doc.file);
            supportingDocsMetadata.push({
              index,
              name: doc.name || doc.fileName
            });
          }
        });
        
        if (supportingDocsMetadata.length > 0) {
          formDataToSend.append('supporting_documents_metadata', JSON.stringify(supportingDocsMetadata));
        }
      }
    }

    if (companyId && !isEditMode) {
      formDataToSend.append('companyId', companyId);
    }
    if (eventId && !isEditMode) {
      formDataToSend.append('eventId', eventId);
    }

    return formDataToSend;
  } else {
    // For non-file submissions
    const submitData = {
      basicInfo: formData.basicInfo,
      otherInfo: formData.otherInfo,
      notifications: formData.notifications,
      mediaInfo: {
        supporting_documents: []
      }
    };

    // Add ExhibitorFormConfiguration if present
    if (formData.ExhibitorFormConfiguration) {
      submitData.ExhibitorFormConfiguration = formData.ExhibitorFormConfiguration;
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