import { useCallback } from 'react';

export const useSlotAmounts = (formData, setFormData) => {
  const handleSlotAmountChange = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      slotAmounts: prev.slotAmounts.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  }, [setFormData]);

  const addSlotAmount = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      slotAmounts: [...prev.slotAmounts, {
        startDateTime: null,
        endDateTime: null,
        amount: 0
      }]
    }));
  }, [setFormData]);

  const removeSlotAmount = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      slotAmounts: prev.slotAmounts.length > 1
        ? prev.slotAmounts.filter((_, i) => i !== index)
        : prev.slotAmounts
    }));
  }, [setFormData]);

  return {
    handleSlotAmountChange,
    addSlotAmount,
    removeSlotAmount
  };
};