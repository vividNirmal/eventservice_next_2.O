/**
 * Form utilities for ID generation and validation
 */

/**
 * Generate a unique ID for form elements
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Convert a label to a valid form field name
 * @param {string} label - The label to convert
 * @returns {string} Valid field name
 */
export const labelToName = (label) => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Validate form element data
 * @param {Object} element - Form element to validate
 * @returns {Object} Validation result
 */
export const validateElement = (element) => {
  const errors = [];

  if (!element.label?.trim()) {
    errors.push('Label is required');
  }

  if (!element.name?.trim()) {
    errors.push('Name is required');
  }

  if (element.type === 'select' || element.type === 'radio' || element.type === 'checkbox') {
    if (!element.options || element.options.length === 0) {
      errors.push('At least one option is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create default form element
 * @param {string} type - Element type
 * @returns {Object} Default element
 */
export const createDefaultElement = (type) => {
  const id = generateId();
  
  const baseElement = {
    id,
    type,
    label: getDefaultLabel(type),
    name: labelToName(getDefaultLabel(type)),
    required: false,
    position: 0,
  };

  // Add type-specific properties
  switch (type) {
    case 'text':
      return {
        ...baseElement,
        placeholder: 'Enter text here',
        validation: []
      };
    
    case 'email':
      return {
        ...baseElement,
        placeholder: 'Enter email address',
        validation: [
          { type: 'email', message: 'Please enter a valid email address' }
        ]
      };

    case 'phone':
      return {
        ...baseElement,
        placeholder: 'Enter phone number',
        validation: []
      };

    case 'company':
      return {
        ...baseElement,
        placeholder: 'Enter company/organization name',
        validation: []
      };

    case 'job_title':
      return {
        ...baseElement,
        placeholder: 'Enter job title',
        validation: []
      };

    case 'industry':
      return {
        ...baseElement,
        placeholder: 'Enter your industry',
        validation: []
      };

    case 'experience':
      return {
        ...baseElement,
        options: [
          { label: 'Entry Level (0-2 years)', value: 'entry' },
          { label: 'Mid Level (3-5 years)', value: 'mid' },
          { label: 'Senior Level (6-10 years)', value: 'senior' },
          { label: 'Executive Level (10+ years)', value: 'executive' }
        ]
      };

    case 'address':
      return {
        ...baseElement,
        placeholder: 'Enter full address',
        validation: []
      };

    case 'country':
      return {
        ...baseElement,
        options: [
          { label: 'United States', value: 'us' },
          { label: 'Canada', value: 'ca' },
          { label: 'United Kingdom', value: 'uk' },
          { label: 'Australia', value: 'au' },
          { label: 'Germany', value: 'de' },
          { label: 'France', value: 'fr' },
          { label: 'India', value: 'in' },
          { label: 'Japan', value: 'jp' },
          { label: 'Other', value: 'other' }
        ]
      };

    case 'website':
      return {
        ...baseElement,
        placeholder: 'https://example.com',
        validation: []
      };

    case 'registration_type':
      return {
        ...baseElement,
        options: [
          { label: 'Event Attendee', value: 'attendee' },
          { label: 'Speaker', value: 'speaker' },
          { label: 'Sponsor', value: 'sponsor' },
          { label: 'Exhibitor', value: 'exhibitor' },
          { label: 'Media/Press', value: 'media' },
          { label: 'VIP Guest', value: 'vip' }
        ]
      };

    case 'session_preference':
      return {
        ...baseElement,
        options: [
          { label: 'Keynote Sessions', value: 'keynote' },
          { label: 'Technical Workshops', value: 'technical' },
          { label: 'Panel Discussions', value: 'panel' },
          { label: 'Networking Sessions', value: 'networking' },
          { label: 'Product Demos', value: 'demos' }
        ]
      };

    case 'dietary':
      return {
        ...baseElement,
        options: [
          { label: 'No restrictions', value: 'none' },
          { label: 'Vegetarian', value: 'vegetarian' },
          { label: 'Vegan', value: 'vegan' },
          { label: 'Gluten-free', value: 'gluten_free' },
          { label: 'Halal', value: 'halal' },
          { label: 'Kosher', value: 'kosher' },
          { label: 'Other (please specify)', value: 'other' }
        ]
      };

    case 'accessibility':
      return {
        ...baseElement,
        options: [
          { label: 'No special requirements', value: 'none' },
          { label: 'Wheelchair accessible seating', value: 'wheelchair' },
          { label: 'Sign language interpreter', value: 'sign_language' },
          { label: 'Large print materials', value: 'large_print' },
          { label: 'Audio assistance', value: 'audio_assist' },
          { label: 'Other (please specify)', value: 'other' }
        ]
      };
    
    case 'number':
      return {
        ...baseElement,
        placeholder: 'Enter number',
        validation: []
      };

    case 'currency':
      return {
        ...baseElement,
        placeholder: '0.00',
        validation: []
      };

    case 'time':
      return {
        ...baseElement,
        validation: []
      };
    
    case 'textarea':
      return {
        ...baseElement,
        placeholder: 'Enter your message here',
        validation: []
      };
    
    case 'select':
      return {
        ...baseElement,
        placeholder: 'Select an option',
        options: [
          { label: 'Option 1', value: 'option_1' },
          { label: 'Option 2', value: 'option_2' }
        ]
      };
    
    case 'radio':
      return {
        ...baseElement,
        options: [
          { label: 'Option 1', value: 'option_1' },
          { label: 'Option 2', value: 'option_2' }
        ]
      };
    
    case 'checkbox':
      return {
        ...baseElement,
        options: [
          { label: 'Option 1', value: 'option_1' },
          { label: 'Option 2', value: 'option_2' }
        ]
      };
    
    case 'file':
      return {
        ...baseElement,
        placeholder: 'Choose file',
        validation: []
      };

    case 'photo':
      return {
        ...baseElement,
        placeholder: 'Choose photo',
        validation: []
      };

    case 'logo':
      return {
        ...baseElement,
        placeholder: 'Choose logo',
        validation: []
      };
    
    case 'date':
      return {
        ...baseElement,
        validation: []
      };
    
    case 'heading':
      return {
        ...baseElement,
        label: 'Section Heading',
        headingLevel: 'h2',
        content: 'Section Heading'
      };
    
    case 'paragraph':
      return {
        ...baseElement,
        label: 'Paragraph Text',
        content: 'Add your paragraph content here.'
      };
    
    case 'divider':
      return {
        ...baseElement,
        label: 'Divider'
      };

    // New elements with default options
    case 'emergency_contact':
      return {
        ...baseElement,
        placeholder: 'Select relationship',
        options: [
          { label: 'Spouse', value: 'spouse' },
          { label: 'Parent', value: 'parent' },
          { label: 'Child', value: 'child' },
          { label: 'Sibling', value: 'sibling' },
          { label: 'Friend', value: 'friend' },
          { label: 'Colleague', value: 'colleague' },
          { label: 'Other', value: 'other' }
        ]
      };

    case 'tshirt_size':
      return {
        ...baseElement,
        placeholder: 'Select size',
        options: [
          { label: 'XS', value: 'xs' },
          { label: 'S', value: 's' },
          { label: 'M', value: 'm' },
          { label: 'L', value: 'l' },
          { label: 'XL', value: 'xl' },
          { label: 'XXL', value: 'xxl' },
          { label: 'XXXL', value: 'xxxl' }
        ]
      };

    case 'transportation':
      return {
        ...baseElement,
        placeholder: 'Select transportation',
        options: [
          { label: 'Own Vehicle', value: 'own_vehicle' },
          { label: 'Public Transport', value: 'public_transport' },
          { label: 'Taxi/Uber', value: 'taxi_uber' },
          { label: 'Event Shuttle', value: 'event_shuttle' },
          { label: 'Walking', value: 'walking' },
          { label: 'Other', value: 'other' }
        ]
      };

    case 'multiselect':
      return {
        ...baseElement,
        placeholder: 'Select multiple options',
        options: [
          { label: 'Option 1', value: 'option_1' },
          { label: 'Option 2', value: 'option_2' },
          { label: 'Option 3', value: 'option_3' }
        ]
      };

    // Additional file types
    case 'video':
      return {
        ...baseElement,
        placeholder: 'Choose video file',
        validation: []
      };

    case 'audio':
      return {
        ...baseElement,
        placeholder: 'Choose audio file',
        validation: []
      };

    // Advanced form elements
    case 'password':
      return {
        ...baseElement,
        placeholder: 'Enter password',
        validation: []
      };

    case 'url':
      return {
        ...baseElement,
        placeholder: 'https://example.com',
        validation: []
      };

    case 'search':
      return {
        ...baseElement,
        placeholder: 'Search...',
        validation: []
      };

    case 'datetime':
      return {
        ...baseElement,
        validation: []
      };

    case 'range':
      return {
        ...baseElement,
        min: 0,
        max: 100,
        step: 1,
        validation: []
      };

    case 'color':
      return {
        ...baseElement,
        validation: []
      };

    case 'hidden':
      return {
        ...baseElement,
        label: 'Hidden Field',
        validation: []
      };

    case 'signature':
      return {
        ...baseElement,
        validation: []
      };

    case 'rating':
      return {
        ...baseElement,
        min: 1,
        max: 5,
        validation: []
      };

    case 'toggle':
      return {
        ...baseElement,
        validation: []
      };

    case 'richtext':
      return {
        ...baseElement,
        placeholder: 'Enter rich text content...',
        validation: []
      };

    case 'captcha':
      return {
        ...baseElement,
        validation: []
      };

    // New basic field types
    case 'department':
      return {
        ...baseElement,
        placeholder: 'Enter department',
        validation: []
      };

    case 'skills':
      return {
        ...baseElement,
        placeholder: 'Enter skills (comma separated)',
        validation: []
      };

    case 'education':
      return {
        ...baseElement,
        placeholder: 'Enter education background',
        validation: []
      };

    case 'city':
      return {
        ...baseElement,
        placeholder: 'Enter city',
        validation: []
      };

    case 'state':
      return {
        ...baseElement,
        placeholder: 'Enter state/province',
        validation: []
      };

    case 'zipcode':
      return {
        ...baseElement,
        placeholder: 'Enter ZIP/postal code',
        validation: []
      };
    
    default:
      return baseElement;
  }
};

/**
 * Get default label for element type
 * @param {string} type - Element type
 * @returns {string} Default label
 */
const getDefaultLabel = (type) => {
  const labels = {
    text: 'Text Input',
    email: 'Email Address',
    phone: 'Phone Number',
    company: 'Company/Organization',
    job_title: 'Job Title',
    industry: 'Industry',
    experience: 'Experience Level',
    address: 'Address',
    country: 'Country',
    website: 'Website/URL',
    registration_type: 'Registration Type',
    session_preference: 'Session Preferences',
    dietary: 'Dietary Requirements',
    accessibility: 'Accessibility Needs',
    number: 'Number Input',
    currency: 'Currency Amount',
    time: 'Time',
    textarea: 'Message',
    select: 'Dropdown',
    radio: 'Radio Group',
    checkbox: 'Checkbox Group',
    file: 'File Upload',
    photo: 'Photo Upload',
    logo: 'Logo Upload',
    date: 'Date',
    heading: 'Section Heading',
    paragraph: 'Paragraph',
    divider: 'Divider',
    // New elements
    password: 'Password',
    url: 'Website/URL',
    search: 'Search',
    department: 'Department',
    skills: 'Skills',
    education: 'Education',
    city: 'City',
    state: 'State/Province',
    zipcode: 'ZIP/Postal Code',
    emergency_contact: 'Emergency Contact',
    tshirt_size: 'T-Shirt Size',
    transportation: 'Transportation',
    video: 'Video Upload',
    audio: 'Audio Upload',
    datetime: 'Date & Time',
    range: 'Range/Slider',
    color: 'Color Picker',
    hidden: 'Hidden Field',
    signature: 'Signature',
    rating: 'Rating',
    toggle: 'Toggle Switch',
    multiselect: 'Multi-Select',
    richtext: 'Rich Text Editor',
    captcha: 'CAPTCHA'
  };
  
  return labels[type] || 'Form Element';
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
};

/**
 * Merge class names
 * @param {...string} classes - Class names to merge
 * @returns {string} Merged class names
 */
export const cn = (...classes) => {
  return classes
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};
