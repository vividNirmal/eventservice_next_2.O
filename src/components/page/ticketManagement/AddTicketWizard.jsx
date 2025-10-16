"use client";
/**
 * TicketWizard - Unified component for both adding and editing tickets
 * 
 * Usage Examples:
 * 
 * // For creating a new ticket
 * <TicketWizard 
 *   isOpen={showAddDialog} 
 *   onClose={() => setShowAddDialog(false)} 
 *   onSuccess={handleTicketCreated} 
 * />
 * 
 * // For editing an existing ticket
 * <TicketWizard 
 *   isOpen={showEditDialog} 
 *   onClose={() => setShowEditDialog(false)} 
 *   onSuccess={handleTicketUpdated}
 *   editData={selectedTicket} 
 * />
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';

// Import hooks
import { useTicketForm } from './hooks/useTicketForm';
import { useImageUpload } from './hooks/useImageUpload';
import { useTicketAmount } from './hooks/useSlotAmounts';

// Import utils
import { validateStep } from './utils/validation';
import { fetchFormsByUserType, submitTicketData } from './utils/apiUtils';

// Import components
import StepIndicator from './components/StepIndicator';
import BasicInfoStep from './steps/BasicInfoStep';
import TicketAmountStep from './steps/TicketAmountStep';
import TicketSettingsStep from './steps/TicketSettingsStep';
import AdvancedSettingsStep from './steps/AdvancedSettingsStep';
import NotificationsStep from './steps/NotificationsStep';
import { getRequest } from '@/service/viewService';

import { toast } from 'sonner';

/**
 * TicketWizard Component Props:
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {function} onClose - Called when dialog should close
 * @param {function} onSuccess - Called after successful create/update
 * @param {object|null} editData - Ticket data for editing (null for create mode)
 */
