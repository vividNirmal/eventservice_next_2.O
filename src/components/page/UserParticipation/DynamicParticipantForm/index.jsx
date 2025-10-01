"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormRenderer } from "@/components/form-renderer/form-renderer";
import { toast } from "sonner";
import { 
  User, 
  CheckCircle2, 
  Loader2,
  AlertCircle 
} from "lucide-react";
import { userPostRequest } from "@/service/viewService";

const DynamicParticipantForm = ({
  userEmail,
  eventData,
  formData,
  faceScannerPermission,
  eventHasFacePermission,
  dynamicForm,
  formLoading = false,
  onFormSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);

  // Debug logging for props
  useEffect(() => {
    console.log('DynamicParticipantForm props:', {
      userEmail,
      eventData: eventData?.eventName || eventData?.event_title,
      formData,
      faceScannerPermission,
      eventHasFacePermission,
      dynamicForm: dynamicForm?.title,
      formLoading
    });
  }, [userEmail, eventData, formData, faceScannerPermission, eventHasFacePermission, dynamicForm, formLoading]);

  // Handle form submission
  // const handleFormSubmit = async (formSubmissionData) => {
  //   try {
  //     setSubmitting(true);
      
  //     console.log('Form submission data:', formSubmissionData);
  //     console.log('Current formData context:', formData);
  //     console.log('Current userEmail:', userEmail);
      
  //     // Validate required context
  //     if (!formData.event_id) {
  //       toast.error('Event ID is missing. Please refresh the page.');
  //       return;
  //     }
      
  //     if (!formData.user_token) {
  //       toast.error('User token is missing. Please refresh the page.');
  //       return;
  //     }
      
  //     // Prepare form data for submission
  //     const submissionData = new FormData();
      
  //     // Add event context
  //     submissionData.append("event_id", formData.event_id);
  //     submissionData.append("user_token", formData.user_token);
  //     if (userEmail) {
  //       submissionData.append("email", userEmail);
  //     }
      
  //     // Add the form ID to identify which form was used
  //     if (dynamicForm.id) {
  //       submissionData.append("form_id", dynamicForm.id);
  //     }
  //     submissionData.append("form_type", "dynamic");
      
  //     // Add dynamic form data as structured JSON
  //     submissionData.append("dynamic_form_data", JSON.stringify(formSubmissionData));
      
  //     // Add individual form fields for backward compatibility
  //     Object.keys(formSubmissionData).forEach(key => {
  //       if (formSubmissionData[key] !== null && formSubmissionData[key] !== undefined) {
  //         if (formSubmissionData[key] instanceof File) {
  //           submissionData.append(key, formSubmissionData[key]);
  //         } else if (Array.isArray(formSubmissionData[key])) {
  //           submissionData.append(key, JSON.stringify(formSubmissionData[key]));
  //         } else {
  //           submissionData.append(key, formSubmissionData[key]);
  //         }
  //       }
  //     });
      
  //     // Log submission data for debugging
  //     console.log('Submitting form with data:');
  //     for (let [key, value] of submissionData.entries()) {
  //       console.log(`${key}:`, value);
  //     }
      
  //     // Submit to backend
  //     const response = await userPostRequest("store-participant-details", submissionData);
      
  //     if (response.error) {
  //       toast.error(response.error);
  //     } else {
  //       toast.success(dynamicForm.settings?.confirmationMessage || 'Form submitted successfully!');
  //       // Call success callback to proceed to Step 3
  //       if (onFormSuccess) {
  //         onFormSuccess(response);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Form submission error:', error);
  //     toast.error('Failed to submit form. Please try again.');
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  const handleFormSubmit = async (formSubmissionData) => {
  try {
    setSubmitting(true);

    console.log('🚀 DEBUG: Form submission started');
    console.log('🚀 DEBUG: formSubmissionData received:', formSubmissionData);
    console.log('🚀 DEBUG: formData context:', formData);
    console.log('🚀 DEBUG: userEmail:', userEmail);

    // Validate required fields
    if (!formData.event_id) {
      toast.error('Event ID is missing. Please refresh the page.');
      return;
    }

    if (!formData.user_token) {
      toast.error('User token is missing. Please refresh the page.');
      return;
    }

    if (!userEmail || userEmail.trim() === '') {
      toast.error('Email is required for submission.');
      return;
    }

    // Create form-data object
    const submissionData = new FormData();
    submissionData.append("event_id", formData.event_id);
    submissionData.append("user_token", formData.user_token);
    submissionData.append("email", userEmail.trim());
    submissionData.append("form_id", dynamicForm.id);
    submissionData.append("form_type", "dynamic");

    // Handle face image if provided
    if (formSubmissionData.face_image?.image) {
      const base64Image = formSubmissionData.face_image.image;
      if (base64Image.startsWith('data:image/')) {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const byteCharacters = atob(base64Data);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const file = new File([blob], "face_image.jpg", { type: 'image/jpeg' });
        submissionData.append("face_image", file);
      }
    } else if (formSubmissionData.face_image instanceof File) {
      submissionData.append("face_image", formSubmissionData.face_image);
    }

    // Dynamic form data (remove face_image field before sending)
    const dynamicFormData = { ...formSubmissionData };
    delete dynamicFormData.face_image;

    submissionData.append("dynamic_form_data", JSON.stringify(dynamicFormData));

    console.log('🚀 DEBUG: Final FormData being sent:');
    for (let [key, value] of submissionData.entries()) {
      console.log(`${key}:`, value);
    }

    // Send request
    const response = await userPostRequest("store-participant-details", submissionData);

    console.log('🚀 DEBUG: Server response:', response);

    if (response.error || response.success === false || response.status !== 1) {
      toast.error(response.error || 'Failed to submit form');
      return;
    }

    toast.success(dynamicForm.settings?.confirmationMessage || 'Form submitted successfully!');
    if (onFormSuccess) {
      onFormSuccess(response);
    }
  } catch (error) {
    console.error('Form submission error:', error);
    toast.error('Failed to submit form. Please try again.');
  } finally {
    setSubmitting(false);
  }
};


  // Show loading state if form is being fetched
  if (formLoading || (!dynamicForm && formLoading !== false)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Form</h3>
            <p className="text-gray-600">Please wait while we prepare your form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if no form is available
  if (!dynamicForm || !dynamicForm.elements || dynamicForm.elements.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Form Configured</h3>
            <p className="text-gray-600 mb-4">
              This event doesn't have a registration form configured. Please contact the event organizer for assistance.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>Event:</strong> {eventData?.eventName || eventData?.event_title || 'Unknown'}</p>
              {eventData?.organizer_email && (
                <p><strong>Contact:</strong> {eventData.organizer_email}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 lg:p-6">
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center p-6 pb-4 2xl:pb-8 pt-6 2xl:pt-10 lg:px-10">
          <div className="mx-auto size-10 lg:size-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <User className="size-6 lg:size-8 text-white" />
          </div>
          <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
            {dynamicForm.title}
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm lg:text-base leading-relaxed max-w-2xl mx-auto">
            {dynamicForm.description || "Please fill out this form completely and accurately."}
          </CardDescription>
          {eventData && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Event:</span> {eventData.eventName || eventData.event_title}
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="px-6 pb-6 lg:px-10 2xl:pb-10">
          <div className="space-y-6">
            {/* Dynamic Form Renderer */}
            <FormRenderer 
              form={dynamicForm} 
              onSubmit={handleFormSubmit}
              loading={submitting}
              faceScannerPermission={faceScannerPermission}
              eventHasFacePermission={eventHasFacePermission}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicParticipantForm;
