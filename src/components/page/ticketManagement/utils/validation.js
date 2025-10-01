export const validateBasicInfo = (formData) => {
  const errors = {};
  
  if (!formData.ticketName?.trim()) {
    errors.ticketName = 'Ticket name is required';
  }
  
  if (!formData.userType) {
    errors.userType = 'User type is required';
  }
  
  if (!formData.ticketCategory) {
    errors.ticketCategory = 'Ticket category is required';
  }
  
  if (!formData.serialNoPrefix?.trim()) {
    errors.serialNoPrefix = 'Serial no prefix is required';
  } else {
    const prefix = formData.serialNoPrefix.trim();
    if (prefix.length < 2) {
      errors.serialNoPrefix = 'Serial no prefix must be at least 2 characters';
    } else if (prefix.length > 7) {
      errors.serialNoPrefix = 'Serial no prefix cannot exceed 7 characters';
    } else if (!/^[A-Za-z]+$/.test(prefix)) {
      errors.serialNoPrefix = 'Serial no prefix must contain only alphabetic letters (A-Z)';
    }
  }

  // Validate startCount
  const startCount = formData.startCount || '0000';
  if (!/^[0-9]+$/.test(startCount)) {
    errors.startCount = 'Start count must contain only numbers (0-9)';
  } else if (startCount.length < 4) {
    errors.startCount = 'Start count must be at least 4 digits';
  } else if (startCount.length > 6) {
    errors.startCount = 'Start count cannot exceed 6 digits';
  }

  if (!formData.registrationFormId) {
    errors.registrationFormId = 'Registration form is required';
  }
  return errors;
};

export const validateTicketAmount = (formData) => {
  const errors = {};
  
  if (!formData.isFree) {
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }
    
    if (!formData.feeSetting) {
      errors.feeSetting = 'Fee setting is required';
    }
    
    if (formData.slotAmounts.length === 0) {
      errors.slotAmounts = 'At least one slot amount is required';
    }
  }
  
  return errors;
};

export const validateTicketSettings = (formData) => {
  const errors = {};
  
  if (!formData.ticketPerUser || formData.ticketPerUser <= 0) {
    errors.ticketPerUser = 'Ticket per user must be greater than 0';
  }
  
  if (!formData.ticketAccess) {
    errors.ticketAccess = 'Ticket access is required';
  }
  
  return errors;
};

export const validateAdvancedSettings = (formData) => {
  const errors = {};
  
  if (!formData.ticketBuyLimitMin || formData.ticketBuyLimitMin <= 0) {
    errors.ticketBuyLimitMin = 'Minimum buy limit is required';
  }
  
  if (!formData.ticketBuyLimitMax || formData.ticketBuyLimitMax < formData.ticketBuyLimitMin) {
    errors.ticketBuyLimitMax = 'Maximum buy limit must be greater than minimum';
  }
  
  return errors;
};

export const validateNotifications = () => {
  // Notifications are optional, so no validation needed
  return {};
};

export const validateStep = (step, formData) => {
  switch (step) {
    case 1:
      return validateBasicInfo(formData);
    case 2:
      return validateTicketAmount(formData);
    case 3:
      return validateTicketSettings(formData);
    case 4:
      return validateAdvancedSettings(formData);
    case 5:
      return validateNotifications(formData);
    default:
      return {};
  }
};