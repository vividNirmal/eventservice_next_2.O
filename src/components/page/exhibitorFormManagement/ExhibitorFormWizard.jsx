"use client";
import React, { useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';

import { useExhibitorForm } from './hooks/useExhibitorForm';
import { useImageUpload } from './hooks/useImageUpload';
import { validateStep } from './utils/validation';
import { submitExhibitorFormData } from './utils/apiUtils';

import StepIndicator from './components/StepIndicator';
import BasicInfoStep from './steps/BasicInfoStep';
import MediaInfoStep from './steps/MediaInfoStep';
import OtherInfoStep from './steps/OtherInfoStep';
import NotificationsStep from './steps/NotificationsStep';

import { toast } from 'sonner';

const ExhibitorFormWizard = ({ isOpen, onClose, onSuccess, editData = null, eventId, selectedConfiguration = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { formData, setFormData, isEditMode, errors, setErrors, handleInputChange, handleArrayFieldChange, resetForm, initializeEditData } = useExhibitorForm(editData);
  const imageHandlers = useImageUpload(formData, setFormData);

  React.useEffect(() => {
    if (editData) {
      initializeEditData(editData);
    } else {
      resetForm();

      // If we have a selected configuration for new form, use it
      if (selectedConfiguration) {
        // For example, you might want to set the form name based on configuration
        setFormData(prev => ({
          ...prev,
          basicInfo: {
            ...prev.basicInfo,
            full_name: `${selectedConfiguration.configName}`
          }
        }));
      }
    }
  }, [editData, initializeEditData, resetForm, selectedConfiguration, setFormData]);

  const validateCurrentStep = useCallback(() => {
    const stepErrors = validateStep(currentStep, formData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
    // return true; // #Skip validation
  }, [currentStep, formData, setErrors]);

  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  }, [validateCurrentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    
    // Include the selected configuration in the form data
    const formDataWithConfig = {
      ...formData,
      exhibitorFormConfigurationId: selectedConfiguration?._id
    };

    const result = await submitExhibitorFormData(formDataWithConfig, isEditMode, editData, eventId);
    setLoading(false);

    if (result.success) {
      onSuccess();
      handleClose();
    }
  };

  const handleSaveAndClose = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please complete all required fields in the current step');
      return;
    }

    for (let step = 1; step <= currentStep; step++) {
      const stepErrors = validateStep(step, formData);
      if (Object.keys(stepErrors).length > 0) {
        toast.error(`Please complete required fields in step ${step}`);
        setCurrentStep(step);
        setErrors(stepErrors);
        return;
      }
    }

    setLoading(true);
    
    // Include the selected configuration in the form data
    const formDataWithConfig = {
      ...formData,
      exhibitorFormConfigurationId: selectedConfiguration?._id
    };

    const result = await submitExhibitorFormData(formDataWithConfig, isEditMode, editData, eventId);
    setLoading(false);

    if (result.success) {
      onSuccess();
      handleClose();
    }
  };

  const handleClose = () => {
    resetForm();
    setCurrentStep(1);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
            handleArrayFieldChange={handleArrayFieldChange}
            errors={errors}
            selectedConfiguration={selectedConfiguration}
          />
        );
      case 2:
        return (
          <MediaInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            imageHandlers={imageHandlers}
            isEditMode={isEditMode}
          />
        );
      case 3:
        return (
          <OtherInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <NotificationsStep
            formData={formData}
            handleInputChange={handleInputChange}
            eventId={eventId}
            setFormData={setFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-4xl xl:max-w-4xl flex flex-col gap-0 p-0">
        <SheetHeader className="border-b border-gray-200 px-6 py-4 gap-0">
          <SheetTitle>
            {isEditMode ? 'Edit Exhibitor Form' : 'Add Exhibitor Form'}
            {selectedConfiguration && (<span className="pl-2 text-sm font-normal text-blue-700">{selectedConfiguration?.configSlug}</span>)}
          </SheetTitle>
          <SheetDescription className={"hidden"}>Fill in the form details to {isEditMode ? 'update' : 'create'} an exhibitor form</SheetDescription>
        </SheetHeader>

        {/* Step Indicator */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <StepIndicator 
            currentStep={currentStep} 
            setCurrentStep={setCurrentStep} 
            validateStepBeforeChange={validateCurrentStep}
          />
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderStepContent()}
        </div>

        {/* Footer with navigation buttons */}
        <SheetFooter className="border-t border-gray-200 px-6 py-4">
          <div className="flex w-full justify-between">
            <div className="flex space-x-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>

              {isEditMode && currentStep < 4 && (
                <Button 
                  onClick={handleSaveAndClose} 
                  disabled={loading}
                  variant="default"
                >
                  {loading ? (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              )}

              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Form' : 'Create Form')}
                </Button>
              )}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default React.memo(ExhibitorFormWizard);