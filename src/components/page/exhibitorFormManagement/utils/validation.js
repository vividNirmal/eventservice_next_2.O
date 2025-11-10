export const validateBasicInfo = (formData) => {
  const errors = {};
  const { basicInfo } = formData;
  
  if (!basicInfo.full_name?.trim()) {
    errors.full_name = 'Form name is required';
  }
  
  if (!basicInfo.form_number || basicInfo.form_number <= 0) {
    errors.form_number = 'Form number must be greater than 0';
  }

  if (!basicInfo.due_date) {
    errors.due_date = 'Due date is required';
  }

  if (!basicInfo.submission_disclaimer?.trim()) {
    errors.submission_disclaimer = 'Submission disclaimer is required';
  }

  if (!basicInfo.form_description?.trim()) {
    errors.form_description = 'Form description is required';
  }

  if (!basicInfo.measurement_unit?.trim()) {
    errors.measurement_unit = 'Measurement unit is required';
  }
  return errors;
};

export const validateMediaInfo = (formData) => {
  const errors = {};
  // Media info is optional, no required validation
  return errors;
};

export const validateOtherInfo = (formData) => {
  const errors = {};
  const { otherInfo } = formData;
  
  if (!otherInfo.terms_and_condition?.trim()) {
    errors.terms_and_condition = 'Terms and conditions are required';
  }
  
  return errors;
};

export const validateNotifications = () => {
  // Notifications are optional
  return {};
};

export const validateStep = (step, formData) => {
  switch (step) {
    case 1:
      return validateBasicInfo(formData);
    case 2:
      return validateMediaInfo(formData);
    case 3:
      return validateOtherInfo(formData);
    case 4:
      return validateNotifications(formData);
    default:
      return {};
  }
};