const TicketWizard = ({ isOpen, onClose, onSuccess, editData = null, eventId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableForms, setAvailableForms] = useState([]);

  // Custom hooks
  const { formData, setFormData, isEditMode, errors, setErrors, handleInputChange, resetForm, initializeEditData } = useTicketForm(editData);
  const imageHandlers = useImageUpload(formData, setFormData);
  const ticketAmountHandlers = useTicketAmount(formData, setFormData);

  const [userTypes, setUserTypes] = useState([]);

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const companyId = localStorage.getItem("companyId");

        const params = new URLSearchParams({
          ...(companyId && { companyId })
        });

        const response = await getRequest(`user-types?${params}`);
        if (response.status === 1) {
          const types = Array.isArray(response.data)
            ? response.data
            : response.data?.items || response.data?.userTypes || [];
          setUserTypes(types);
        } else {
          setUserTypes([]);
        }
      } catch (error) {
        console.error("Error fetching user types:", error);
        toast.error("Failed to fetch user types");
        setUserTypes([]);
      }
    };

    fetchUserTypes();
  }, []);

  // Helper function to fetch forms
  const fetchForms = useCallback(async (userType) => {
    if (!eventId) {
      console.warn('No eventId found in TicketWizard');
      setAvailableForms([]);
      return;
    }
    await fetchFormsByUserType(userType, eventId, setAvailableForms);
  }, [eventId]);

  // Initialize edit data when editData is provided
  useEffect(() => {
    if (editData) {
      initializeEditData(editData, fetchForms);
    } else {
      resetForm();
      // Log companyId for debugging in development
      if (process.env.NODE_ENV === 'development') {
        const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;
        console.log('TicketWizard initialized with companyId:', companyId);
      }
    }
  }, [editData, initializeEditData, resetForm, fetchForms]);

  // Fetch forms when user type changes
  useEffect(() => {
    if (formData.userType) {
      fetchForms(formData.userType);
    }
  }, [formData.userType, fetchForms]);


  // const handleCrossRegisterCategoryToggle = useCallback((category) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     crossRegisterCategories: prev.crossRegisterCategories.includes(category)
  //       ? prev.crossRegisterCategories.filter(cat => cat !== category)
  //       : [...prev.crossRegisterCategories, category]
  //   }));
  // }, [setFormData]);

  // Cross register category toggle
  const handleCrossRegisterCategoryToggle = useCallback((category) => {
    setFormData(prev => ({
      ...prev,
      advancedSettings: {
        ...prev.advancedSettings,
        crossRegisterCategories: [
          ...(prev.advancedSettings.crossRegisterCategories || [])
        ].includes(category)
          ? prev.advancedSettings.crossRegisterCategories.filter(cat => cat !== category)
          : [...(prev.advancedSettings.crossRegisterCategories || []), category]
      }
    }));
  }, [setFormData]);

  // CTA toggle handler
  const handleCtaToggle = useCallback((cta) => {
    setFormData(prev => ({
      ...prev,
      ctaSettings: prev.ctaSettings?.includes(cta)
        ? prev.ctaSettings.filter(item => item !== cta)
        : [...(prev.ctaSettings || []), cta]
    }));
  }, [setFormData]);

  // CTA remove handler
  const handleCtaRemove = useCallback((cta) => {
    setFormData(prev => ({
      ...prev,
      ctaSettings: prev.ctaSettings?.filter(item => item !== cta)
    }));
  }, [setFormData]);

  // Step validation and navigation
  const validateCurrentStep = useCallback(() => {
    const stepErrors = validateStep(currentStep, formData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, formData, setErrors]);

  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error('Please fill in all required fields');
    }
  }, [validateCurrentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Form submission
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    const result = await submitTicketData(formData, isEditMode, editData, eventId);
    setLoading(false);

    if (result.success) {
      onSuccess();
      handleClose();
    }
  };

  // Save and close function for edit mode (steps 1-4)
  const handleSaveAndClose = async () => {
    // Validate current step before saving
    if (!validateCurrentStep()) {
      toast.error('Please complete all required fields in the current step');
      return;
    }

    // Validate all previous steps as well
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
    const result = await submitTicketData(formData, isEditMode, editData, eventId);
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

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            availableForms={availableForms}
            userTypes={userTypes}
          />
        );
      case 2:
        return (
          <TicketAmountStep
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            ticketAmountHandlers={ticketAmountHandlers}
          />
        );
      case 3:
        return (
          <TicketSettingsStep
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            imageHandlers={imageHandlers}
            handleCtaToggle={handleCtaToggle}
            handleCtaRemove={handleCtaRemove}
          />
        );
      case 4:
        return (
          <AdvancedSettingsStep
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            handleCrossRegisterCategoryToggle={handleCrossRegisterCategoryToggle}
          />
        );
      case 5:
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[96%] xl:!max-w-6xl max-h-[80vh] sm:max-h-[70vh] h-full gap-0 p-0">
        <DialogHeader className={'p-0 hidden'}>
          <DialogTitle></DialogTitle>
        </DialogHeader>

        <div className='flex flex-col sm:flex-row'>
          <div className='bg-zinc-50 border-r border-solid border-zinc-200 p-4 sm:p-6 lg:p-9 w-full sm:w-52 lg:w-64 rounded-t-lg sm:rounded-l-lg'>
            <StepIndicator currentStep={currentStep} setCurrentStep={setCurrentStep} validateStepBeforeChange={validateCurrentStep} />
          </div>
          <div className="min-h-[300px] sm:w-2/4 grow p-4 sm:p-6 flex flex-col gap-4">
            <div className='w-full bg-white pb-2'>
              <h3 className='text-base md:text-lg xl:text-xl font-bold mb-0 text-blue-600'>{isEditMode ? 'Edit Ticket' : 'Add Ticket'}</h3>
            </div>
            {renderStepContent()}
            <div className='flex flex-wrap justify-end gap-2'>
              <div className="flex space-x-2">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>

                {/* Save button for edit mode in steps 1-4 */}
                {isEditMode && currentStep < 5 && (
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

                {currentStep < 5 ? (
                  <Button onClick={nextStep}>
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>{loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Ticket' : 'Create Ticket')}</Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="hidden justify-between">
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(TicketWizard);
