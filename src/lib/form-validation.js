/**
 * Form validation utilities
 */

/**
 * Validate a form field value
 * @param {any} value - Field value to validate
 * @param {Array} rules - Validation rules
 * @returns {Object} Validation result
 */
export const validateField = (value, rules = []) => {
  const errors = [];

  for (const rule of rules) {
    const error = validateRule(value, rule);
    if (error) {
      errors.push(error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate a single rule
 * @param {any} value - Value to validate
 * @param {Object} rule - Validation rule
 * @returns {string|null} Error message or null
 */
const validateRule = (value, rule) => {
  const { type, value: ruleValue, message } = rule;

  switch (type) {
    case 'required':
      if (!value || (typeof value === 'string' && !value.trim())) {
        return message || 'This field is required';
      }
      break;

    case 'min':
      if (typeof value === 'string' && value.length < ruleValue) {
        return message || `Minimum length is ${ruleValue} characters`;
      }
      if (typeof value === 'number' && value < ruleValue) {
        return message || `Minimum value is ${ruleValue}`;
      }
      break;

    case 'max':
      if (typeof value === 'string' && value.length > ruleValue) {
        return message || `Maximum length is ${ruleValue} characters`;
      }
      if (typeof value === 'number' && value > ruleValue) {
        return message || `Maximum value is ${ruleValue}`;
      }
      break;

    case 'pattern':
      if (value && !new RegExp(ruleValue).test(value)) {
        return message || 'Invalid format';
      }
      break;

    case 'email':
      if (value && !isValidEmail(value)) {
        return message || 'Please enter a valid email address';
      }
      break;

    default:
      break;
  }

  return null;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate entire form
 * @param {Object} formData - Form data
 * @param {Array} elements - Form elements with validation rules
 * @returns {Object} Validation result
 */
export const validateForm = (formData, elements) => {
  const errors = {};
  let isValid = true;

  elements.forEach(element => {
    if (element.type === 'divider' || element.type === 'heading' || element.type === 'paragraph') {
      return; // Skip non-input elements
    }

    const fieldValue = formData[element.name];
    const validation = validateField(fieldValue, element.validation || []);

    if (!validation.isValid) {
      errors[element.name] = validation.errors;
      isValid = false;
    }
  });

  return {
    isValid,
    errors
  };
};

/**
 * Create validation schema for react-hook-form
 * @param {Array} elements - Form elements
 * @returns {Object} Validation schema
 */
export const createValidationSchema = (elements) => {
  const schema = {};

  elements.forEach(element => {
    if (element.type === 'divider' || element.type === 'heading' || element.type === 'paragraph') {
      return;
    }

    if (element.validation && element.validation.length > 0) {
      schema[element.name] = element.validation;
    }
  });

  return schema;
};
