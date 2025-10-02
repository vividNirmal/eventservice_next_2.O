'use client';

import React, { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Type, 
  Mail, 
  Hash, 
  FileText, 
  ChevronDown, 
  Circle, 
  CheckSquare, 
  Upload, 
  Calendar,
  Minus,
  Heading1,
  AlignLeft,
  Search,
  Phone,
  MapPin,
  Globe,
  Building,
  User,
  Camera,
  Link,
  Clock,
  DollarSign,
  Star,
  Shield,
  Users,
  Briefcase,
  Award,
  Eye,
  EyeOff,
  Palette,
  ToggleLeft,
  BookOpen,
  MessageSquare,
  Home,
  CreditCard,
  PenTool,
  FileImage,
  Video,
  Mic,
  Settings,
  Car
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

// Comprehensive form element groups for event management
const ELEMENT_GROUPS = {
  BASIC_INPUTS: {
    title: 'Basic Information',
    elements: [
      {
        type: 'text',
        icon: Type,
        label: 'Text Input',
        description: 'Name, title, or short text',
        keywords: ['text', 'name', 'title', 'input', 'string']
      },
      {
        type: 'email',
        icon: Mail,
        label: 'Email',
        description: 'Email address with validation',
        keywords: ['email', 'contact', 'mail', 'address']
      },
      {
        type: 'phone',
        icon: Phone,
        label: 'Phone Number',
        description: 'Phone number input',
        keywords: ['phone', 'mobile', 'contact', 'number', 'telephone']
      },
      {
        type: 'textarea',
        icon: FileText,
        label: 'Long Text',
        description: 'Bio, description, or message',
        keywords: ['textarea', 'bio', 'description', 'message', 'long', 'text']
      },
      {
        type: 'password',
        icon: EyeOff,
        label: 'Password',
        description: 'Password input field',
        keywords: ['password', 'secure', 'login', 'authentication']
      },
      {
        type: 'url',
        icon: Link,
        label: 'URL',
        description: 'Website or link input',
        keywords: ['url', 'link', 'website', 'http', 'https']
      },
      {
        type: 'search',
        icon: Search,
        label: 'Search',
        description: 'Search input field',
        keywords: ['search', 'find', 'query', 'lookup']
      }
    ]
  },
  
  PROFESSIONAL_INFO: {
    title: 'Professional Details',
    elements: [
      {
        type: 'company',
        icon: Building,
        label: 'Company/Organization',
        description: 'Company or organization name',
        keywords: ['company', 'organization', 'business', 'employer', 'work']
      },
      {
        type: 'job_title',
        icon: Briefcase,
        label: 'Job Title',
        description: 'Professional position or role',
        keywords: ['job', 'title', 'position', 'role', 'designation']
      },
      {
        type: 'industry',
        icon: Award,
        label: 'Industry',
        description: 'Industry or sector',
        keywords: ['industry', 'sector', 'field', 'domain']
      },
      {
        type: 'experience',
        icon: Star,
        label: 'Experience Level',
        description: 'Years of experience or level',
        keywords: ['experience', 'level', 'years', 'expertise', 'seniority']
      },
      {
        type: 'department',
        icon: Building,
        label: 'Department',
        description: 'Department or division',
        keywords: ['department', 'division', 'team', 'unit']
      },
      {
        type: 'skills',
        icon: Award,
        label: 'Skills',
        description: 'Technical or professional skills',
        keywords: ['skills', 'expertise', 'abilities', 'competencies']
      },
      {
        type: 'education',
        icon: BookOpen,
        label: 'Education',
        description: 'Educational background',
        keywords: ['education', 'degree', 'university', 'school', 'qualification']
      }
    ]
  },

  CONTACT_LOCATION: {
    title: 'Contact & Location',
    elements: [
      {
        type: 'address',
        icon: MapPin,
        label: 'Address',
        description: 'Full address or location',
        keywords: ['address', 'location', 'street', 'city', 'state']
      },
      {
        type: 'country',
        icon: Globe,
        label: 'Country',
        description: 'Country selection',
        keywords: ['country', 'nation', 'location', 'geography']
      },
      {
        type: 'website',
        icon: Link,
        label: 'Website/URL',
        description: 'Website or social media URL',
        keywords: ['website', 'url', 'link', 'social', 'linkedin', 'twitter']
      },
      {
        type: 'city',
        icon: MapPin,
        label: 'City',
        description: 'City or town',
        keywords: ['city', 'town', 'municipality', 'location']
      },
      {
        type: 'state',
        icon: MapPin,
        label: 'State/Province',
        description: 'State, province, or region',
        keywords: ['state', 'province', 'region', 'territory']
      },
      {
        type: 'zipcode',
        icon: MapPin,
        label: 'ZIP/Postal Code',
        description: 'Postal or ZIP code',
        keywords: ['zip', 'postal', 'code', 'postcode']
      }
    ]
  },

  EVENT_SPECIFIC: {
    title: 'Event Specific',
    elements: [
      {
        type: 'registration_type',
        icon: Users,
        label: 'Registration Type',
        description: 'Attendee, Speaker, Sponsor, etc.',
        keywords: ['registration', 'type', 'attendee', 'speaker', 'sponsor']
      },
      {
        type: 'session_preference',
        icon: Clock,
        label: 'Session Preferences',
        description: 'Preferred sessions or tracks',
        keywords: ['session', 'preference', 'track', 'interest', 'topic']
      },
      {
        type: 'dietary',
        icon: Shield,
        label: 'Dietary Requirements',
        description: 'Food allergies or preferences',
        keywords: ['dietary', 'food', 'allergy', 'preference', 'vegan', 'vegetarian']
      },
      {
        type: 'accessibility',
        icon: Shield,
        label: 'Accessibility Needs',
        description: 'Special accessibility requirements',
        keywords: ['accessibility', 'disability', 'special', 'needs', 'accommodation']
      },
      {
        type: 'emergency_contact',
        icon: Phone,
        label: 'Emergency Contact',
        description: 'Emergency contact information',
        keywords: ['emergency', 'contact', 'urgent', 'medical']
      },
      {
        type: 'tshirt_size',
        icon: User,
        label: 'T-Shirt Size',
        description: 'Clothing size for events',
        keywords: ['tshirt', 'size', 'clothing', 'merchandise']
      },
      {
        type: 'transportation',
        icon: Car,
        label: 'Transportation',
        description: 'Transportation preferences',
        keywords: ['transportation', 'travel', 'parking', 'shuttle']
      }
    ]
  },

  MEDIA_UPLOADS: {
    title: 'Media & Files',
    elements: [
      {
        type: 'file',
        icon: Upload,
        label: 'File Upload',
        description: 'Documents, resumes, or files',
        keywords: ['file', 'upload', 'document', 'resume', 'attachment']
      },
      {
        type: 'photo',
        icon: Camera,
        label: 'Photo Upload',
        description: 'Profile photo or headshot',
        keywords: ['photo', 'image', 'profile', 'headshot', 'picture']
      },
      {
        type: 'logo',
        icon: Camera,
        label: 'Logo Upload',
        description: 'Company or sponsor logo',
        keywords: ['logo', 'brand', 'image', 'company', 'sponsor']
      },
      {
        type: 'video',
        icon: Video,
        label: 'Video Upload',
        description: 'Video file upload',
        keywords: ['video', 'media', 'upload', 'recording']
      },
      {
        type: 'audio',
        icon: Mic,
        label: 'Audio Upload',
        description: 'Audio file upload',
        keywords: ['audio', 'sound', 'recording', 'voice']
      }
    ]
  },

  SELECTION_FIELDS: {
    title: 'Selection Fields',
    elements: [
      {
        type: 'select',
        icon: ChevronDown,
        label: 'Dropdown',
        description: 'Single select dropdown',
        keywords: ['dropdown', 'select', 'option', 'choice', 'single']
      },
      {
        type: 'radio',
        icon: Circle,
        label: 'Radio Group',
        description: 'Single choice selection',
        keywords: ['radio', 'single', 'choice', 'option', 'select']
      },
      {
        type: 'checkbox',
        icon: CheckSquare,
        label: 'Checkbox',
        description: 'Multiple choice selection',
        keywords: ['checkbox', 'multiple', 'choice', 'select', 'option']
      },
      {
        type: 'toggle',
        icon: ToggleLeft,
        label: 'Toggle Switch',
        description: 'On/off toggle switch',
        keywords: ['toggle', 'switch', 'boolean', 'yes', 'no']
      },
      {
        type: 'multiselect',
        icon: CheckSquare,
        label: 'Multi-Select',
        description: 'Multiple choice dropdown',
        keywords: ['multiselect', 'multiple', 'dropdown', 'choice']
      }
    ]
  },

  NUMERIC_DATE: {
    title: 'Numbers & Dates',
    elements: [
      {
        type: 'number',
        icon: Hash,
        label: 'Number',
        description: 'Numeric input field',
        keywords: ['number', 'numeric', 'quantity', 'count', 'age']
      },
      {
        type: 'currency',
        icon: DollarSign,
        label: 'Currency',
        description: 'Price or monetary amount',
        keywords: ['currency', 'money', 'price', 'amount', 'cost', 'budget']
      },
      {
        type: 'date',
        icon: Calendar,
        label: 'Date',
        description: 'Date picker input',
        keywords: ['date', 'calendar', 'day', 'time', 'schedule']
      },
      {
        type: 'time',
        icon: Clock,
        label: 'Time',
        description: 'Time picker input',
        keywords: ['time', 'hour', 'minute', 'clock', 'schedule']
      },
      {
        type: 'datetime',
        icon: Calendar,
        label: 'Date & Time',
        description: 'Date and time picker',
        keywords: ['datetime', 'timestamp', 'schedule', 'appointment']
      },
      {
        type: 'range',
        icon: Settings,
        label: 'Range/Slider',
        description: 'Numeric range slider',
        keywords: ['range', 'slider', 'numeric', 'scale', 'rating']
      },
      {
        type: 'rating',
        icon: Star,
        label: 'Rating',
        description: 'Star rating input',
        keywords: ['rating', 'stars', 'feedback', 'review', 'score']
      }
    ]
  },

  ADVANCED_INPUTS: {
    title: 'Advanced Elements',
    elements: [
      {
        type: 'signature',
        icon: PenTool,
        label: 'Signature',
        description: 'Digital signature pad',
        keywords: ['signature', 'sign', 'digital', 'agreement']
      },
      {
        type: 'color',
        icon: Palette,
        label: 'Color Picker',
        description: 'Color selection input',
        keywords: ['color', 'picker', 'palette', 'hex', 'rgb']
      },
      {
        type: 'hidden',
        icon: EyeOff,
        label: 'Hidden Field',
        description: 'Hidden form field',
        keywords: ['hidden', 'invisible', 'metadata', 'tracking']
      },
      {
        type: 'richtext',
        icon: MessageSquare,
        label: 'Rich Text Editor',
        description: 'WYSIWYG text editor',
        keywords: ['richtext', 'editor', 'wysiwyg', 'html', 'formatting']
      },
      {
        type: 'captcha',
        icon: Shield,
        label: 'CAPTCHA',
        description: 'Security verification',
        keywords: ['captcha', 'security', 'verification', 'bot', 'protection']
      }
    ]
  },

  LAYOUT_CONTENT: {
    title: 'Layout & Content',
    elements: [
      {
        type: 'heading',
        icon: Heading1,
        label: 'Heading',
        description: 'Section heading',
        keywords: ['heading', 'title', 'header', 'section']
      },
      {
        type: 'paragraph',
        icon: AlignLeft,
        label: 'Paragraph',
        description: 'Text content or instructions',
        keywords: ['paragraph', 'text', 'content', 'description', 'instructions']
      },
      {
        type: 'divider',
        icon: Minus,
        label: 'Divider',
        description: 'Visual separator',
        keywords: ['divider', 'separator', 'line', 'break', 'section']
      }
    ]
  }
};

/**
 * Draggable Element Component
 */
function DraggableElement({ element }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: `sidebar-${element.type}`,
    data: {
      supports: ['type1', 'type2'],
    }

  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const Icon = element.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group p-2 2xl:p-3 bg-white border border-gray-200 rounded-md 2xl:rounded-lg cursor-grab shadow active:cursor-grabbing hover:border-blue-300 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          <Icon className="size-4 2xl:size-5 text-gray-600 group-hover:text-blue-600" />
        </div>
        <div className="flex-1 min-w-0 border-l border-solid border-gray-200 pl-2">
          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{element.label}</p>
          {/* <p className="text-xs text-gray-500 truncate">
            {element.description}
          </p> */}
        </div>
      </div>
    </div>
  );
}

