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
import { ChevronRight, ChevronLeft } from 'lucide-react';

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
    return true;
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
      <DialogContent className="!max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Ticket' : 'Add Ticket'}
          </DialogTitle>
        </DialogHeader>

        <StepIndicator currentStep={currentStep} setCurrentStep={setCurrentStep} validateStepBeforeChange={validateCurrentStep} />

        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>

            {currentStep < 5 ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading
                  ? (isEditMode ? 'Updating...' : 'Creating...')
                  : (isEditMode ? 'Update Ticket' : 'Create Ticket')
                }
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(TicketWizard);
