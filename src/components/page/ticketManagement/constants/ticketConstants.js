export const USER_TYPE_OPTIONS = [
  'Event Attendee',
  'Exhibiting Company',
  'Sponsor',
  'Speaker',
  'Service Provider',
  'Accompanying'
];

export const TICKET_CATEGORY_OPTIONS = [
  'Default',
  'VIP',
  'VVIP',
  'Premium',
  'Standard'
];

export const CURRENCY_OPTIONS = [
  'USD',
  'INR',
  'EUR',
  'GBP',
  'AUD',
  'CAD',
  'SGD',
  'AED'
];

export const FEE_SETTING_OPTIONS = [
  { value: 'not-merge', label: 'Not Merge - Taxes and fees added at checkout' },
  { value: 'merge', label: 'Merge - Taxes and fees included in the amount' }
];

export const TICKET_ACCESS_OPTIONS = [
  'Open For All',
  'Invitation Only',
  'Pre-Approved'
];

export const TICKET_CTA_SETTINGS = [
  'Chat',
  'Schedule'
];

export const CROSS_REGISTER_CATEGORY_OPTIONS = [
  'Machinery',
  'Value Visitor Member',
  'Technology',
  'Services',
  'Innovation'
];

export const BADGE_CATEGORY_OPTIONS = [
  { value: 'machinery', label: 'Machinery' },
  { value: 'value-visitor', label: 'Value Visitor Member' },
  { value: 'technology', label: 'Technology' },
  { value: 'services', label: 'Services' },
  { value: 'visitor', label: 'Visitor' }
];

export const STEP_TITLES = [
  'Basic Info',
  'Ticket Amount',
  'Ticket Settings',
  'Ticket Advanced Settings',
  'Notifications'
];

export const INITIAL_FORM_DATA = {
  // Step 1 - Basic Info
  ticketName: null,
  userType: null,
  registrationFormId: null,
  ticketCategory: null,
  serialNoPrefix: null,
  startCount: '0000',
  description: null,
  bannerImage: null,
  bannerImagePreview: null,
  companyId: null,

  // Step 2 - Ticket Amount
  isFree: true,
  currency: 'USD',
  slotAmounts: [{
    startDateTime: null,
    endDateTime: null,
    amount: 0
  }],
  feeSetting: 'not-merge',
  materialNumber: null,
  wbs: null,

  // Step 3 - Ticket Settings
  ticketPerUser: 1,
  ticketAccess: 'Open For All',
  linkBannerDesktop: null,
  linkBannerMobile: null,
  desktopBannerImage: null,
  desktopBannerImagePreview: null,
  mobileBannerImage: null,
  mobileBannerImagePreview: null,
  ctaSettings: [],

  // Step 4 - Advanced Settings
  advancedSettings: {
    ticketBuyLimitMin: 1,
    ticketBuyLimitMax: 10,
    hasQuantityLimit: false,
    badgeCategory: 'visitor',
    registrationFilterDate: null,
    allowCrossRegister: false,
    crossRegisterCategories: [],
    autoApprovedUser: false,
    authenticateByOTP: false,
    autoPassword: false,
    addAllDiscount: false,
    individualDiscount: false
  },

  // Step 5 - Notifications
  notifications: {
    emailNotification: false,
    smsNotification: false,
    whatsappNotification: false
  }
};