/**
 * Element Group Component
 */
function ElementGroup({ title, elements, searchTerm }) {
  // Filter elements based on search term
  const filteredElements = elements.filter(element => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      element.label.toLowerCase().includes(searchLower) ||
      element.description.toLowerCase().includes(searchLower) ||
      element.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  if (filteredElements.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mb-5">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      {filteredElements.map((element) => (
        <DraggableElement key={element.type} element={element} />
      ))}
    </div>
  );
}

/**
 * Element Sidebar Component
 */
export function ElementSidebar() {
  const [searchTerm, setSearchTerm] = useState('');

  // Get all elements for search results
  const allElements = useMemo(() => {
    const elements = [];
    Object.values(ELEMENT_GROUPS).forEach(group => {
      elements.push(...group.elements);
    });
    return elements;
  }, []);

  // Filter elements based on search
  const searchResults = useMemo(() => {
    if (!searchTerm) return null;
    
    const searchLower = searchTerm.toLowerCase();
    return allElements.filter(element => 
      element.label.toLowerCase().includes(searchLower) ||
      element.description.toLowerCase().includes(searchLower) ||
      element.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  }, [searchTerm, allElements]);

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 relative z-10 flex flex-col">
      <Card className="border-0 rounded-none 2xl:p-4 grow">
        <CardHeader className="px-0">
          <CardTitle className="text-sm font-semibold text-gray-700">Form Elements</CardTitle>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search elements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 2xl:h-11 2xl:text-base"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {searchResults ? (
            // Show search results
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Results ({searchResults.length})</h3>
              <div className="space-y-2">
                {searchResults.map((element) => (
                  <DraggableElement key={element.type} element={element} />
                ))}
              </div>
              {searchResults.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No elements found matching "{searchTerm}"</p>
              )}
            </div>
          ) : (
            // Show all groups
            Object.entries(ELEMENT_GROUPS).map(([key, group]) => (
              <ElementGroup
                key={key}
                title={group.title}
                elements={group.elements}
                searchTerm={searchTerm}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
