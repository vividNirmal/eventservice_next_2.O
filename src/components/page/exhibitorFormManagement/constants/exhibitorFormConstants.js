export const MEASUREMENT_UNIT_OPTIONS = [
  'Square Feet',
  'Square Meters',
  'Units',
  'Packages'
];

export const STALL_TYPE_OPTIONS = [
  'Standard',
  'Premium',
  'VIP',
  'Custom'
];

export const PAYMENT_COLLECTION_MODE_OPTIONS = [
  'Online',
  'Offline',
  'Both'
];

export const OFFLINE_PAYMENT_OPTIONS = [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Demand Draft'
];

export const SERVICE_PROVIDER_OPTIONS = [
  'Electrical',
  'Internet',
  'Furniture',
  'Security',
  'Cleaning'
];

export const STEP_TITLES = [
  'Basic Information',
  'Media & Documents',
  'Other Information',
  'Notifications'
];

export const DEPENDANT_FORMS = [
  { label: 'Form 1', value: 'form1' },
  { label: 'Form 2', value: 'form2' },
  { label: 'Form 3', value: 'form3' }
];

export const DEPENDANT_FEATURES = [
  { label: 'Feature 1', value: 'feature1' },
  { label: 'Feature 2', value: 'feature2' },
  { label: 'Feature 3', value: 'feature3' }
];

export const INITIAL_FORM_DATA = {
  // Basic Info
  basicInfo: {
    full_name: "",
    form_number: 1,
    due_date: null,
    submission_disclaimer: "",
    form_description: "",
    measurement_unit: "",
    allow_multiple_submission: false,
    is_mendatory: false,
    dependant_form: null,
    dependant_features: "feature1",
    limit_quantity_for_all: false,
    payment_collection_required: false,
    payment_collection_mode: "Online",
    offline_payment_option: [],
    tds_applicable: false,
    payment_instructions: "",
    service_provider: [],
    stall_type: "Standard",
    apply_vendor_filter: false,
    apply_zone_filter: false,
    submit_without_pay_verify: false,
    machinery_wbs: "",
    jewllery_wbs: "",
    allow_personal_cctv_installation: false,
  },

  // Media Info
  mediaInfo: {
    important_instructions_image: null,
    important_instructions_image_preview: null,
    supporting_documents: []
  },

  // Other Info
  otherInfo: {
    terms_and_condition: "",
    ofline_order_summary: ""
  },

  // Notifications
  notifications: {
    emailNotification: { enabled: false, templates: [] },
    smsNotification: { enabled: false, templates: [] },
    whatsappNotification: { enabled: false, templates: [] },
  }
};