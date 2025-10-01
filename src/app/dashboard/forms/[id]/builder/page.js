'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormBuilder } from '@/components/form-builder/form-builder';
import { FormPreview } from '@/components/form-builder/form-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPut } from '@/lib/api';
import { generateId } from '@/lib/form-utils';
import { getRequest } from '@/service/viewService';

const userTypeOptions = [
  'Event Attendee',
  'Exhibiting Company', 
  'Sponsor',
  'Speaker',
  'Service Provider',
  'Accompanying'
];

/**
 * Form Builder Page Component
 */
export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id;

  const [form, setForm] = useState({
    id: formId,
    formName: '',
    userType: '',
    elements: [],
    settings: {
      submitText: 'Submit',
      confirmationMessage: 'Thank you for your submission!',
      allowMultipleSubmissions: false,
      requireAuth: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [originalForm, setOriginalForm] = useState(null);

  // Auto-save debounce timer
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  useEffect(() => {
    fetchForm();
    
    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [formId]);

  const fetchForm = async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getRequest(`/forms/${formId}`);
      if (response.status === 1 && response.data) {
        const formData = response.data.form;
        
        // Ensure elements array exists and has proper structure
        const elements = formData.formFields || [];
        
        const newFormState = {
          id: formData._id,
          formName: formData.formName || '',
          userType: formData.userType || '',
          elements: elements.map((element, index) => ({
            ...element,
            id: element.id || generateId(),
            position: index
          })),
          settings: formData.settings || {
            submitText: 'Submit',
            confirmationMessage: 'Thank you for your submission!',
            allowMultipleSubmissions: false,
            requireAuth: false
          },
          createdAt: formData.createdAt,
          updatedAt: formData.updatedAt
        };
        
        setForm(newFormState);
        
        setOriginalForm(formData);
      } else {
        console.log('❌ API Response error or no data:', response);
      }
    } catch (error) {
      console.error('🚨 Error fetching form:', error);
      toast.error('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (updatedForm) => {
    setForm(updatedForm);
    
    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      autoSaveForm(updatedForm);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const handleFormSettingsChange = (field, value) => {
    console.log(`🔧 Form settings change - Field: ${field}, Value:`, value);
    const updatedForm = { ...form, [field]: value };
    console.log('📝 Updated form after settings change:', updatedForm);
    setForm(updatedForm);
    
    // Auto-save settings changes
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      autoSaveForm(updatedForm);
    }, 1000); // Faster save for settings changes
    
    setAutoSaveTimer(timer);
  };

  const autoSaveForm = async (formData) => {
    if (!formData.formName.trim() || !formData.userType) {
      return; // Don't auto-save if required fields are missing
    }

    try {
      setAutoSaving(true);
      
      const payload = {
        formName: formData.formName,
        userType: formData.userType,
        formFields: formData.elements,
        settings: formData.settings
      };

      await apiPut(`/forms/${formId}`, payload);
      
      setForm(prev => ({
        ...prev,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form.formName.trim()) {
      toast.error('Please enter a form title');
      return;
    }

    if (!form.userType) {
      toast.error('Please select a user type');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare the form data for API
      const formData = {
        formName: form.formName,
        userType: form.userType,
        formFields: form.elements,
        settings: form.settings
      };

      const response = await apiPut(`/forms/${formId}`, formData);
      
      if (response.status === 1) {
        toast.success('Form saved successfully');
        setForm(prev => ({
          ...prev,
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    // it should go back to the route where the user came from
    router.back();
  };

  const handlePreview = () => {
    // Preview is now handled by the FormPreview component
  };

  if (loading) {
    console.log('⏳ Loading state is true, showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Form Builder
              </h1>
              <p className="text-sm text-gray-600 flex items-center">
                {form.formName || originalForm?.formName || 'New Form'}
                {autoSaving && (
                  <span className="ml-2 text-blue-600 text-xs">
                    • Auto-saving...
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FormPreview 
              form={form}
              trigger={
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              }
            />
            
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Form'}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Settings */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <Card>
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="formName">Form Name</Label>
                <Input
                  id="formName"
                  value={form.formName}
                  onChange={(e) => handleFormSettingsChange('formName', e.target.value)}
                  placeholder="Enter form name"
                />
              </div>
              
              <div>
                <Label htmlFor="userType">User Type</Label>
                <Select 
                  value={form.userType} 
                  onValueChange={(value) => handleFormSettingsChange('userType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Builder */}
      <div className="flex-1">
        <FormBuilder 
          form={form} 
          onFormChange={handleFormChange}
        />
      </div>
    </div>
  );
}
