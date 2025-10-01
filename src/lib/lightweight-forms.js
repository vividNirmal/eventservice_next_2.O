// Lightweight form utilities - alternatives to heavy Formik/Yup
"use client";
import React from 'react';

// Simple validation helpers
export const validators = {
  required: (value, message = "This field is required") => 
    !value || value.toString().trim() === "" ? message : null,
    
  email: (value, message = "Invalid email address") => 
    value && !/\S+@\S+\.\S+/.test(value) ? message : null,
    
  minLength: (min, message) => (value) => 
    value && value.length < min ? message || `Minimum ${min} characters required` : null,
    
  maxLength: (max, message) => (value) => 
    value && value.length > max ? message || `Maximum ${max} characters allowed` : null,
    
  pattern: (regex, message) => (value) => 
    value && !regex.test(value) ? message : null,
};

// Simple form hook
export const useForm = (initialValues, validationRules = {}) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validate = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of Array.isArray(rules) ? rules : [rules]) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validate(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    const isValid = validateAll();
    if (isValid && onSubmit) {
      onSubmit(values);
    }
  };

  const reset = (newValues) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};

// Lazy load heavy form libraries when needed
export const loadFormLibraries = async () => {
  const [{ useFormik }, Yup] = await Promise.all([
    import('formik'),
    import('yup')
  ]);
  
  return { useFormik, Yup };
};

export default {
  validators,
  useForm,
  loadFormLibraries
};