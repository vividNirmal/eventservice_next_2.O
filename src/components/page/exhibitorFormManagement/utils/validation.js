// export const validateBasicInfo = (formData) => {
//   const errors = {};
  
//   if (!formData.ticketName?.trim()) {
//     errors.ticketName = 'Ticket name is required';
//   }
  
//   if (!formData.userType) {
//     errors.userType = 'User type is required';
//   }
  
//   if (!formData.ticketCategory) {
//     errors.ticketCategory = 'Ticket category is required';
//   }
  
//   if (!formData.serialNoPrefix?.trim()) {
//     errors.serialNoPrefix = 'Serial no prefix is required';
//   } else {
//     const prefix = formData.serialNoPrefix.trim();
//     if (prefix.length < 2) {
//       errors.serialNoPrefix = 'Serial no prefix must be at least 2 characters';
//     } else if (prefix.length > 7) {
//       errors.serialNoPrefix = 'Serial no prefix cannot exceed 7 characters';
//     } else if (!/^[A-Za-z]+$/.test(prefix)) {
//       errors.serialNoPrefix = 'Serial no prefix must contain only alphabetic letters (A-Z)';
//     }
//   }


///////////////////////

//   // Validate startCount
//   const startCount = formData.startCount || '0000';
//   if (!/^[0-9]+$/.test(startCount)) {
//     errors.startCount = 'Start count must contain only numbers (0-9)';
//   } else if (startCount.length < 4) {
//     errors.startCount = 'Start count must be at least 4 digits';
//   } else if (startCount.length > 6) {
//     errors.startCount = 'Start count cannot exceed 6 digits';
//   }

//   if (!formData.registrationFormId) {
//     errors.registrationFormId = 'Registration form is required';
//   }
//   return errors;
// };

// export const validateTicketAmount = (formData) => {
//   const errors = {};
//   const { ticketAmount } = formData;
  
//   if (ticketAmount.type !== 'free') {
//     if (!ticketAmount.currency) {
//       errors.currency = 'Currency is required for paid tickets';
//     }
    
//     if (!ticketAmount.feeSetting) {
//       errors.feeSetting = 'Fee setting is required for paid tickets';
//     }
    
//     // Validate date slabs
//     if (ticketAmount.type === 'dateSlab') {
//       if (!ticketAmount.dateRangeAmounts || ticketAmount.dateRangeAmounts.length === 0) {
//         errors.dateRangeAmounts = 'At least one date slab is required';
//       } else {
//         ticketAmount.dateRangeAmounts.forEach((slab, index) => {
//           if (!slab.startDateTime) {
//             errors[`dateSlab_${index}_start`] = `Start date is required for slab ${index + 1}`;
//           }
//           if (!slab.endDateTime) {
//             errors[`dateSlab_${index}_end`] = `End date is required for slab ${index + 1}`;
//           }
//           if (slab.amount <= 0) {
//             errors[`dateSlab_${index}_amount`] = `Amount must be greater than 0 for slab ${index + 1}`;
//           }
//         });
//       }
//     }


////////////////////////////
    
//     // Validate business slabs
//     if (ticketAmount.type === 'businessSlab') {
//       if (!ticketAmount.businessSlabs || ticketAmount.businessSlabs.length === 0) {
//         errors.businessSlabs = 'At least one business slab is required';
//       } else {
//         ticketAmount.businessSlabs.forEach((slab, slabIndex) => {
//           if (!slab.startDateTime) {
//             errors[`businessSlab_${slabIndex}_start`] = `Start date is required for business slab ${slabIndex + 1}`;
//           }
//           if (!slab.endDateTime) {
//             errors[`businessSlab_${slabIndex}_end`] = `End date is required for business slab ${slabIndex + 1}`;
//           }
//           if (!slab.categoryAmounts || slab.categoryAmounts.length === 0) {
//             errors[`businessSlab_${slabIndex}_categories`] = `At least one category is required for business slab ${slabIndex + 1}`;
//           } else {
//             slab.categoryAmounts.forEach((category, categoryIndex) => {
//               if (!category.category) {
//                 errors[`businessSlab_${slabIndex}_category_${categoryIndex}_name`] = `Category name is required`;
//               }
//               if (category.amount <= 0) {
//                 errors[`businessSlab_${slabIndex}_category_${categoryIndex}_amount`] = `Amount must be greater than 0`;
//               }
//             });
//           }
//         });
//       }
//     }
//   }
  
//   return errors;
// };


////////////////////////////////////

// export const validateTicketSettings = (formData) => {
//   const errors = {};
  
//   if (!formData.ticketPerUser || formData.ticketPerUser <= 0) {
//     errors.ticketPerUser = 'Ticket per user must be greater than 0';
//   }
  
//   if (!formData.ticketAccess) {
//     errors.ticketAccess = 'Ticket access is required';
//   }
  
//   return errors;
// };

// export const validateAdvancedSettings = (formData) => {
//   const errors = {};
  
//   if (!formData.advancedSettings.ticketBuyLimitMin || formData.advancedSettings.ticketBuyLimitMin <= 0) {
//     errors.ticketBuyLimitMin = 'Minimum buy limit is required';
//   }
  
//   if (!formData.advancedSettings.ticketBuyLimitMax || formData.advancedSettings.ticketBuyLimitMax < formData.advancedSettings.ticketBuyLimitMin) {
//     errors.ticketBuyLimitMax = 'Maximum buy limit must be greater than minimum';
//   }
  
//   return errors;
// };

/////////////////////////////

// export const validateNotifications = () => {
//   // Notifications are optional, so no validation needed
//   return {};
// };

/////////////////////////////////

// export const validateStep = (step, formData) => {
//   switch (step) {
//     case 1:
//       return validateBasicInfo(formData);
//     case 2:
//       return validateTicketAmount(formData);
//     case 3:
//       return validateTicketSettings(formData);
//     case 4:
//       return validateAdvancedSettings(formData);
//     case 5:
//       return validateNotifications(formData);
//     default:
//       return {};
//   }
// };


/////////////////////////


export const validateBasicInfo = (formData) => {
  const errors = {};
  const { basicInfo } = formData;
  
  if (!basicInfo.full_name?.trim()) {
    errors.full_name = 'Form name is required';
  }
  
  if (!basicInfo.form_number || basicInfo.form_number <= 0) {
    errors.form_number = 'Form number must be greater than 0';
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