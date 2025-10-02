'use client';

import React, { useState, useEffect } from 'react';
import { FormRenderer } from '@/components/form-renderer/form-renderer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { toast } from 'sonner';

export default function PublicFormPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchForm();
    }
  }, [params.id]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/forms/${params.id}`);
      
      if (response.status === 1 && response.data) {
        const formData = response.data.form;
        
        // Transform the form data to match FormRenderer expectations
        const transformedForm = {
          id: formData._id,
          title: formData.formName,
          description: `Please fill out this ${formData.userType} form`,
          elements: formData.formFields || [],
          settings: formData.settings || {
            submitText: 'Submit',
            confirmationMessage: 'Thank you for your submission!',
            allowMultipleSubmissions: false,
            requireAuth: false
          }
        };
        
        setForm(transformedForm);
      } else {
        setError('Form not found or access denied');
      }
    } catch (err) {
      console.error('Error fetching form:', err);
      setError('Failed to load form. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setSubmitting(true);
      
      // Here you would typically submit the form data to your backend
      // For now, we'll just simulate a successful submission
      
      console.log('Form submitted:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Form submitted successfully!');
      
      // Optionally redirect or reset form
      // router.push('/thank-you');
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
      throw error; // Re-throw to let FormRenderer handle it
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Form</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
            <p className="text-gray-600 mb-4">The requested form could not be found.</p>
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button  onClick={() => router.back()} variant="outline" className="flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>
        </div>

        {/* Form */}
        <FormRenderer form={form} onSubmit={handleFormSubmit} loading={submitting} />
      </div>
    </div>
  );
}
